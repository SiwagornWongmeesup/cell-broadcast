import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../Models/user";

export async function GET(req) {
  await connectMongoDB();

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new Response(JSON.stringify({ message: "Token missing" }), { status: 400 });
  }

  const user = await User.findOne({
    verificationToken: token,
    tokenExpiration: { $gt: Date.now() } // ตรวจว่าหมดอายุหรือยัง
  });

  if (!user) {
    return new Response(JSON.stringify({ message: "Invalid or expired token" }), { status: 400 });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.tokenExpiration = undefined;
  await user.save();

  return new Response(JSON.stringify({ message: "Email verified" }), { status: 200 });
}
