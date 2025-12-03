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

export async function DELETE(req) {
  try {
    await connectMongoDB();
    const data = await req.json();
    const { id } = data; // ส่ง _id ของข้อความที่ต้องการลบ

    if (!id) {
      return NextResponse.json({ error: 'กรุณาระบุ id ของข้อความ' }, { status: 400 });
    }

    const deleted = await Emergency.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'ไม่พบข้อความที่ต้องการลบ' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
