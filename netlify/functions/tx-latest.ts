import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

function coerceRecord(v: any) {
  try {
    if (v == null) return null;

    // Upstash may already return an object
    if (typeof v === "object") return v;

    // Normal case: JSON string
    if (typeof v === "string") return JSON.parse(v);

    // Fallback
    return JSON.parse(String(v));
  } catch {
    return null;
  }
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
    if (event.httpMethod !== "GET") {
      return { statusCode: 405, body: "Method not allowed" };
    }

    const qs = event.queryStringParameters || {};
    let limit = parseInt(qs.limit || DEFAULT_LIMIT, 10);
    if (Number.isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    const raw = await redis.lrange("tx:transactions", 0, limit - 1);
    const records = (raw || []).map(coerceRecord).filter(Boolean);

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
      body: JSON.stringify({ count: records.length, limit, data: records }),
    };
  } catch (e) {
    console.error("TX-LATEST ERROR:", e);
    return {
      statusCode: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
      body: `ERROR: ${getErrorMessage(e)}\n\nSTACK:\n${getErrorStack(e)}`,
    };
  }
}
