"use client";
import { useState } from "react";

export default function AdminSettings() {
  const [form, setForm] = useState({
    name: "Admin",
    email: "admin@example.com",
    language: "th",
    timezone: "Asia/Bangkok",
    theme: "light",
    notifications: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    alert("บันทึกการตั้งค่าเรียบร้อย ✅");
    // TODO: call API บันทึกค่าใน DB
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">⚙️ การตั้งค่าระบบ</h2>

      {/* บัญชีแอดมิน */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold text-lg mb-4">🔑 บัญชีแอดมิน</h3>
        <label className="block mb-2">
          ชื่อ:
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>
        <label className="block mb-2">
          อีเมล:
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>
        <label className="block mb-2">
          รหัสผ่านใหม่:
          <input
            type="password"
            placeholder="********"
            className="w-full p-2 border rounded mt-1"
          />
        </label>
      </div>

      {/* ระบบ */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold text-lg mb-4">⚙️ การตั้งค่าระบบ</h3>
        <label className="block mb-2">
          ภาษา:
          <select
            name="language"
            value={form.language}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="th">ไทย</option>
            <option value="en">English</option>
          </select>
        </label>

        <label className="block mb-2">
          เขตเวลา:
          <select
            name="timezone"
            value={form.timezone}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="Asia/Bangkok">Asia/Bangkok</option>
            <option value="UTC">UTC</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
          </select>
        </label>

        <label className="block mb-2">
          ธีม:
          <select
            name="theme"
            value={form.theme}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="light">สว่าง</option>
            <option value="dark">มืด</option>
          </select>
        </label>
      </div>

      {/* การแจ้งเตือน */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold text-lg mb-4">📢 การแจ้งเตือน</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="notifications"
            checked={form.notifications}
            onChange={handleChange}
          />
          เปิดการแจ้งเตือนทางอีเมล
        </label>
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        💾 บันทึกการตั้งค่า
      </button>
    </div>
  );
}
