// /app/api/register/route.js

import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../Models/user";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { name, email, password, phone, location } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }

    console.log("Connecting to MongoDB...");
    await connectMongoDB();

    // ตรวจสอบอีเมลซ้ำ
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json({ message: "อีเมลนี้ถูกใช้แล้ว" }, { status: 400 });
    }

    // แฮชรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    const role = email.toLowerCase().trim() === 'admin@example.com' ? 'admin' : 'user';
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationUrl = `http://localhost:3000/verify?token=${verificationToken}`;

    console.log("Creating user in MongoDB...");
    await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone,
      location,
      role,
      verificationToken,
      isVerified: false
    });

    console.log("Setting up email transporter...");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    console.log("Sending verification email to:", email);
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "ยืนยันการสมัครสมาชิก",
      text: `กดลิงก์นี้เพื่อยืนยันบัญชีของคุณ: ${verificationUrl}`,
    });

    console.log("Registration successful for:", email);
    return NextResponse.json({ message: "ลงทะเบียนสำเร็จ กรุณาตรวจสอบอีเมล" }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);

    let msg = "เกิดข้อผิดพลาดขณะลงทะเบียน";

    // แยกประเภท error
    if (error.name === "MongoNetworkError") msg = "เชื่อมต่อ MongoDB ไม่สำเร็จ";
    if (error.response && error.response.code === "EAUTH") msg = "ส่งอีเมลไม่สำเร็จ ตรวจสอบ Gmail/รหัสผ่าน";

    return NextResponse.json({ message: msg, detail: error.message }, { status: 500 });
  }
}
