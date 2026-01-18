/**
 * @swagger
 * /api/debug/sentry-test:
 *   get:
 *     summary: Trigger a controlled Sentry error (production smoke test)
 *     tags:
 *       - Debug
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: trigger
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["1"]
 *         description: When "1", throws an intentional error for Sentry validation.
 *     responses:
 *       200:
 *         description: Endpoint reachable (no error triggered).
 *       401:
 *         description: Missing or invalid API key.
 *       500:
 *         description: Intentional error thrown to validate Sentry.
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const apiKey = req.headers.get("x-api-key");

    if (apiKey !== process.env.INTERNAL_API_KEY) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(req.url);
    const trigger = searchParams.get("trigger");

    if (trigger === "1") {
        throw new Error("Sentry production smoke test (intentional)");
    }

    return NextResponse.json({
        ok: true,
        message: "Sentry test endpoint is live. No error triggered.",
        howToTrigger: "Call with ?trigger=1 and a valid x-api-key header.",
    });
}
