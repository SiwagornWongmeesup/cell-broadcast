// app/api/checkUser/route.js

import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../Models/user";

export async function POST(request) {
  try {
    await connectMongoDB(); // เชื่อมต่อ MongoDB
    const { email } = await request.json(); // ดึงอีเมลจาก request body
    console.log("Checking email in DB:", email);
    const user = await User.findOne({ email }).select("_id"); // ค้นหาผู้ใช้
    console.log("Found user:", user);

    console.log("User:", user); // สำหรับ Debugging

    // *** ส่วนนี้จะทำงานเมื่อโค้ดใน try block สำเร็จ ***
    return NextResponse.json({ user });

  } catch (error) {
    console.error("Error in checkUser API:", error); 

    // ต้อง Return Response กลับไปเมื่อเกิดข้อผิดพลาด
    return NextResponse.json(
      { message: "An error occurred while checking user existence.", error: error.message },
      { status: 500 } // ส่งสถานะ 500 Internal Server Error
    );
  }
}