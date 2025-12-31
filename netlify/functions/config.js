export async function handler() {
  return {
    statusCode: 200,
    body: JSON.stringify({
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
    }),
  };
}