import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  message: String,
  type: String,
  radius: Number,
  location: {
    lat: Number,
    lng: Number,
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  readBy: [{ type: String }], // เก็บ userId ที่อ่านแล้ว
  dismissedBy: [{ type: String }],
},{timestamps: true});

const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);
export default Alert;