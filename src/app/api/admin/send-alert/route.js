import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import Alert from '../../../../../Models/Alerts';
import User from '../../../../../Models/user';
import Nodemailer from 'nodemailer';
import { disasterRecommendations } from '../../../components/Data/disasterData';

const MONGODB_URL = process.env.MONGODB_URL;

// เชื่อมต่อ MongoDB
async function connectDB() {
  if (mongoose.connections[0].readyState === 1) return;
  await mongoose.connect(MONGODB_URL);
}

// ฟังก์ชันส่งอีเมลแจ้งเตือน
// ฟังก์ชันส่งอีเมลแจ้งเตือน (ไม่กรองระยะทาง)
async function sendAlertEmail(message, type, location, createdAt) {
  // ดึงผู้ใช้ที่มี lat/lng และ email
  const users = await User.find({ lat: { $exists: true }, lng: { $exists: true } });
  const recipients = users.map(u => u.email).filter(Boolean);

  if (!recipients.length) return;

  const alertTime = createdAt
    ? new Date(createdAt).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '';

  const disasterData = disasterRecommendations[type];
  let stepsText = '';
  if (disasterData) {
    stepsText = disasterData.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
  }

  const transporter = Nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: recipients.join(','),
    subject: `[Alert] ${type}`,
    text: `${message}
Location: ${location.lat}, ${location.lng}
เวลาแจ้งเตือน: ${alertTime}
คู่มือการรับมือ:
${stepsText}`,
  });
}


// Main POST handler
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { message, type, radius, location, fileUrl, sendEmail } = body;

    if (!message || !location) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // แปลง radius หากน้อยกว่า 100 ถือว่าเป็น km
    const adjustedRadius = radius < 100 ? radius * 1000 : radius;

    // สร้าง alert ใน MongoDB
    const alert = await Alert.create({
      message,
      type,
      radius: adjustedRadius,
      location: {
        lat: location.lat,
        lng: location.lng,
      },
      fileUrl: fileUrl || null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // หมดอายุ 24 ชั่วโมง
      readBy: [],
      dismissedBy: [],
    });

    // ถ้าเลือกส่งอีเมล
    if (sendEmail) {
      try {
        await sendAlertEmail(message, type, location, adjustedRadius, alert.createdAt);
      } catch (emailErr) {
        console.error('Error sending alert email:', emailErr);
      }
    }

    return NextResponse.json({ success: true, alert });
  } catch (err) {
    console.error('POST /api/admin/send-alert error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
