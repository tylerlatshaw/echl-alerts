/**
 * @swagger
 * /api/league/get-new-transactions:
 *   get:
 *     summary: Scrape ECHL transactions, persist new ones, and optionally trigger push notifications
 *     tags:
 *       - League
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: force
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["1"]
 *         description: Force processing even if the page hash has not changed.
 *       - in: query
 *         name: sendPush
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["1"]
 *         description: If set to "1", triggers the internal push notification endpoint when new transactions are found.
 *     responses:
 *       200:
 *         description: Success (may still indicate no changes or no new rows).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Present when nothing actionable happened (e.g., no changes / no new rows).
 *                 meta:
 *                   type: object
 *                   properties:
 *                     changed:
 *                       type: boolean
 *                       description: Whether the stored hash differs from the current table hash.
 *                     forceUsed:
 *                       type: boolean
 *                       description: Whether force=1 was used.
 *                     sendPushUsed:
 *                       type: boolean
 *                       description: Whether sendPush=1 was used.
 *                     newTransactions:
 *                       type: integer
 *                       description: Count of new transactions found and persisted.
 *                     pushNotificationsSent:
 *                       type: integer
 *                       description: Count of push notifications successfully sent.
 *                 data:
 *                   type: array
 *                   description: Newly detected transactions (empty when none found).
 *                   items:
 *                     $ref: "#/components/schemas/Transaction"
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Unable to complete request
 *       500:
 *         description: Server error
 *
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Deterministic hash ID for the transaction.
 *         player:
 *           type: string
 *         team:
 *           type: string
 *         detail:
 *           type: string
 *         date:
 *           type: string
 *         seenAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - player
 *         - team
 *         - detail
 *         - date
 *         - seenAt
 */

import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import * as cheerio from "cheerio";
import { redis } from "./../../../lib/redis";
import { Transaction } from "@/app/lib/types";

const MAX_RECORDS = 1000;

export async function GET(req: NextRequest) {
    try {
        const apiKey = req.headers.get("x-api-key");

        if (apiKey !== process.env.INTERNAL_API_KEY) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const force = searchParams.get("force") === "1";
        const sendPush = searchParams.get("sendPush") === "1";

        /* ---------------------------------------
            Fetch page
        ---------------------------------------- */
        const res = await fetch("https://echl.com/transactions", {
            headers: { "user-agent": "echl-alerts-bot/1.0" },
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `Fetch failed ${res.status}` },
                { status: 502 }
            );
        }

        const html = await res.text();

        /* ---------------------------------------
            Hash check
        ---------------------------------------- */
        const currentHash = pageSha(html);
        const lastHash = await redis.get("last_hash");
        const changed = lastHash !== currentHash;

        if (!force && !changed) {
            return NextResponse.json({ message: "No changes" }, { status: 200 });
        }

        /* ---------------------------------------
            Parse transactions
        ---------------------------------------- */
        const txns = await parseTransactions(html);

        /* ---------------------------------------
            Load existing transaction IDs
        ---------------------------------------- */
        const existingIds = await loadExistingTxIds();
        const newTransactions: Transaction[] = [];

        for (const tx of txns) {
            if (tx.team !== "Reading Royals") continue;

            const id = txId(tx);
            if (existingIds.has(id)) continue;

            newTransactions.push({
                id,
                ...tx,
                seenAt: new Date().toISOString(),
            });

            existingIds.add(id); // safety within same run
        }

        const newCount = newTransactions.length;

        /* ---------------------------------------
            Page changed but no new rows → exit
        ---------------------------------------- */
        if (!force && newCount === 0) {
            await redis.set("last_hash", currentHash);
            return NextResponse.json(
                { message: "No new rows detected but page changed" },
                { status: 200 }
            );
        }

        /* ---------------------------------------
            Persist new transactions
        ---------------------------------------- */
        if (newCount > 0) {
            await redis.lpush(
                "tx:transactions",
                ...newTransactions.map((r) => JSON.stringify(r))
            );
            await redis.ltrim("tx:transactions", 0, MAX_RECORDS - 1);
        }

        /* ---------------------------------------
            Trigger push notifications (optional)
        ---------------------------------------- */
        let sent = 0;

        if (sendPush && newCount > 0) {
            const base =
                process.env.BASE_URL ||
                process.env.URL ||
                (process.env.NODE_ENV === "development" ? "http://localhost:3000" : null);

            if (!base) {
                throw new Error("No BASE_URL or URL configured for internal fetch");
            }
            const res = await fetch(
                `${base}/api/subscription/send-push-notifications?sendPush=${sendPush ? 1 : 0}`,
                {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        "x-internal-secret": process.env.INTERNAL_PUSH_SECRET!,
                        "x-api-key": process.env.INTERNAL_API_KEY!,
                    },
                    body: JSON.stringify({
                        transactions: newTransactions,
                    }),
                }
            );

            if (!res.ok) {
                console.error("Push route failed:", await res.text());
            } else {
                const json = await res.json();
                sent = json.pushSent ?? 0;
            }
        }

        /* ---------------------------------------
            Update page hash last
        ---------------------------------------- */
        await redis.set("last_hash", currentHash);
        return NextResponse.json(
            {
                meta: {
                    changed,
                    forceUsed: !!force,
                    sendPushUsed: sendPush,
                    newTransactions: newCount,
                    pushNotificationsSent: sent,
                },
                data: newTransactions,
            },
            { status: 200 }
        );
    } catch (e: unknown) {
        console.error("ERROR:", e);
        return new NextResponse(String(e), {
            status: 500,
            headers: { "content-type": "text/plain; charset=utf-8" },
        });
    }
}

