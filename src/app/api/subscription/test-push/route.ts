import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

function coerce(v: any) {
    try {
        if (!v) return null;
        if (typeof v === "object") return v;
        if (typeof v === "string") return JSON.parse(v);
        return JSON.parse(String(v));
    } catch {
        return null;
    }
}

export async function GET(req: NextRequest) {
    const email = new URL(req.url).searchParams.get("email")?.toLowerCase();
    if (!email) return new NextResponse("Missing email", { status: 400 });

    const subsMap = await redis.hgetall("subs");
    const records = (subsMap ? Object.values(subsMap) : []).map(coerce).filter(Boolean) as any[];

    const rec = records.find((r) => r.email?.toLowerCase() === email);
    if (!rec) return new NextResponse("Subscriber not found", { status: 404 });

    const payload = JSON.stringify({
        title: "✅ Test push",
        body: "If you see this, delivery + SW display are working.",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: "/" },
    });

    try {
        const result = await webpush.sendNotification(rec.subscription, payload);
        return NextResponse.json({ ok: true, statusCode: result.statusCode });
    } catch (err: any) {
        // This is the key — if delivery fails you WILL see why here.
        return NextResponse.json(
            { ok: false, message: String(err?.message ?? err), statusCode: err?.statusCode, body: err?.body },
            { status: 500 }
        );
    }
}
