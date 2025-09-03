import { connectMongoDB } from "../../../../lib/mongodb";
import jwt from "jsonwebtoken";


export async function POST(req) {
  try {
    await connectMongoDB();
    const { token, otp, password } = await req.json();

    if (!token || !otp) {
      return new Response(JSON.stringify({ message: "Token หรือ OTP หายไป" }), { status: 400 });
    }

    // decode token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return new Response(JSON.stringify({ message: "Token ไม่ถูกต้องหรือหมดอายุ" }), { status: 401 });
    }

    // ตรวจ OTP
    if (decoded.otp !== otp) {
      return new Response(JSON.stringify({ message: "OTP ไม่ถูกต้อง" }), { status: 400 });
    }

    if (!decoded.name || !decoded.email || !password || !decoded.location || !decoded.phone) {
      console.log("decoded:", decoded);
      console.log("password:", password);
      return new Response(JSON.stringify({ message: "ข้อมูลไม่ครบ (name, email, password, location, phone)" }), { status: 400 });
    }
    return new Response(JSON.stringify({ message: "OTP ถูกต้อง, สร้างผู้ใช้เรียบร้อยแล้ว" }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}
