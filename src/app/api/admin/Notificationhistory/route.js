import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import Alert from "../../../../../Models/Alerts";
import mongoose from "mongoose";

// 🟩 GET: ดึงประวัติการแจ้งเตือนทั้งหมด
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !['user', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  try {
    await connectMongoDB(); // เชื่อมต่อ MongoDB ผ่าน Mongoose; 
    const role = session.user.role;  
    let alerts;                     
    if (role === 'user') {
        // สำหรับ user: ดึง alert ที่ยังไม่หมดอายุ
        const now = new Date();
        alerts = await Alert.find({ expiresAt: { $gt: now } }).sort({ createdAt: -1 });
      } else {
        // สำหรับ admin: ดึง alert ทั้งหมด
        alerts = await Alert.find().sort({ createdAt: -1 });
      }

    return NextResponse.json({ success: true, alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch alerts" }, { status: 500 });
  }
}

// 🟥 DELETE: ลบการแจ้งเตือนตาม id
export async function DELETE(request) {
    const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

    try {
        await connectMongoDB();
        const { id } = await request.json();
        if (!id) {
          return NextResponse.json({ success: false, message: "Missing alert ID" }, { status: 400 });
        }
    
        const result = await Alert.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
        if (result.deletedCount === 0) {
          return NextResponse.json({ success: false, message: "Alert not found" }, { status: 404 });
        }
    
        return NextResponse.json({ success: true, message: "Alert deleted successfully" });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return NextResponse.json({ success: false, message: "Failed to delete alert" }, { status: 500 });
  }
}
