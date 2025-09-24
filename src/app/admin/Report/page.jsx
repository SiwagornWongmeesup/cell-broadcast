"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/app/components/Sidebar";

const MapAdmin = dynamic(() => import("../../components/MapAdmin"), { ssr: false });

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/user-alerts");
      const data = await res.json();
      console.log("Response text:", data);
      setAlerts(data);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  async function forwardToUsers(report) {
    try {
      const res = await fetch("/api/admin/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: report.details,
          type: report.title,
          radius: 500,
          location: report.location,
          fileUrl: report.file || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ ส่งต่อไปยังผู้ใช้แล้ว");
      } else {
        alert("❌ ส่งต่อไม่สำเร็จ: " + data.error);
      }
    } catch (error) {
      console.error("Error forwarding alert:", error);
      alert("❌ เกิดข้อผิดพลาดในการส่งต่อ");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar className="w-64 h-screen" />

      {/* Main content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <h1 className="text-2xl font-bold">📢 แจ้งเหตุจากผู้ใช้</h1>

        {alerts.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีการแจ้งเหตุ</p>
        ) : (
          <>
            {/* List alerts */}
            <div className="overflow-y-auto max-h-[300px] md:max-h-[400px] border rounded-lg p-3 bg-white shadow">
              <ul className="divide-y">
                {alerts.map((a) => (
                  <li key={a._id} className="py-3 border-b last:border-0">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      {/* ข้อมูล alert */}
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold">{a.title}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(a.createdAt).toLocaleString()}
                        </p>
                        <p>{a.details}</p>
                        <p className="text-sm">
                          <b>Location:</b>{" "}
                          {a.location ? `${a.location.lat}, ${a.location.lng}` : "ไม่มี"}
                        </p>
                        <p className="text-sm">
                          <b>File:</b>{" "}
                          {a.file ? (
                            <a
                              href={a.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              ดูไฟล์แนบ
                            </a>
                          ) : (
                            "ไม่มี"
                          )}
                        </p>
                        <p className="text-sm">
                          <b>Name:</b> {a.name || "-"} | <b>Contact:</b>{" "}
                          {a.contact || "-"} | <b>Email:</b> {a.email || "-"}
                        </p>
                      </div>

                      {/* Status และปุ่มส่งต่อ */}
                      <div className="flex flex-col md:items-end gap-2 mt-2 md:mt-0">
                        <span
                          className={`px-2 py-1 rounded text-white text-sm ${
                            a.status === "pending"
                              ? "bg-yellow-500"
                              : a.status === "read"
                              ? "bg-blue-500"
                              : "bg-green-600"
                          }`}
                        >
                          {a.status}
                        </span>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                           
                          />
                          ส่งทางอีเมล
                        </label>

                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                          onClick={() => forwardToUsers(a)}
                        >
                          ส่งต่อไปยังผู้ใช้
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* แผนที่ */}
            <div>
              <h2 className="text-lg font-bold mb-2">แผนที่แจ้งเหตุ</h2>
              <MapAdmin alerts={alerts} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
