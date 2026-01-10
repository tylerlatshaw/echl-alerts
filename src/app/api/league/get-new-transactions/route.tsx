// import { redis } from "@/app/lib/redis";
// import { Transaction } from "@/app/lib/types";
// import { NextRequest, NextResponse } from "next/server";

export async function GET() {
// export async function GET(req: NextRequest) {
    // try {

    //     const { searchParams } = new URL(req.url);
    //     const force = searchParams.get("force");

    //     const res = await fetch("https://echl.com/transactions", {
    //         headers: { "user-agent": "echl-alerts-bot/1.0" },
    //     });

    //     if (!res.ok) {
    //         return { statusCode: 502, body: `Fetch failed ${res.status}` };
    //     }

    //     const html = await res.text();
    //     // const currentHash = pageSha(html);

    //     const lastHash = await redis.get("last_hash");
    //     // const changed = lastHash !== currentHash;

    //     if (!force && !changed) {
    //         return { statusCode: 200, body: "No change" };
    //     }

    //     // store hash so it doesn't re-alert
    //     await redis.set("last_hash", currentHash);

    //     return NextResponse.json({ data: res }, { status: 200 });

    // } catch (e: unknown) {
    //     console.error("ERROR:", e);
    //     return new NextResponse(String(e), {
    //         status: 500,
    //         headers: { "content-type": "text/plain; charset=utf-8" },
    //     });
    // }
}