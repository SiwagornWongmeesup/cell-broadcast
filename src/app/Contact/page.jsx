"use client";
import { useState } from "react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("✅ ส่งข้อความเรียบร้อยแล้ว! ทีมงานจะติดต่อกลับเร็ว ๆ นี้");
        setFormData({ name: "", email: "", message: "" });
      } else {
        alert("❌ ส่งข้อความไม่สำเร็จ: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("❌ เกิดข้อผิดพลาดในการส่งข้อความ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900 text-white p-6 md:p-12 flex justify-center items-start">
      <div className="w-full max-w-2xl bg-gray-800 bg-opacity-70 rounded-xl shadow-xl p-6 md:p-10">
        <h2 className="text-3xl font-bold mb-6 text-center">📬 ติดต่อเรา</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">ชื่อ</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">อีเมล</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">ข้อความ</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 text-white h-32 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? "กำลังส่ง..." : "ส่งข้อความ"}
          </button>

          {success && <p className="mt-3 text-green-400 font-medium">{success}</p>}
        </form>
      </div>
    </div>
  );
}
