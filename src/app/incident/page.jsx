"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const MapClient = dynamic(() => import('../components/MapClient'), { ssr: false });

export default function Incident() {
  const { data: session } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    type: "",
    description: "",
    contact: "",
  });

  // location เป็น object เสมอ
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [hasFetchedLocation, setHasFetchedLocation] = useState(false);

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setHasFetchedLocation(true);
        },
        (err) => {
          console.warn("ไม่สามารถเข้าถึงตำแหน่ง:", err.message);
          // fallback → Bangkok
          setLocation({ lat: 13.7563, lng: 100.5018 });
          setHasFetchedLocation(true);
        }
      );
    } else {
      console.warn("เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง");
      setLocation({ lat: 13.7563, lng: 100.5018 });
      setHasFetchedLocation(true);
    }
  };

  useEffect(() => {
    if (!hasFetchedLocation) {
      fetchLocation();
    }
  }, [hasFetchedLocation]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (location.lat == null || location.lng == null) {
      alert("กรุณาเลือกตำแหน่งบนแผนที่");
      return;
    }

    const payload = { ...formData, location };

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("รายงานเหตุการณ์เรียบร้อย");
        router.push("/");
      } else {
        alert("เกิดข้อผิดพลาด");
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">รายงานเหตุการณ์</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* ประเภทเหตุการณ์ */}
        <select
          value={formData.type}
          onChange={(e) =>
            setFormData({ ...formData, type: e.target.value })
          }
          className="w-full p-2 border rounded"
          required
        >
          <option value="">เลือกประเภท</option>
          <option value="flood">น้ำท่วม</option>
          <option value="earthquake">แผ่นดินไหว</option>
          <option value="fire">ไฟไหม้</option>
          <option value="other">อื่น ๆ</option>
        </select>

        {/* รายละเอียด */}
        <textarea
          placeholder="รายละเอียด"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full p-2 border rounded"
          required
        />

        {/* เบอร์ติดต่อ */}
        <input
          type="text"
          placeholder="เบอร์ติดต่อ"
          value={formData.contact}
          onChange={(e) =>
            setFormData({ ...formData, contact: e.target.value })
          }
          className="w-full p-2 border rounded"
          required
        />

        {/* พิกัด */}
        <div className="space-y-2">
          <label className="block font-medium">ตำแหน่ง:</label>
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={location.lat ?? ""}
            onChange={(e) =>
              setLocation((prev) => ({
                ...(prev || {}),
                lat: parseFloat(e.target.value) || null,
              }))
            }
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={location.lng ?? ""}
            onChange={(e) =>
              setLocation((prev) => ({
                ...(prev || {}),
                lng: parseFloat(e.target.value) || null,
              }))
            }
            className="w-full p-2 border rounded"
          />
        </div>

        {/* แผนที่ */}
        {hasFetchedLocation && location.lat != null && location.lng != null ? (
          <Map location={location} setLocation={setLocation} />
        ) : (
          <p>กำลังโหลดแผนที่...</p>
        )}

        {/* ปุ่มรีเฟรชตำแหน่ง */}
        <button
          type="button"
          onClick={fetchLocation}
          className="text-blue-500 underline"
        >
          รีเฟรชตำแหน่งปัจจุบัน
        </button>

        {/* Submit */}
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          ส่งรายงาน
        </button>
      </form>
    </div>
  );
}
