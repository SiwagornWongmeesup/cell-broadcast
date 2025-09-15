import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String },
  radius: { type: Number },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  fileUrl: { type: String },
  expiresAt: { type: Date },
  readBy: [{ type: String }],
  dismissedBy: [{ type: String }],
}, { timestamps: true });

const Alert = mongoose.models.Alert || mongoose.model("Alert", alertSchema);

export default Alert;
