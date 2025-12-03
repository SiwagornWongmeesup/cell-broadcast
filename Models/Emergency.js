import mongoose from 'mongoose';

const EmergencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Emergency || mongoose.model('Emergency', EmergencySchema);
