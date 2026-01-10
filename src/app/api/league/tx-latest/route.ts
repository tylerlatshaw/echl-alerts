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