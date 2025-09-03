import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import Report from '../../../../Models/Report';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// ปิด body parsing ของ Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

// GET handler
export async function GET() {
  try {
    await connectMongoDB();
    const alerts = await Report.find({}).sort({ createdAt: -1 });
    return NextResponse.json(alerts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST handler 
export async function POST(req) {
  try {
    await connectMongoDB();

    const formData = await req.formData();
    const file = formData.get('file');
    let fileName = null;

    if (file) {
      fileName = file.name;
    }

    const report = new Report({
      userId: session?.user?.id || null, // ถ้าไม่มี session ก็เก็บเป็น null
      title: formData.get('title'),
      details: formData.get('details'),
      location: {
      lat: formData.location.lat,
      lng: formData.location.lng,
      address: formData.location.address
  },
      date: formData.get('date'),
      time: formData.get('time'),
      name: formData.get('name'),
      contact: formData.get('contact'),
      email: formData.get('email'),
      file: formData.get('file') ? formData.get('file').newFilename : null, // เก็บชื่อไฟล์
    });

    await report.save();
    return NextResponse.json({ message: 'ส่งเรื่องเรียบร้อยแล้ว' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  } 
}
