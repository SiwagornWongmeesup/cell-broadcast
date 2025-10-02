import webpush from 'web-push';
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } from '../../../../../lib/push-keys';
import { connectMongoDB } from '../../../../../lib/mongodb';

webpush.setVapidDetails(
  'mailto:s66122202053@ssru.ac.th',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export async function POST(req) {
  const { db } = await connectMongoDB();
  const subscription = await req.json();

  // เก็บ subscription ลง MongoDB
  await db.collection('subscriptions').updateOne(
    { endpoint: subscription.endpoint },
    { $set: subscription },
    { upsert: true }
  );

  return new Response(JSON.stringify({ message: 'Subscribed!' }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ฟังก์ชันส่ง push notification
export async function sendPush(title, body) {
  const { db } = await connectMongoDB();
  const subscriptions = await db.collection('subscriptions').find({}).toArray();

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, JSON.stringify({ title, body }));
    } catch (err) {
      console.error('Push error', err);
    }
  }
}
