import * as crypto from "crypto";
import webpush from "web-push";
import { Redis } from "@upstash/redis";
import * as cheerio from "cheerio";

type StatusCodeError = {
    statusCode?: number;
};

type PushPayload = {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: {
        url?: string;
    };
};

type WebPushSubscription = {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
};

type SubscriberRecord = {
    subscription: WebPushSubscription;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    isActive: boolean;
};

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

const MAX_RECORDS = 1000;

function clean(s: any) {
    return (s || "").replace(/\s+/g, " ").trim();
}

function pageSha(html: any) {
    return crypto.createHash("sha256").update(html).digest("hex");
}

function txId(tx: any) {
    const raw = `${tx.date}|${tx.player}|${tx.team}|${tx.detail}`;
    return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return typeof err === "string" ? err : JSON.stringify(err);
}

function getErrorStack(err: unknown): string {
    if (err instanceof Error && err.stack) return err.stack;
    return "";
}

function getStatusCode(err: unknown): number | undefined {
    if (typeof err === "object" && err !== null && "statusCode" in err) {
        const sc = (err as StatusCodeError).statusCode;
        return typeof sc === "number" ? sc : undefined;
    }
    return undefined;
}

function isSubscriberRecord(v: unknown): v is SubscriberRecord {
    return (
        typeof v === "object" &&
        v !== null &&
        "subscription" in v &&
        typeof (v as any).firstName === "string" &&
        typeof (v as any).lastName === "string" &&
        typeof (v as any).email === "string"
    );
}

async function parseTransactions(html: any) {
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
    const out: any = [];

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
        const date = clean(
            $(cells[3]).find("span").eq(1).text()
        );

        if (!player || !team || !detail || !date) return;

        out.push({ player, team, detail, date });
    });

    if (out.length === 0) {
        throw new Error("Parsed 0 transactions — markup may have changed");
    }

    return out;
}

async function loadSubscribers(): Promise<SubscriberRecord[]> {
    const subsMap = await redis.hgetall("subs");

    const list: SubscriberRecord[] = (subsMap ? Object.values(subsMap) : [])
        .map((v): SubscriberRecord | null => {
            try {
                if (v == null) return null;
                if (typeof v === "object") return v as SubscriberRecord;
                if (typeof v === "string") return JSON.parse(v) as SubscriberRecord;
                return JSON.parse(String(v)) as SubscriberRecord;
            } catch {
                return null;
            }
        })
        .filter(isSubscriberRecord);

    return list;
}

export async function sendPushToSubscriber(
    rec: SubscriberRecord,
    payloadObj: PushPayload
): Promise<boolean> {
    const sub = rec.subscription;

    // Ensure metadata defaults
    const payload = JSON.stringify({
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: "/" },
        ...payloadObj,
    });

    try {
        await webpush.sendNotification(sub, payload);
        return true;
    } catch (err: unknown) {
        const status = getStatusCode(err);

        // Subscription is gone → clean it up
        if (status === 404 || status === 410) {
            console.log("Removing dead subscription:", rec.email);
            await redis.hdel("subs", sub.endpoint);
        } else {
            console.error("Push send failed:", err);
        }

        return false;
    }
}

export async function handler(event: any) {
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

        let newTransactions = [];

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

            newTransactions.push(record);

            await redis.lpush("tx:transactions", JSON.stringify(record));
            await redis.sadd("tx:seen", id);
            newCount++;
        }

        await redis.ltrim("tx:transactions", 0, MAX_RECORDS - 1);

        // If nothing new, you may still have a changed page (reorder/etc.)
        if (!force && newCount === 0) {
            return { statusCode: 200, body: "Changed but no new rows detected" };
        }

        // Notify subscribers
        const subs = await loadSubscribers();
        let sent = 0;

        for (const rec of subs) {
            const body =
                newCount > 1
                    ? `REA: ${newCount} new transactions. Tap to view.`
                    : newCount === 1
                        ? `${newTransactions[0].player} — ${newTransactions[0].detail}`
                        : `No new transactions (page changed). Tap to view.`;

            const ok = await sendPushToSubscriber(rec, {
                title: "🏒 REA: Transaction",
                body,
                data: {
                    url: "/"
                }
            });

            if (ok) sent++;
        }

        return {
            statusCode: 200,
            body: `Changed=${changed} force=${force} new=${newCount} notified=${sent}`,
        };
    } catch (e: unknown) {
        console.error("ECHL CRON ERROR:", e);

        return {
            statusCode: 500,
            headers: { "content-type": "text/plain; charset=utf-8" },
            body: `ERROR: ${getErrorMessage(e)}\n\nSTACK:\n${getErrorStack(e)}`,
        };
    }
}