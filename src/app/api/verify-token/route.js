import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../Models/user";

export async function GET(req) {
  await connectMongoDB();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const user = await User.findOne({ verificationToken: token });
  if (!user) return new Response(JSON.stringify({ message: "Token ไม่ถูกต้อง" }), { status: 400 });
  if (user.tokenExpiration < Date.now()) return new Response(JSON.stringify({ message: "Token หมดอายุ" }), { status: 400 });

  user.isVerified = true;
  user.verificationToken = undefined;
  user.tokenExpiration = undefined;
  await user.save();

  return new Response(JSON.stringify({ message: "ยืนยันบัญชีสำเร็จ!" }), { status: 200 });
}
