import mongoose from "mongoose";

const UserReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  title: { type: String, required: true },
  details: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
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
