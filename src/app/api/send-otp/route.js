import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export async function POST(req) {
  const { email, location, phone, name } = await req.json();

  // สร้าง OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // สร้าง JWT token เก็บ otp และ email
  const token = jwt.sign({ email, otp, location, phone, name }, process.env.JWT_SECRET, { expiresIn: "5m" });
  console.log("token:", token);
  console.log("otp:", otp);
  

  // ส่ง OTP ทางอีเมล
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: "รหัส OTP สำหรับการลงทะเบียน",
    text: `รหัส OTP ของคุณคือ: ${otp}`,
  });

  // ส่ง token กลับ client (ไม่ต้องเก็บใน DB)
  return new Response(JSON.stringify({ token }), { status: 200 });
}
