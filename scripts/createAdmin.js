// createAdmin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/user';  // เชื่อมกับ Model ของ User

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('adminpassword', 10); // ตั้งรหัสผ่านสำหรับแอดมิน
  const admin = new User({
    name: 'Admin User',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
    location: 'Admin Location', // หรือที่อยู่ของแอดมิน
  });

  await admin.save();
  console.log('Admin account created');
}

mongoose.connect('mongodb://localhost:27017/yourdb', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => createAdmin())
  .catch((err) => console.error(err));
