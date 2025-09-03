// pages/api/readAlert/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Alert from '../../../../../Models/Alerts';

export async function POST(req) {
  try {
    await connectMongoDB();

    const { userId, alertId } = await req.json();

    if (!userId || !alertId) {
      return NextResponse.json({ success: false, error: "userId หรือ alertId ไม่ถูกต้อง" });
    }

    // อัพเดตว่า userId นี้ได้อ่าน alert แล้ว
    const updatedAlert = await Alert.findByIdAndUpdate(
      alertId,
      { $addToSet: { readBy: userId } }, // addToSet ป้องกันซ้ำ
      { new: true } // คืนค่า document ล่าสุด
    );

    if (!updatedAlert) {
      return NextResponse.json({ success: false, error: "ไม่พบ alert" });
    }

    return NextResponse.json({ success: true, alert: updatedAlert });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
