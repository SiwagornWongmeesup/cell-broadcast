import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import Report from '../../../../Models/Report';

export async function GET() {
  try {
    await connectMongoDB();
    console.log("✅ MongoDB connected for GET");
    const alerts = await Report.find({}).sort({ createdAt: -1 });
    return NextResponse.json(alerts);
  } catch (error) {
    console.error("❌ ERROR in GET /api/user-alerts:", error);
    return NextResponse.json({ error: 'Failed to fetch', details: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongoDB();
    console.log("✅ MongoDB connected for POST");

    const formData = await req.formData();

    // log formData ที่ได้รับทั้งหมด
    console.log("All FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const file = formData.get('file');

    // log เฉพาะ field หลัก
    console.log("FormData received:", {
      title: formData.get('title'),
      details: formData.get('details'),
      lat: formData.get('lat'),
      lng: formData.get('lng'),
      file: file ? file.name : null,
    });

    const report = new Report({
      type: formData.get('title'),
      message: formData.get('details'),
      position: {
        lat: parseFloat(formData.get('lat')),
        lng: parseFloat(formData.get('lng')),
      },
      radius: 100,
      createdAt: new Date(),
    });

    // log object ก่อนบันทึก
    console.log("Report object before save:", JSON.stringify(report, null, 2));

    await report.save();

    console.log("✅ Report saved successfully");
    return NextResponse.json({ message: 'ส่งเรื่องเรียบร้อยแล้ว' });
  } catch (err) {
    console.error("❌ ERROR in POST /api/user-alerts:");
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);

    return NextResponse.json(
      { error: 'Failed to submit', details: err.message },
      { status: 500 }
    );
  }
}
