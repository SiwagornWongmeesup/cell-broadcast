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
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // ระยะทาง (เมตร)
}

// ฟังก์ชันส่งอีเมลแจ้งเตือน พร้อมคู่มือและวันที่
async function SendAlertEmail(message, type, location, createdAt, radius) {
  // แปลง radius เป็นเมตรถ้าเล็กกว่า 100 (สมมติหน่วยเป็น km)
  let adjustedRadius;
  if (radius < 1) {
    adjustedRadius = radius * 1000; // km -> m
  } else {
    adjustedRadius = radius;
  }

  // กำหนด minimum radius เผื่อใกล้ ๆ กันมาก ๆ
  const MIN_RADIUS = 50; // 50 เมตร
  adjustedRadius = Math.max(adjustedRadius, MIN_RADIUS);

  const users = await User.find({ lat: { $exists: true }, lng: { $exists: true } });

  const nearbyUsers = users.filter(user => {
    const distance = getDistance(location.lat, location.lng, user.lat, user.lng);
    console.log(`User: ${user.email}, Distance: ${distance.toFixed(1)}m, Radius: ${adjustedRadius}m`);
    return distance <= adjustedRadius;
  });

  const recipients = nearbyUsers.map(u => u.email).filter(Boolean);

  if (!recipients.length) {
    console.log('⚠️ ไม่มีผู้ใช้ใกล้พอที่จะส่งอีเมล');
    return;
  }

  const alertTime = createdAt
    ? new Date(createdAt).toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
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

  console.log(`✅ ส่งอีเมลไปยัง: ${recipients.join(', ')}`);}

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

    // สร้าง alert ใน MongoDB
    const alert = await Alert.create({
      message,
      type,
      radius,
      location : { lat: location.lat, lng: location.lng },  
      fileUrl: fileUrl || null, 
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      readBy: [],
      dismissedBy: [],
    });

    // ถ้าเลือกส่งอีเมล
    if (sendEmail) {
      try {
        await SendAlertEmail(message, type, location, radius, alert.createdAt);
      } catch (emailErr) {
        console.error('Error sending alert email:', emailErr);
      }
    }

    return NextResponse.json({ success: true, alert });
  } catch (err) {
    console.error('POST /api/admin/send-alert error:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
