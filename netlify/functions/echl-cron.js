import crypto from "crypto";
import webpush from "web-push";
import { Redis } from "@upstash/redis";
import * as cheerio from "cheerio";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

const MAX_RECORDS = 1000;

function clean(s) {
    return (s || "").replace(/\s+/g, " ").trim();
}

function pageSha(html) {
    return crypto.createHash("sha256").update(html).digest("hex");
}

function txId(tx) {
    const raw = `${tx.date}|${tx.player}|${tx.team}|${tx.detail}`;
    return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

async function parseTransactions(html) {
    const $ = cheerio.load(html);

    // Target the container whose class includes "@container/module-resolver"
    const container = $('div[class*="@container/module-resolver"]').first();
    if (!container.length) {
        throw new Error('Transaction container not found (div[class*="@container/module-resolver"])');
    }

    const table = container.find("table").first();
    if (!table.length) {
        throw new Error("Transaction table not found under resolver container");
    }

    const rows = table.find("tbody tr");
    const out = [];

    rows.each((_, tr) => {
        const cells = $(tr).find("td");
        if (cells.length < 4) return;

        /* ---------------- Player ---------------- */
        const playerCell = $(cells[0]);
        const player =
            clean(playerCell.find("a").first().text()) ||
            clean(playerCell.text());

        /* ---------------- Team (LONG NAME ONLY) ---------------- */
        const teamCell = $(cells[1]);

        // Explicitly grab the full team name
        const team = clean(
            teamCell.find('span.hidden.lg\\:inline').first().text()
        );

        /* ---------------- Detail ---------------- */
        const detail = clean($(cells[2]).text());

        /* ---------------- Date ---------------- */
        const date = clean($(cells[3]).text());

        if (!player || !team || !detail || !date) return;

        out.push({ player, team, detail, date });
    });

    if (out.length === 0) {
        throw new Error("Parsed 0 transactions — markup may have changed");
    }

    return out;
}

async function loadSubscribers() {
    const subsMap = await redis.hgetall("subs");

    const list = subsMap ? Object.values(subsMap).map((v) => {
        try {
            if (v == null) return null;

            // If Upstash already gave an object, use it
            if (typeof v === "object") return v;

            // If it's a string, parse it (normal case)
            if (typeof v === "string") return JSON.parse(v);

            // Fallback: try parsing whatever it is
            return JSON.parse(String(v));
        } catch {
            return null;
        }
    }) : [];

    return list.filter((r) => r?.isActive !== false && r?.subscription?.endpoint);
}

async function sendPushToSubscriber(rec, payloadObj) {
    const sub = rec.subscription;
    const payload = JSON.stringify(payloadObj);

    try {
        await webpush.sendNotification(sub, payload);
        return true;
    } catch (err) {
        const status = err?.statusCode;
        
        if (status === 404 || status === 410) {
            await redis.hdel("subs", sub.endpoint);
        }
        return false;
    }
}

export async function handler(event) {
    try {
        // Optional manual trigger: add ?force=1 to always push
        const force = event?.queryStringParameters?.force === "1";

        const res = await fetch("https://echl.com/transactions", {
            headers: { "user-agent": "echl-alerts-bot/1.0" },
        });

        if (!res.ok) {
            return { statusCode: 502, body: `Fetch failed ${res.status}` };
        }

        const html = await res.text();
        const currentHash = pageSha(html);

        const lastHash = await redis.get("last_hash");
        const changed = lastHash !== currentHash;

        if (!force && !changed) {
            return { statusCode: 200, body: "No change" };
        }

        // store hash so it doesn't re-alert
        await redis.set("last_hash", currentHash);

        // Parse table rows
        const txns = await parseTransactions(html);

        // Insert new ones into Upstash (cap 1000)
        let newCount = 0;

        for (const tx of txns) {
            if (tx.team !== "Reading Royals") continue;

            const id = txId(tx);
            const exists = await redis.sismember("tx:seen", id);
            if (exists) continue;

            const record = {
                id,
                ...tx,
                seenAt: new Date().toISOString(),
            };

            await redis.lpush("tx:list", JSON.stringify(record));
            await redis.sadd("tx:seen", id);
            newCount++;
        }

        await redis.ltrim("tx:list", 0, MAX_RECORDS - 1);

        // If nothing new, you may still have a changed page (reorder/etc.)
        if (!force && newCount === 0) {
            return { statusCode: 200, body: "Changed but no new rows detected" };
        }

        // Notify subscribers
        const subs = await loadSubscribers();
        let sent = 0;

        for (const rec of subs) {
            const body =
                newCount > 0
                    ? `Hey ${rec.firstName}, ${newCount} new transaction(s). Tap to view.`
                    : `Hey ${rec.firstName}, transactions page changed. Tap to view.`;

            const ok = await sendPushToSubscriber(rec, {
                title: "ECHL Transactions Updated",
                body,
                url: "https://echl.com/transactions",
            });

            if (ok) sent++;
        }

        return {
            statusCode: 200,
            body: `Changed=${changed} force=${force} new=${newCount} notified=${sent}`,
        };
    } catch (e) {
        console.error("ECHL CRON ERROR:", e);

        return {
            statusCode: 500,
            headers: { "content-type": "text/plain; charset=utf-8" },
            body: `ERROR: ${e?.message || e}\n\nSTACK:\n${e?.stack || "(no stack)"}`,
        };
    }
}