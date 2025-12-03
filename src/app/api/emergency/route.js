import { NextResponse } from 'next/server';
import Emergency from '../../../../Models/Emergency';
import { connectMongoDB } from '../../../../lib/mongodb';

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
    await  connectMongoDB();
    const data = await req.json();
    const { name, phone, lat, lng, message } = data;

    if (!name || !phone || !lat || !lng) {
      return NextResponse.json({ error: "กรอกข้อมูลไม่ครบ" }, { status: 400 });
    }

    const newRequest = await Emergency.create({ name, phone, lat, lng, message });

    return NextResponse.json({ success: true, request: newRequest });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
