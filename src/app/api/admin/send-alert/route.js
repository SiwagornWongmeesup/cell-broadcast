import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../api/auth/[...nextauth]/route';

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (mongoose.connections[0].readyState === 1) return;
  await mongoose.connect(MONGODB_URI);
}

const alertSchema = new mongoose.Schema({
  message: String,
  type: String,
  radius: Number,
  location: {
    lat: Number,
    lng: Number,
  },
  createdAt: Date,
});

const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);

export async function POST(req) {

  const session = await getServerSession(authOptions);
      console.log("API SESSION:", session); 

  const body = await req.json();
  const { message, type, radius, location } = body;

  if (!message || !location) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  await Alert.create({
    message,
    type,
    radius,
    location,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 ชั่วโมง
    readBy: [],
    dismissedBy: [],
  });

  return NextResponse.json({ success: true });
}
