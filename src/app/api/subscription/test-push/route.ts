/**
 * @swagger
 * /api/subscription/test-push:
 *   get:
 *     summary: Send a test web push notification to a subscriber
 *     tags:
 *       - Subscription
 *     security:
 *       - ApiKeyAuth: []
 *     operationId: testPush
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Subscriber email to target (case-insensitive).
 *     responses:
 *       200:
 *         description: Push sent successfully (request accepted by push service)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [ok, statusCode]
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: number
 *                   description: HTTP status code returned by the push service.
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Unable to complete request
 *       500:
 *         description: Server error
 */

import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { redis } from "@/app/lib/redis";
import { SubscribeBody } from "@/app/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function GET(req: NextRequest) {
    const apiKey = req.headers.get("x-api-key");

    if (apiKey !== process.env.INTERNAL_API_KEY) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const email = new URL(req.url).searchParams.get("email")?.toLowerCase();
    if (!email) return new NextResponse("Missing email", { status: 400 });

    const existing: SubscribeBody[] = await redis.lrange("push:subs", 0, -1);

    const rec = existing.find((r) => r.email?.toLowerCase() === email);
    if (!rec) return new NextResponse("Subscriber not found", { status: 404 });

    const payload = JSON.stringify({
        title: "✅ Test push",
        body: "If you see this, delivery + SW display are working.",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        data: { url: "/" },
    });

    try {
        const result = await webpush.sendNotification(rec.subscription, payload);
        return NextResponse.json({ ok: true, statusCode: result.statusCode });
    } catch (err: any) {
        return NextResponse.json(
            { ok: false, message: String(err?.message ?? err), statusCode: err?.statusCode, body: err?.body },
            { status: 500 }
        );
    }
}
