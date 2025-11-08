"use client";
import { useRef } from "react";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";


export default function ContactUs() {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: "",
    file: "",
    message: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

   useEffect(() => {
      if (session?.user?.id) {
        setFormData(prev => ({
          ...prev,
          userId: session.user.id,
          name: session.user.name || ""
        }));
      }
    }, [session]);
  const handleChange = (e) => {
    const { name, value, } = e.target;
    setFormData({ ...formData, [name]: value });    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("message", formData.message);
      if (fileInputRef.current.files[0]) {
        data.append("file", fileInputRef.current.files[0]);
      }

      const res = await fetch("/api/admin/contact-messages", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess(
          "✅ ส่งข้อความเรียบร้อยแล้ว! ทีมงานจะติดต่อกลับเร็ว ๆ นี้"
        );
        setFormData({ name: "", email: "", message: "" });
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        alert("❌ ส่งข้อความไม่สำเร็จ: " + result.message);
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

          <div>
                <label className="block mb-1 font-medium">แนบรูปภาพ/วิดีโอ (ถ้ามี)</label>
                <input
                  type="file"
                  name="file"
                  accept="image/*,video/*"
                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-gray-100"
                  onChange={handleChange}
                  ref={fileInputRef}
                />
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
