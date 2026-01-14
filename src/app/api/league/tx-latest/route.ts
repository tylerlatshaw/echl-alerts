/**
 * @swagger
 * /api/league/tx-latest:
 *   get:
 *     summary: Get latest league transactions
 *     tags:
 *       - League
 *     operationId: getLatestTransactions
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Max number of transactions to return
 *     responses:
 *       200:
 *         description: Transactions returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Total number of transactions returned
 *                 limit:
 *                   type: integer
 *                   description: Limit applied to the query
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique transaction ID
 *                       player:
 *                         type: string
 *                         description: Player name and position
 *                       team:
 *                         type: string
 *                         description: Team name
 *                       detail:
 *                         type: string
 *                         description: Transaction detail (e.g. Added, Released)
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: Effective transaction date
 *                       seenAt:
 *                         type: string
 *                         format: date-time
 *                         description: When the transaction was first recorded
 *                     required:
 *                       - id
 *                       - player
 *                       - team
 *                       - detail
 *                       - date
 *                       - seenAt
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Unable to complete request
 *       500:
 *         description: Server error
 */


import { NextRequest, NextResponse } from "next/server";
import { redis } from "../../../lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

function coerceRecord(v: unknown) {
    try {
        if (v == null) return null;
        if (typeof v === "object") return v;
        if (typeof v === "string") return JSON.parse(v);
        return JSON.parse(String(v));
    } catch {
        return null;
    }
}

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return typeof err === "string" ? err : JSON.stringify(err);
}

function getErrorStack(err: unknown): string {
    if (err instanceof Error && err.stack) return err.stack;
    return "";
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        let limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10);
        if (Number.isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
        if (limit > MAX_LIMIT) limit = MAX_LIMIT;

        const raw = await redis.lrange("tx:transactions", 0, limit - 1);
        const records = (raw || []).map(coerceRecord).filter(Boolean);

        return NextResponse.json(
            { count: records.length, limit, data: records },
            { headers: { "cache-control": "no-store" } }
        );
    } catch (e: unknown) {
        return new NextResponse(
            `ERROR: ${getErrorMessage(e)}\n\nSTACK:\n${getErrorStack(e)}`,
            { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } }
        );
    }
}