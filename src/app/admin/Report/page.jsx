"use client";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/user-alerts");
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    }
  };

  useEffect(() => {
    // โหลดครั้งแรก
    fetchAlerts();

    // ตั้ง interval ให้เรียกทุก 5 วิ
    const interval = setInterval(fetchAlerts, 5000);

    // ล้างตอนออกจากหน้า
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>📢 แจ้งเหตุจากผู้ใช้</h1>
      {alerts.length === 0 ? (
        <p>ยังไม่มีการแจ้งเหตุ</p>
      ) : (
        <ul>
          {alerts.map((a) => (
            <li key={a._id}>
              <b>{a.type}</b> - {a.description} ({new Date(a.createdAt).toLocaleString()})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
