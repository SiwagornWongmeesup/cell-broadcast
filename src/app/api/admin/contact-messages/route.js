import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Contact from "../../../../../Models/contact";
import cloudinary from "../../../../../lib/cloudinary";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../api/auth/[...nextauth]/route";

export const config = {
  api: { bodyParser: false },
};

// POST handler for saving contact messages
export async function POST(req) {
  try {
    await connectMongoDB();

    const formData = await req.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");
    const file = formData.get("file");

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    let fileUrl = null;
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await cloudinary.uploader.upload(
        "data:image/png;base64," + buffer.toString("base64"),
        {
          folder: "contact-files",
          resource_type: "auto",
        }
      );

      fileUrl = result.secure_url;
    }

    const newContact = new Contact({
      name,
      email,
      message,
      file: fileUrl,
      createdAt: new Date(),
    });

    await newContact.save();

    return NextResponse.json({ success: true, contact: newContact });
  } catch (err) {
    console.error("Error saving contact:", err);
    return NextResponse.json(
      { success: false, message: "Failed to save contact", error: err.message },
      { status: 500 }
    );
  }
}

// GET handler for fetching contact messages
export async function GET() {
  try {
    await connectMongoDB();
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, contact: contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a contact message
export async function DELETE(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await connectMongoDB();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing contact ID" },
        { status: 400 }
      );
    }

    const result = await Contact.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
