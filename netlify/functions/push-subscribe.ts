import { Redis } from "@upstash/redis";

type WebPushSubscription = {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
};

type SubscriberRecord = {
    subscription: WebPushSubscription;
    preferredTeams: string[];
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

function clean(s: any) {
    return (s || "").toString().trim();
}

function isEmail(s: any) {
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

export async function handler(event: any) {
    try {
        if (event.httpMethod !== "POST") {
            return { statusCode: 405, body: "Method not allowed" };
        }

        const body = JSON.parse(event.body || "{}");
        const { subscription, firstName, lastName, email } = body;

        if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
            return { statusCode: 400, body: "Invalid subscription" };
        }

        const fn = clean(firstName);
        const ln = clean(lastName);
        const em = clean(email).toLowerCase();

        if (!fn || !ln || !em || !isEmail(em)) {
            return { statusCode: 400, body: "Missing/invalid first name, last name, or email" };
        }

        const record = {
            subscription,     // the full push subscription object
            firstName: fn,
            lastName: ln,
            email: em,
            createdAt: new Date().toISOString(),
            isActive: true,
        };

        // Store as JSON string, dedup by endpoint
        await redis.hset("subs", {
            [subscription.endpoint]: JSON.stringify(record),
        });

        return { statusCode: 200, body: "OK" };
    } catch (e) {
        console.error("PUSH-SUBSCRIBE ERROR:", e);
        return {
            statusCode: 500,
            headers: { "content-type": "text/plain; charset=utf-8" },
            body: `ERROR: ${getErrorMessage(e)}\n\nSTACK:\n${getErrorStack(e)}`,
        };
    }
}