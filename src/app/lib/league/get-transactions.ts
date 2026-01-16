import "server-only";
import { redis } from "@/app/lib/redis";
import type { Transaction } from "@/app/lib/types";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

function clampLimit(limit: number) {
    if (!Number.isFinite(limit) || limit < 1) return DEFAULT_LIMIT;
    return Math.min(limit, MAX_LIMIT);
}

function safeParseTransaction(v: unknown): Transaction | null {
    try {
        if (v == null) return null;

        if (typeof v === "string") return JSON.parse(v) as Transaction;

        if (typeof v === "object") return v as Transaction;

        return JSON.parse(String(v)) as Transaction;
    } catch {
        return null;
    }
}

export async function getTransactions(limit: number): Promise<Transaction[]> {
    const finalLimit = clampLimit(limit);

    try {
        const raw = await redis.lrange("tx:transactions", 0, finalLimit - 1);
        return (raw ?? [])
            .map(safeParseTransaction)
            .filter((x): x is Transaction => x !== null);
    } catch (e) {
        console.error("Error getting transactions", e);
        return [];
    }
}