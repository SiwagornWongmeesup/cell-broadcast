import { NextResponse } from 'next/server';
import Emergency from '../../../../../Models/Emergency';
import { connectMongoDB } from '../../../../../lib/mongodb';

export async function GET() {
  try {
    await connectMongoDB();
    const emergencies = await Emergency.find().sort({ createdAt: -1 });
    return NextResponse.json(emergencies);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลได้' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongoDB();
    const data = await req.json();
    const { name, phone, lat, lng, message } = data;

    if (!name || !phone || !lat || !lng) {
      return NextResponse.json({ error: 'กรอกข้อมูลไม่ครบ' }, { status: 400 });
    }

    // 1️⃣ บันทึกเป็นผู้ใช้ใหม่
    const newUser = await User.create({ name, phone, lat, lng, message });

    // 2️⃣ ลบคำขอหลังจากบันทึก
    await Emergency.deleteOne({ _id: data._id });

    return NextResponse.json({ success: true, user: newUser });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
