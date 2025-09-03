import mongoose from "mongoose";

const UserReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  details: { type: String, required: true },  // ใช้ details แทน description
  location: { type: String, required: true }, // เก็บเป็น string ไปก่อน
  date: { type: String },
  time: { type: String },
  name: { type: String },
  contact: { type: String },
  email: { type: String },
  status: { type: String, enum: ["pending", "read", "resolved"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  file: { type: String },  // เก็บชื่อไฟล์
});

export default mongoose.models.UserReport || mongoose.model("UserReport", UserReportSchema);
