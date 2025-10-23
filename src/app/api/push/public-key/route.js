export async function GET(req) {
  return new Response(JSON.stringify({ publicKey: process.env.VAPID_PUBLIC_KEY  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
