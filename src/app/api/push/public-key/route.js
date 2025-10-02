// app/api/push/public-key/route.js
import { VAPID_PUBLIC_KEY } from '../../../../../lib/push-keys';

export async function GET(req) {
  return new Response(JSON.stringify({ publicKey: VAPID_PUBLIC_KEY }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
