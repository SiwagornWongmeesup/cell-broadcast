import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import User from '../../../../Models/user';

const MONGODB_URL = process.env.MONGODB_URL;

async function connectDB() {
  if (mongoose.connections[0].readyState === 1) return;
  await mongoose.connect(MONGODB_URL);
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { currentPwd, newPwd } = body;

    if (!currentPwd || !newPwd) {
      return NextResponse.json({ error: 'กรุณากรอกทุกช่อง' }, { status: 400 });
    }

    // หา user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
    }

    // ตรวจสอบรหัสผ่านเดิม
    const isMatch = await bcrypt.compare(currentPwd, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' }, { status: 400 });
    }

    // เข้ารหัสรหัสผ่านใหม่
    const hashedPwd = await bcrypt.hash(newPwd, 10);
    user.password = hashedPwd;
    await user.save();

    return NextResponse.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
