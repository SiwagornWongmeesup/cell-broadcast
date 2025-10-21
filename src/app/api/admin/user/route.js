import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import User from "../../../../../Models/user";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

// GET users
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    // ดึง users ทั้งหมด ยกเว้น password และเรียงตามวันที่สร้างล่าสุด
    const users = await User.find({}, "-password").sort({ createdAt: -1 });

    return NextResponse.json({ users }); // ส่งไปเป็น object { users: [...] }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    await connectMongoDB();
    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: "ลบผู้ใช้สำเร็จ" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
