"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function NotificationHistory() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); 

  // 🔹 ดึงข้อมูลจาก API
  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.success) {
        // สำหรับ user / admin ใช้ allDisasterAlerts เป็นหลัก
        setAlerts(data.allDisasterAlerts || []);
      }
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 ลบแจ้งเตือน
  const deleteAlert = async (id) => {
    if (!confirm("แน่ใจหรือว่าต้องการลบแจ้งเตือนนี้?")) return;
    
    setDeletingId(id);

    try {
      const res = await fetch("/api/alerts", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (data.success) {
        alert("ลบแจ้งเตือนเรียบร้อยแล้ว");
        fetchAlerts();
      }
    } catch (err) {
      console.error("Error deleting alert:", err);
    }
  };
  
  
  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="lg:w-64 w-full border-b lg:border-r bg-white shadow-sm">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-x-auto">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">
          ประวัติการแจ้งเตือน
        </h1>

        {/* Loading */}
        {loading ? (
          <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
        ) : alerts.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีการแจ้งเตือนในระบบ</p>
        ) : (
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-xs lg:text-sm">
                  <th className="py-3 px-4 text-left">ประเภท</th>
                  <th className="py-3 px-4 text-left">ข้อความ</th>
                  <th className="py-3 px-4 text-left">พื้นที่</th>
                  <th className="py-3 px-4 text-left">เวลา</th>
                  <th className="py-3 px-4 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {alerts.map((alert) => (
                  <tr
                    key={alert._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 font-medium">{alert.type}</td>
                    <td className="py-3 px-4">{alert.message}</td>
                    <td className="py-3 px-4">
                      {alert.province || "-"} {alert.district || "-"}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(alert.createdAt).toLocaleString("th-TH")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => deleteAlert(alert._id)}
                        className="px-3 py-1 text-xs lg:text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        { deletingId === alert._id ? 'กำลังลบ...' : 'ลบ' }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
