"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/app/components/Sidebar";

const MapAdmin = dynamic(() => import("../../components/MapAdmin"), { ssr: false });

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [sendEmailMap, setSendEmailMap] = useState({});
  const [radiusMap, setRadiusMap] = useState({}); // ✅ เก็บค่ารัศมีของแต่ละ alert

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/user-alerts");
      const data = await res.json();
      setAlerts(data);
      fetchAddressForAlerts(data);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    }
  };

  // ✅ ฟังก์ชันแปลงตำแหน่ง lat/lng เป็นชื่อจังหวัดและเขต
const fetchAddressForAlerts = async (alertsData) => {
  const updated = await Promise.all(
    alertsData.map(async (a) => {
      if (!a.location?.lat || !a.location?.lng) return a; // ถ้าไม่มีพิกัดข้ามไปเลย

      try {
        const res = await fetch("/api/reverse-geocode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "cell-broadcast-admin/1.0 (grant@ssru.ac.th)",
            "Accept-Language": "th",
          },
          body: JSON.stringify({
            lat: a.location.lat,
            lng: a.location.lng,
          }),
        });

        if (!res.ok) throw new Error("Reverse geocode failed");
        const data = await res.json();

        return {
          ...a,
          address: {
            province: data.province || "-",
            district: data.district || "-",
          },
        };
      } catch (err) {
        console.error("❌ Error reverse geocode:", err);
        return a;
      }
    })
  );

  setAlerts(updated);
};


  

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  async function forwardToUsers(report) {
    try {
      const radius = radiusMap[report._id] || 3000; // ✅ ใช้รัศมีที่กรอก หรือค่า default = 3000
      const res = await fetch("/api/admin/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: report.details,
          type: report.title,
          radius,
          location: report.location,
          fileUrl: report.file || null,
          sendEmail: sendEmailMap[report._id] || false,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`✅ ส่งต่อแจ้งเตือน (รัศมี ${radius} เมตร) แล้ว`);
        setSendEmailMap(prev => ({ ...prev, [report._id]: false }));
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

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <h1 className="text-2xl font-bold">📢 แจ้งเหตุจากผู้ใช้</h1>

        {alerts.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีการแจ้งเหตุ</p>
        ) : (
          <>
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
                          <b>Province:</b> {a.address?.province || "-"}
                        </p>
                        <p className="text-sm">
                          <b>District:</b> {a.address?.district || "-"}
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

                      {/* Status, Radius, ส่งอีเมล, ปุ่มส่งต่อ */}
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

                        {/* ✅ Input รัศมี */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm">รัศมี (เมตร):</label>
                          <input
                            type="number"
                            value={radiusMap[a._id] || ""}
                            onChange={(e) =>
                              setRadiusMap((prev) => ({
                                ...prev,
                                [a._id]: e.target.value,
                              }))
                            }
                            placeholder="3000"
                            className="border rounded px-2 py-1 w-24"
                          />
                        </div>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={sendEmailMap[a._id] || false}
                            onChange={(e) =>
                              setSendEmailMap((prev) => ({
                                ...prev,
                                [a._id]: e.target.checked,
                              }))
                            }
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
