import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import UserProfile from "../../../../Models/profile";
import User from "../../../../Models/user"; // เพิ่ม import User

export async function GET(req) {
  try {
    await connectMongoDB();
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    let profile = await UserProfile.findOne({ userId }).lean();
    if (!profile) {
      profile = await UserProfile.create({
        userId,
        bio: "",
        address: "",
        instagram: "",
        profileImage: ""
      });
      profile = profile.toObject(); // เพื่อให้ lean() เหมือนเดิม
    }

    const user = await User.findById(userId).lean();

    return NextResponse.json({ profile,user });
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// POST: สร้าง/อัปเดตโปรไฟล์
export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();
    const { userId, name, phone, bio, address, instagram, profileImage } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // อัปเดต UserProfile
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { bio, address, instagram, profileImage },
      { new: true, upsert: true } // ถ้าไม่มีสร้างใหม่
    );

    // อัปเดต User
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { name, phone },
      { new: true }
    );

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: updatedProfile,
      user: updatedUser
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
