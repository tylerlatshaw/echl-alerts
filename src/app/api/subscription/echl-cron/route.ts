import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import webpush from "web-push";
import * as cheerio from "cheerio";
import { redis } from "../../../lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StatusCodeError = { statusCode?: number };

type PushPayload = {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: { url?: string };
};

type WebPushSubscription = {
    endpoint: string;
    keys: { p256dh: string; auth: string };
};

type SubscriberRecord = {
    subscription: WebPushSubscription;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    isActive: boolean;
};

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

const MAX_RECORDS = 1000;

function clean(s: unknown) {
    return String(s ?? "").replace(/\s+/g, " ").trim();
}

function pageSha(html: string) {
    return crypto.createHash("sha256").update(html).digest("hex");
}

function txId(tx: { date: string; player: string; team: string; detail: string }) {
    const raw = `${tx.date}|${tx.player}|${tx.team}|${tx.detail}`;
    return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 24);
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

async function parseTransactions(html: string) {
    const $ = cheerio.load(html);

    const container = $("div[class*=\"@container/module-resolver\"]").first();
    if (!container.length) throw new Error("Transaction container not found");

    const table = container.find("table").first();
    if (!table.length) throw new Error("Transaction table not found");

    const rows = table.find("tbody tr");
    const out: Array<{ player: string; team: string; detail: string; date: string }> = [];

    rows.each((_, tr) => {
        const cells = $(tr).find("td");
        if (cells.length < 4) return;

        const playerCell = $(cells[0]);
        const player =
            clean(playerCell.find("a").first().text()) || clean(playerCell.text());

        const teamCell = $(cells[1]);
        const team = clean(teamCell.find("span.hidden.lg\\:inline").first().text());

        const detail = clean($(cells[2]).text());

        // second span only
        const date = clean($(cells[3]).find("span").eq(1).text());

        if (!player || !team || !detail || !date) return;
        out.push({ player, team, detail, date });
    });

    if (out.length === 0) throw new Error("Parsed 0 transactions — markup changed?");
    return out;
}

async function loadSubscribers(): Promise<SubscriberRecord[]> {
    const subsMap = await redis.hgetall("subs");
    const list = (subsMap ? Object.values(subsMap) : [])
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

    return list.filter((r) => r.isActive !== false && r.subscription?.endpoint);
}

async function sendPushToSubscriber(rec: SubscriberRecord, payloadObj: PushPayload) {
    const sub = rec.subscription;
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
        if (status === 404 || status === 410) {
            await redis.hdel("subs", sub.endpoint);
        } else {
            console.error("Push send failed:", err);
        }
        return false;
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const force = searchParams.get("force") === "1";

        const res = await fetch("https://echl.com/transactions", {
            headers: { "user-agent": "echl-alerts-bot/1.0" },
            cache: "no-store",
        });

        if (!res.ok) {
            return new NextResponse(`Fetch failed ${res.status}`, { status: 502 });
        }

        const html = await res.text();
        const currentHash = pageSha(html);

        const lastHash = await redis.get("last_hash");
        const changed = lastHash !== currentHash;

        if (!force && !changed) {
            return new NextResponse("No change", { status: 200 });
        }

        await redis.set("last_hash", currentHash);

        const txns = await parseTransactions(html);

        const newTransactions: any[] = [];
        let newCount = 0;

        for (const tx of txns) {
            if (tx.team !== "Fort Wayne Komets") continue;

            const id = txId(tx);
            const exists = await redis.sismember("tx:seen", id);
            if (exists) continue;

            const record = { id, ...tx, seenAt: new Date().toISOString() };
            newTransactions.push(record);

            await redis.lpush("tx:transactions", JSON.stringify(record));
            await redis.sadd("tx:seen", id);
            newCount++;
        }

        await redis.ltrim("tx:transactions", 0, MAX_RECORDS - 1);

        if (!force && newCount === 0) {
            return new NextResponse("Changed but no new rows detected", { status: 200 });
        }

        const subs = await loadSubscribers();
        let sent = 0;

        for (const rec of subs) {
            const body =
                newCount > 1
                    ? `REA: ${newCount} new transactions. Tap to view.`
                    : `${newTransactions[0].player} — ${newTransactions[0].detail}`;

            const ok = await sendPushToSubscriber(rec, {
                title: "🏒 REA: Transaction",
                body,
                data: { url: "/" },
            });

            if (ok) sent++;
        }
        return NextResponse.json(
            {
                Changed: changed,
                force: force,
                new: newCount,
                notified: sent,
                records: newTransactions
            },
            { headers: { "cache-control": "no-store" } }
        );
    } catch (e: unknown) {
        console.error("ECHL CRON ERROR:", e);
        const msg = e instanceof Error ? `${e.message}\n${e.stack ?? ""}` : String(e);
        return new NextResponse(msg, { status: 500 });
    }
}