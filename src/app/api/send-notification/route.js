import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import UserReport from "../../../../Models/Report";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, lat, lng } = await req.json();
    if (!title || !description || !lat || !lng) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newReport = await UserReport.create({
      userId: session.user.id,
      title,
      description,
      location: { lat, lng },
    });

    return NextResponse.json({ message: "Report submitted successfully", report: newReport });
  } catch (error) {
    console.error("Error creating user report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
