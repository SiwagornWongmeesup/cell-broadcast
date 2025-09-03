import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../Models/user";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req) {
  await connectMongoDB();

  const { email } = await req.json();
  const user = await User.findOne({ email });
  if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

  // สร้าง token
  const token = crypto.randomBytes(32).toString("hex");
  user.verificationToken = token;
  user.tokenExpiration = Date.now() + 24*60*60*1000; // 24 ชั่วโมง
  await user.save();

  // ส่ง email
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  const url = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    to: user.email,
    subject: "Verify your email",
    html: `<p>คลิก <a href="${url}">ที่นี่</a> เพื่อยืนยันบัญชีของคุณ</p>`
  });

  return new Response(JSON.stringify({ message: "Verification email sent" }), { status: 200 });
}
