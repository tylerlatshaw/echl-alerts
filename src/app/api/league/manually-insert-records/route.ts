/**
 * @swagger
 * /api/league/manually-insert-records:
 *   post:
 *     summary: Add new league transactions
 *     description: >
 *       Accepts a list of transaction records, de-duplicates them using a
 *       computed hash, and stores only new transactions.
 *     tags:
 *       - League
 *     security:
 *       - ApiKeyAuth: []
 *     operationId: addLeagueTransactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactions
 *             properties:
 *               transactions:
 *                 type: array
 *                 description: List of transactions to add
 *                 items:
 *                   $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: Transactions processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   type: object
 *                   properties:
 *                     transactionsSent:
 *                       type: integer
 *                       description: Number of transactions received
 *                     transactionsAdded:
 *                       type: integer
 *                       description: Number of new transactions added
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Unable to complete request
 *       500:
 *         description: Server error
 */

import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { redis } from "../../../lib/redis";
import { Transaction } from "@/app/lib/types";

const MAX_RECORDS = 1000;

export async function POST(req: NextRequest) {
    try {
        const apiKey = req.headers.get("x-api-key");

        if (apiKey !== process.env.INTERNAL_API_KEY) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json().catch(() => ({}));

        const transactions = body?.transactions as Transaction[] | undefined;

        if (!transactions)
            return NextResponse.json(
                { message: "No transactions to add" },
                { status: 200 }
            );

        /* ---------------------------------------
            Load existing transaction IDs
        ---------------------------------------- */
        const existingIds = await loadExistingTxIds();
        const newTransactions: Transaction[] = [];

        for (const tx of transactions) {
            const id = txId(tx);
            if (existingIds.has(id)) continue;

            newTransactions.push({
                ...tx,
                id,
                seenAt: new Date().toISOString(),
            });

            existingIds.add(id); // safety within same run
        }

        /* ---------------------------------------
            Add transactions
        ---------------------------------------- */

        const res = await addTransactions(newTransactions);

        return NextResponse.json(
            {
                meta: {
                    transactionsSent: transactions.length,
                    transactionsAdded: res.length,
                },
                data: res,
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

async function addTransactions(transactions: Transaction[]) {

    await redis.lpush(
        "tx:transactions",
        ...transactions.map((r) => JSON.stringify(r))
    );
    await redis.ltrim("tx:transactions", 0, MAX_RECORDS - 1);

    return transactions;
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

function txId(tx: any) {
    const raw = `${tx.date}|${tx.player}|${tx.team}|${tx.detail}`;
    return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 24);
}