/* ---------------------------------------
    Helper functions
---------------------------------------- */

function pageSha(html: string) {
    const $ = cheerio.load(html);

    const container = $("div[class*='@container/module-resolver']").first();
    if (!container.length) throw new Error("Transaction container not found");

    const table = container.find("table").first();
    if (!table.length) throw new Error("Transaction table not found");

    const tableHtml = table.html();

    return crypto.createHash("sha256").update(tableHtml!).digest("hex");
}

async function parseTransactions(html: string) {
    const $ = cheerio.load(html);
    const container = $("div[class*='@container/module-resolver']").first();
    if (!container.length) throw new Error("Transaction container not found");

    const table = container.find("table").first();
    if (!table.length) throw new Error("Transaction table not found");

    const rows = table.find("tbody tr");
    const out: any[] = [];

    rows.each((_, tr) => {
        const cells = $(tr).find("td");
        if (cells.length < 4) return;

        const player =
            clean($(cells[0]).find("a").first().text()) ||
            clean($(cells[0]).text());

        const team = clean(
            $(cells[1]).find("span.hidden.lg\\:inline").first().text()
        );

        const detail = clean($(cells[2]).text());
        const date = clean($(cells[3]).find("span").eq(1).text());

        if (!player || !team || !detail || !date) return;
        out.push({ player, team, detail, date });
    });

    if (out.length === 0) {
        throw new Error("Parsed 0 transactions — markup likely changed");
    }

    return out;
}

function clean(s: any) {
    return (s || "").replace(/\s+/g, " ").trim();
}

function txId(tx: any) {
    const raw = `${tx.date}|${tx.player}|${tx.team}|${tx.detail}`;
    return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

async function loadExistingTxIds(limit = MAX_RECORDS): Promise<Set<string>> {
    const raw = await redis.lrange("tx:transactions", 0, limit - 1);
    const ids = new Set<string>();

    for (const item of raw ?? []) {
        const rec = safeJsonParse<{ id?: string }>(item);
        if (rec?.id) ids.add(rec.id);
    }

    return ids;
}

function safeJsonParse<T = any>(v: unknown): T | null {
    try {
        if (v == null) return null;
        if (typeof v === "object") return v as T;
        return JSON.parse(String(v)) as T;
    } catch {
        return null;
    }
}