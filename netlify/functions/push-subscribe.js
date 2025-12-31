import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

function clean(s) {
    return (s || "").toString().trim();
}

function isEmail(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function handler(event) {
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
        return { statusCode: 500, body: e?.message || "Error" };
    }
}