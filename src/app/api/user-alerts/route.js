import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import Report from '../../../../Models/Report';
import { authOptions } from '../../api/auth/[...nextauth]/route'
import { getServerSession } from "next-auth/next";
import cloudinary from '../../../../lib/cloudinary';

export async function GET() {
  try {
    await connectMongoDB();
    const alerts = await Report.find({}).sort({ createdAt: -1 });
    return NextResponse.json(alerts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch', details: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongoDB();
    const session = await getServerSession(authOptions);

    const formData = await req.formData();
    const title = formData.get('title');
    const details = formData.get('details');
    const locationRaw = formData.get('location');
    const contact = formData.get('contact');
    const email = formData.get('email');
    const date = formData.get('date');
    const time = formData.get('time');
    const userId = formData.get('userId');
    const file = formData.get('file');

    let location = null;
    if (locationRaw) {
      try {
        location = JSON.parse(locationRaw);
      } catch (err) {
        console.error("Error parsing location:", err);
      }
    }

  let userName = "Guest"; // default
  let internalUserId = null;

  if (session?.user) {
    userName = session.user.name; // เอาชื่อจาก session
    internalUserId = session.user.id; // internal userId
}

    let fileUrl = null;

    if(file && file.size > 0) {
       const arrayBuffer = await file.arrayBuffer();
       const buffer = Buffer.from(arrayBuffer);
      // อัปโหลดไฟล์ไป Cloudinary
      const result = await cloudinary.uploader.upload(
        "data:image/png;base64," + buffer.toString("base64"),
        { folder: 'user_alerts' }
      );
      fileUrl = result.secure_url;
    }

    let address = { province: null, district: null };
    if (location?.lat && location?.lng) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lng}&format=json&accept-language=th`
        );
        const data = await res.json();
        address = {
          province: data.address?.state || data.address?.province || null,
          district: data.address?.suburb || data.address?.county || data.address?.town || null,
        };
      } catch (error) {
        console.error("Reverse geocoding error:", error);
      }
    }


    const report = new Report({
      title,
      details,
      location: location || { lat: null, lng: null },
      address,
      userId: internalUserId,
      name: userName,
      contact: contact || null,
      email: email || null,
      date: date || null,
      time: time || null,
      file: file ? fileUrl : null,
      createdAt: new Date(),
    });

    await report.save();

    return NextResponse.json({ message: '✅ ส่งเรื่องเรียบร้อยแล้ว' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to submit', details: err.message }, { status: 500 });
  }
}