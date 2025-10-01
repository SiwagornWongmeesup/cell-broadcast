"use client";
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);


  // ดึงข้อมูลจาก API
  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/contact-messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // อัปเดตทุก 10 วินาที
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex bg-white">
        <Sidebar />

      {/* Main content */}
      <div className="flex-1 p-6 md:p-12">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          ✉️ ข้อความจากผู้ใช้
        </h1>

        {loading ? (
          <p className="text-gray-500 text-center">กำลังโหลดข้อความ...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 text-center">ยังไม่มีข้อความ</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">ชื่อ</th>
                  <th className="border px-4 py-2 text-left">อีเมล</th>
                  <th className="border px-4 py-2 text-left">ข้อความ</th>
                  <th className="border px-4 py-2 text-left">วันที่ส่ง</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg, idx) => (
                  <tr
                    key={msg._id || idx}
                    className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="border px-4 py-2">{msg.name}</td>
                    <td className="border px-4 py-2">{msg.email}</td>
                    <td className="border px-4 py-2">{msg.message}</td>
                    <td className="border px-4 py-2">
                      {new Date(msg.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
