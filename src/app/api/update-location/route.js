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

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: {
          "location.lat": parsedLat,
          "location.lng": parsedLng
        }},
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error(" Update location error:", error);
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}
