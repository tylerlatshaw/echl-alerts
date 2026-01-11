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