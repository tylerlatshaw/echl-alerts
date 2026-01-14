/**
 * @swagger
 * /api/subscription/config:
 *   get:
 *     summary: Get push notification configuration
 *     tags:
 *       - Subscription
 *     operationId: getSubscriptionConfig
 *     responses:
 *       200:
 *         description: VAPID public key returned
 *         headers:
 *           cache-control:
 *             schema:
 *               type: string
 *             description: Always `no-store`
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [vapidPublicKey]
 *               properties:
 *                 vapidPublicKey:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Unable to complete request
 *       500:
 *         description: Server error
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
        return new NextResponse("Missing VAPID_PUBLIC_KEY", { status: 500 });
    }

    return NextResponse.json(
        { vapidPublicKey },
        { headers: { "cache-control": "no-store" } }
    );
}