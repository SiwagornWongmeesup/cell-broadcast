import { connectMongoDB } from '../../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import User from '../../../../Models/user';

export async function POST(req) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return Response.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 });

    await connectMongoDB();

    const user = await User.findOne({ resetToken: token });
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry.getTime() < Date.now()) {
      return Response.json({ error: 'ลิงก์หมดอายุหรือไม่ถูกต้อง' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return Response.json({ message: 'รีเซ็ตรหัสผ่านเรียบร้อย' });
  } catch (err) {
    return Response.json({ error: 'เกิดข้อผิดพลาด', details: err.message }, { status: 500 });
  }
}
