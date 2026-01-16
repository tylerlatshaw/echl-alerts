/**
 * @swagger
 * /api/subscription/send-push-notifications:
 *   post:
 *     summary: Send push notifications to all active subscribers for new transactions
 *     tags:
 *       - Subscription
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: sendPush
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["1"]
 *         description: When "1", pushes are sent. Otherwise the route returns ok=true with pushSent=0.
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
 *                 items:
 *                   $ref: "#/components/schemas/Transaction"
 *     responses:
 *       200:
 *         description: Push attempt completed (successfully or skipped).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - ok
 *                 - pushSent
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 pushSent:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Unable to complete request
 *       500:
 *         description: Server error
 */

import { NextRequest, NextResponse } from "next/server";
import * as webpush from "web-push";
import { redis } from "@/app/lib/redis";
import type { Transaction } from "@/app/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StatusCodeError = { statusCode?: number };

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

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const apiKey = req.headers.get("x-api-key");

        if (apiKey !== process.env.INTERNAL_API_KEY) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const secret = req.headers.get("x-internal-secret");
        if (secret !== process.env.INTERNAL_PUSH_SECRET) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const sendPush = searchParams.get("sendPush") === "1";

        const body = await req.json();
        const transactions: Transaction[] = body?.transactions ?? [];

        if (!Array.isArray(transactions)) {
            return new NextResponse("Invalid payload", { status: 400 });
        }

        if (!sendPush || transactions.length === 0) {
            return NextResponse.json({
                ok: true,
                pushSent: 0,
                message: sendPush
                    ? "No transactions to notify"
                    : "Push disabled via sendPush=0",
            });
        }

        const subs = await loadSubscribers();
        let sent = 0;

        const count = transactions.length;
        const bodyText =
            count > 1
                ? `${count} new transactions. Tap to view.`
                : `${transactions[0].player} — ${transactions[0].detail}`;

        for (const rec of subs) {
            const ok = await sendPushToSubscriber(rec, {
                title: "🏒 REA: Transaction",
                body: bodyText,
                data: { url: "/" },
            });

            if (ok) sent++;
        }

        return NextResponse.json({
            ok: true,
            pushSent: sent,
        });
    } catch (err) {
        console.error("PUSH ROUTE ERROR:", err);
        return new NextResponse("Internal error", { status: 500 });
    }
}

/* ---------------------------------------
    Helper functions
---------------------------------------- */

async function loadSubscribers(): Promise<SubscriberRecord[]> {
    const subsMap = await redis.hgetall("subs");

    return (subsMap ? Object.values(subsMap) : [])
        .map((v) => {
            try {
                return typeof v === "string" ? JSON.parse(v) : v;
            } catch {
                return null;
            }
        })
        .filter(Boolean) as SubscriberRecord[];
}

async function sendPushToSubscriber(
    rec: SubscriberRecord,
    payloadObj: {
        title: string;
        body: string;
        data?: { url?: string };
    }
): Promise<boolean> {
    const payload = JSON.stringify({
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: "/" },
        ...payloadObj,
    });

    try {
        await webpush.sendNotification(rec.subscription, payload);
        return true;
    } catch (err: unknown) {
        const status = getStatusCode(err);

        if (status === 404 || status === 410) {
            await redis.hdel("subs", rec.subscription.endpoint);
        } else {
            console.error("Push failed:", err);
        }
        return false;
    }
}

function getStatusCode(err: unknown): number | undefined {
    if (typeof err === "object" && err && "statusCode" in err) {
        return (err as StatusCodeError).statusCode;
    }
}