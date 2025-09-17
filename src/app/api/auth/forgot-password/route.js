import {connectMongoDB} from '../../../../../lib/mongodb';
import User from '../../../../../Models/user';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req) {
  const { email } = await req.json();
  if (!email) return Response.json({ error: 'กรุณากรอกอีเมล' }, { status: 400 });

  await connectMongoDB(); // reuse connection

  // query ผ่าน Model
  const user = await User.findOne({ email });
  if (!user) return Response.json({ error: 'ไม่พบผู้ใช้นี้' }, { status: 404 });

  // สร้าง token และกำหนดเวลาหมดอายุ
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = Date.now() + 3600000; // 1 ชม.

  // update ผ่าน Model
  user.resetToken = resetToken;
  user.resetTokenExpiry = resetTokenExpiry;
  await user.save();

  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

  // ส่งอีเมล
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'รีเซ็ตรหัสผ่าน Cell Broadcast',
    html: `คลิก <a href="${resetLink}">ที่นี่</a> เพื่อรีเซ็ตรหัสผ่าน (หมดอายุ 1 ชั่วโมง)`,
  });

  return Response.json({ message: 'ส่งอีเมลรีเซ็ตรหัสผ่านเรียบร้อย' });
}