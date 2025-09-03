import Alert from '../../../../../Models/Alerts';
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";

export async function POST(req) {
  try {
    await connectMongoDB();
    const { alertId, userId } = await req.json();

    if (!alertId || !userId) {
      return NextResponse.json({ error: "Missing alertId or userId" }, { status: 400 });
    }

    // update dismissedBy
    await Alert.findByIdAndUpdate(alertId, {
      $addToSet: { dismissedBy: userId }, // addToSet ป้องกันไม่ให้ซ้ำ
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
