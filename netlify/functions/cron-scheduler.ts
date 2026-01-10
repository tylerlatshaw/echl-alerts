export async function handler() {
    const base = process.env.BASE_URL;
    const res = await fetch(`${base}/api/echl-cron`, { method: "GET" });
    return { statusCode: 200, body: { message: "Pinged /api/echl-cron", response: await res.json() } };
}

// Netlify Scheduled Function
export const config = {
    schedule: "*/10 * * * *", // every 10 minutes
};