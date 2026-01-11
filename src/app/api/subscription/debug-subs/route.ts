import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
    const subsMap = await redis.hgetall("subs");
    const values = subsMap ? Object.values(subsMap) : [];

    const parsed = values
        .map((v) => {
            try {
                if (!v) return null;
                if (typeof v === "object") return v;
                if (typeof v === "string") return JSON.parse(v);
                return JSON.parse(String(v));
            } catch {
                return null;
            }
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter(Boolean) as any[];

    // Only return safe fields
    return NextResponse.json({
        count: parsed.length,
        subs: parsed.map((s) => ({
            email: s.email,
            endpoint: s.subscription?.endpoint,
            hasKeys: !!s.subscription?.keys?.p256dh && !!s.subscription?.keys?.auth,
            isActive: s.isActive,
            createdAt: s.createdAt,
        })),
    });
}