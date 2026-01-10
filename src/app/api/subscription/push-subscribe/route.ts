import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function clean(s: unknown) {
    return String(s ?? "").trim();
}

function isEmail(s: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return typeof err === "string" ? err : JSON.stringify(err);
}

function getErrorStack(err: unknown): string {
    if (err instanceof Error && err.stack) return err.stack;
    return "";
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));

        const subscription = body?.subscription as WebPushSubscription | undefined;
        const firstName = body?.firstName;
        const lastName = body?.lastName;
        const email = body?.email;

        if (
            !subscription?.endpoint ||
            !subscription?.keys?.p256dh ||
            !subscription?.keys?.auth
        ) {
            return new NextResponse("Invalid subscription", { status: 400 });
        }

        const fn = clean(firstName);
        const ln = clean(lastName);
        const em = clean(email).toLowerCase();

        if (!fn || !ln || !em || !isEmail(em)) {
            return new NextResponse("Missing/invalid first name, last name, or email", {
                status: 400,
            });
        }

        const record: SubscriberRecord = {
            subscription,
            firstName: fn,
            lastName: ln,
            email: em,
            createdAt: new Date().toISOString(),
            isActive: true,
        };

        // Store as JSON string, dedupe by endpoint
        await redis.hset("subs", {
            [subscription.endpoint]: JSON.stringify(record),
        });

        return NextResponse.json({ ok: true });
    } catch (e: unknown) {
        console.error("PUSH-SUBSCRIBE ERROR:", e);

        return new NextResponse(
            `ERROR: ${getErrorMessage(e)}\n\nSTACK:\n${getErrorStack(e)}`,
            { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } }
        );
    }
}

// Optional: fail fast for other methods
export async function GET() {
    return new NextResponse("Method not allowed", { status: 405 });
}
