import type { Handler } from "@netlify/functions";

export const handler: Handler = async () => {
    try {
        const baseUrl =
            process.env.BASE_URL ||
            process.env.URL ||
            "http://localhost:3000";

        const sendPush =
            process.env.SEND_PUSH === "0" ? "0" : "1";

        const url = `${baseUrl}/api/league/get-new-transactions?sendPush=${sendPush}`;

        const res = await fetch(url, {
            method: "GET",
            headers: {
                "user-agent": "netlify-cron/1.0",
                "x-api-key": process.env.INTERNAL_API_KEY!,
            },
        });

        const text = await res.text();
        console.log(text);

        return {
            statusCode: res.status,
            headers: {
                "content-type": "application/json",
            },
            body: text,
        };
    } catch (err: any) {
        console.error("Cron error:", err);

        return {
            statusCode: 500,
            body: JSON.stringify({
                ok: false,
                error: String(err?.message ?? err),
            }),
        };
    }
};