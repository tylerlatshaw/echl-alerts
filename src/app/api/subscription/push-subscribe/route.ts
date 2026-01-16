import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";
import { SubscribeBody } from "@/app/lib/types";

function normalizeEmail(email: string) {
    return String(email || "").trim().toLowerCase();
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as SubscribeBody;

        const firstName = String(body.firstName || "").trim();
        const lastName = String(body.lastName || "").trim();
        const email = normalizeEmail(body.email);

        const sub = body.subscription;
        const endpoint = String(sub?.endpoint || "").trim();
        const p256dh = String(sub?.keys?.p256dh || "").trim();
        const auth = String(sub?.keys?.auth || "").trim();

        if (!firstName || !lastName || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Basic email sanity check (not perfect, but fine)
        if (!email.includes("@") || email.length < 5) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }

        if (!endpoint || !p256dh || !auth) {
            return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
        }

        const record = {
            subscription: { endpoint, keys: { p256dh, auth } },
            firstName,
            lastName,
            email,
            createdAt: new Date().toISOString(),
            isActive: true,
            userAgent: req.headers.get("user-agent") ?? "",
        };

        const existing: SubscribeBody[] = await redis.lrange("push:subs", 0, -1);

        const alreadyExists = existing.some(
            (r) => r.subscription.endpoint === endpoint
        );

        if (!alreadyExists) {
            await redis.rpush("push:subs", record);
            return NextResponse.json({
                data: {
                    added: false
                }
            }, { status: 200 });
        }

        return NextResponse.json({
            data: {
                added: true
            }
        }, { status: 200 });
    } catch (e) {
        console.error("push-subscribe error:", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}