'use client';

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const MapClient = dynamic(() => import('../components/MapClient'), { ssr: false });

export default function IncidentPage() {
  const { data: session } = useSession();
  const [hasFetchedLocation, setHasFetchedLocation] = useState(false);
  const [location, setLocation] = useState(null);

  const [formData, setFormData] = useState({
    userId: null,
    title: "",
    details: "",
    date: "",
    time: "",
    name: "",
    contact: "",
    email: "",
    file: null,
  });

  // อัปเดต userId เมื่อ session โหลดเสร็จ
  useEffect(() => {
    if (session?.user?.id) {
      setFormData(prev => ({ ...prev, userId: session.user.id }));
    }
  }, [session]);

  // ดึงตำแหน่งปัจจุบัน
  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: isNaN(pos.coords.latitude) ? null : pos.coords.latitude,
            lng: isNaN(pos.coords.longitude) ? null : pos.coords.longitude,
          };
          setLocation(coords);
          setHasFetchedLocation(true);
        },
        (err) => {
          console.warn("ไม่สามารถเข้าถึงตำแหน่ง:", err.message);
          setLocation({ lat: 13.7563, lng: 100.5018 });
          setHasFetchedLocation(true);
        }
      );
    } else {
      console.warn("Geolocation API ไม่รองรับบน browser นี้");
      setHasFetchedLocation(true);
    }
  };

  useEffect(() => {
    if (!hasFetchedLocation) fetchLocation();
  }, [hasFetchedLocation]);

  // ปุ่มรีเฟรชตำแหน่ง
  const handleRefreshLocation = () => {
    setHasFetchedLocation(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location?.lat || !location?.lng) {
      alert("กรุณาเลือกตำแหน่งบนแผนที่");
      return;
    }

    if (!formData.title) {
      alert("กรุณาเลือกประเภทภัยพิบัติ");
      return;
    }

    if (formData.contact && formData.contact.length !== 10) {
      alert("กรุณากรอกเบอร์ติดต่อให้ครบถ้วน");
      return;
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      data.append("location", JSON.stringify(location));
      data.append("userId", session?.user?.id || "");

      const res = await fetch("/api/user-alerts", { method: "POST", body: data });
      const result = await res.json();
      if (!res.ok) throw new Error("ส่งข้อมูลล้มเหลว");

      alert("✅ ส่งเรื่องเรียบร้อยแล้ว");

      setFormData({
        userId: session?.user?.id || null,
        title: "",
        details: "",
        date: "",
        time: "",
        name: "",
        contact: "",
        email: "",
        file: null,
      });

      setHasFetchedLocation(false);

    } catch (err) {
      console.error(err);
      alert("❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-4 sm:p-6 rounded-2xl shadow-md mt-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-red-600">
        แจ้งเหตุการณ์
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* เลือกประเภทภัยพิบัติ */}
        <select
          name="title"
          className="w-full border p-2 rounded"
          value={formData.title}
          onChange={handleChange}
          required
        >
          <option value="">เลือกประเภทภัยพิบัติ</option>
          <option value="แผ่นดินไหว">แผ่นดินไหว</option>
          <option value="ภูเขาไฟระเบิด">ภูเขาไฟระเบิด</option>
          <option value="น้ำท่วม">น้ำท่วม</option>
          <option value="พายุ">พายุ</option>
          <option value="ไฟป่า">ไฟป่า</option>
          <option value="อื่นๆ">อื่นๆ</option>
        </select>

        {/* Map */}
        <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] bg-gray-200 rounded-lg overflow-hidden relative z-0">
          {hasFetchedLocation && location ? (
            <MapClient location={location} setLocation={setLocation} showInputs={false} />
          ) : (
            <p className="text-center mt-4">กรุณาเปิดใช้งานตำแหน่ง</p>
          )}
        </div>

        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={handleRefreshLocation}
            className="bg-gray-200 text-gray-700 px-4 py-1 rounded hover:bg-gray-300"
          >
            รีเฟรชตำแหน่ง
          </button>
        </div>

        {/* Lat/Lng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          <input
            type="number"
            step="0.000001"
            value={location?.lat || ''}
            onChange={e =>
              setLocation(prev => ({ ...prev, lat: parseFloat(e.target.value) || null }))
            }
            className="border p-2 rounded w-full"
            placeholder="Latitude"
          />
          <input
            type="number"
            step="0.000001"
            value={location?.lng || ''}
            onChange={e =>
              setLocation(prev => ({ ...prev, lng: parseFloat(e.target.value) || null }))
            }
            className="border p-2 rounded w-full"
            placeholder="Longitude"
          />
        </div>

        {/* รายละเอียด */}
        <div>
          <label className="block font-semibold mb-1">รายละเอียดเหตุการณ์</label>
          <textarea
            name="details"
            rows={4}
            value={formData.details}
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
        </div>

        {/* วันที่ เวลา */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">วันที่</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              className="w-full p-2 border rounded"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">เวลา</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              className="w-full p-2 border rounded"
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* ไฟล์ */}
        <div>
          <label className="block font-semibold mb-1">แนบรูปภาพ/วิดีโอ (ถ้ามี)</label>
          <input
            type="file"
            name="file"
            accept="image/*,video/*"
            className="w-full p-2"
            onChange={handleChange}
          />
        </div>

        <hr className="my-4" />
        <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">ข้อมูลผู้แจ้ง</h2>

        {/* ข้อมูลผู้แจ้ง */}
        <div>
          <label className="block font-semibold mb-1">ชื่อ</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            className="w-full p-2 border rounded"
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">เบอร์ติดต่อ</label>
          <input
            type="tel"
            name="contact"
            pattern="[0-9]*"
            inputMode="numeric"
            maxLength={10}
            value={formData.contact || ''}
            className="w-full p-2 border rounded"
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/[^0-9]/g, "");
              setFormData(prev => ({ ...prev, contact: onlyNums }));
            }}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            className="w-full p-2 border rounded"
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 mt-4 w-full"
        >
          ส่งเรื่องแจ้งเหตุ
        </button>
      </form>
    </div>
  );
}
