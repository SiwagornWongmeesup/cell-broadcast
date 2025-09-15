import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../Models/user";

export async function POST(request) {
  try {
    await connectMongoDB();
    const { userId, lat, lng } = await request.json();

    if (!userId || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const parsedLat = Number(lat);
    const parsedLng = Number(lng);

    console.log("📍 Update request:", { userId, parsedLat, parsedLng });

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return NextResponse.json({ error: "Invalid lat/lng" }, { status: 400 });
    }

    // หา user ก่อน
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ถ้า location เป็น string → แปลงเป็น object
    if (typeof userDoc.location === "string") {
      const [oldLat, oldLng] = userDoc.location.split(",").map(Number);
      userDoc.location = { lat: oldLat || parsedLat, lng: oldLng || parsedLng };
    }

    // อัปเดตค่าใหม่
    userDoc.location.lat = parsedLat;
    userDoc.location.lng = parsedLng;

    await userDoc.save();

    return NextResponse.json({ success: true, user: userDoc });
  } catch (error) {
    console.error("❌ Update location error:", error);
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}
