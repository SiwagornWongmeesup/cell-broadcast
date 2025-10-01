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
    name: "",
    title: "",
    details: "",
    date: "",
    time: "",
    contact: "",
    email: "",
    file: null,
  });

  // อัปเดต userId เมื่อ session โหลดเสร็จ
  useEffect(() => {
    if (session?.user?.id) {
      setFormData(prev => ({
         ...prev,
          userId: session.user.id,
          name: session.user.name
        }));
    }
  }, [session]);

  // ดึงตำแหน่งปัจจุบัน
  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setHasFetchedLocation(true);
        },
        () => {
          setLocation({ lat: 13.7563, lng: 100.5018 }); // default Bangkok
          setHasFetchedLocation(true);
        }
      );
    } else setHasFetchedLocation(true);
  };

  useEffect(() => {
    if (!hasFetchedLocation) fetchLocation();
  }, [hasFetchedLocation]);

  const handleRefreshLocation = () => setHasFetchedLocation(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location?.lat || !location?.lng) return alert("กรุณาเลือกตำแหน่งบนแผนที่");
    if (!formData.title) return alert("กรุณาเลือกประเภทภัยพิบัติ");
    if (formData.contact && formData.contact.length !== 10) return alert("กรุณากรอกเบอร์ติดต่อให้ครบ 10 หลัก");

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => { if (value) data.append(key, value); });
      data.append("location", JSON.stringify(location));
      data.append("userId", session?.user?.id || "");

      const res = await fetch("/api/user-alerts", { method: "POST", body: data });
      if (!res.ok) throw new Error("ส่งข้อมูลล้มเหลว");

      alert("✅ ส่งเรื่องเรียบร้อยแล้ว");

      setFormData({
        userId: session?.user?.id || null,
        title: "", details: "", date: "", time: "",
        contact: "", email: "", file: null
      });
      setHasFetchedLocation(false);

    } catch (err) {
      console.error(err);
      alert("❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900 p-4">
      <div className="max-w-7xl mx-auto bg-gray-800 rounded-2xl shadow-md text-gray-100">
        <h1 className="text-2xl sm:text-3xl font-bold p-6 text-center text-red-600">
          แจ้งเหตุการณ์
        </h1>
  
        {/* Layout responsive */}
        <div className="flex flex-col md:flex-row">
          {/* ฝั่งซ้าย (แผนที่ใหญ่กว่า) */}
          <div className="w-full md:w-2/3 p-4">
            <div className="w-full h-[250px] sm:h-[350px] md:h-[700px] bg-gray-800 rounded-lg overflow-hidden relative z-0">
              {hasFetchedLocation && location ? (
                <MapClient location={location} setLocation={setLocation} showInputs={false} />
              ) : (
                <p className="text-center mt-4 text-gray-400">กรุณาเปิดใช้งานตำแหน่ง</p>
              )}
            </div>
  
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleRefreshLocation}
                className="bg-gray-700 text-gray-100 px-4 py-1 rounded hover:bg-gray-600"
              >
                รีเฟรชตำแหน่ง
              </button>
            </div>
  
            {/* Lat/Lng */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input
                type="number"
                step="0.000001"
                value={location?.lat || ""}
                onChange={(e) =>
                  setLocation((prev) => ({ ...prev, lat: parseFloat(e.target.value) || null }))
                }
                className="border border-gray-600 p-2 rounded w-full bg-gray-800 text-gray-100"
                placeholder="Latitude"
              />
              <input
                type="number"
                step="0.000001"
                value={location?.lng || ""}
                onChange={(e) =>
                  setLocation((prev) => ({ ...prev, lng: parseFloat(e.target.value) || null }))
                }
                className="border border-gray-600 p-2 rounded w-full bg-gray-800 text-gray-100"
                placeholder="Longitude"
              />
            </div>
          </div>
  
          {/* ฝั่งขวา (ฟอร์มแคบกว่า) */}
          <div className="w-full md:w-1/3 p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* เลือกประเภทภัยพิบัติ */}
              <select
                name="title"
                className="w-full bg-gray-800 text-gray-100 border border-gray-600 p-2 rounded focus:ring-2 focus:ring-red-400"
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
  
              {/* รายละเอียด */}
              <div>
                <label className="block font-semibold mb-1">รายละเอียดเหตุการณ์</label>
                <textarea
                  name="details"
                  rows={3}
                  value={formData.details}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-gray-100 focus:ring-2 focus:ring-red-400"
                  onChange={handleChange}
                  required
                />
              </div>
  
              {/* วันที่ เวลา */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block font-semibold mb-1">วันที่</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-gray-100 focus:ring-2 focus:ring-red-400"
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
                    className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-gray-100 focus:ring-2 focus:ring-red-400"
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
                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-gray-100"
                  onChange={handleChange}
                />
              </div>
  
              <hr className="my-4 border-gray-600" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-100 mb-2">ข้อมูลผู้แจ้ง</h2>
  
              <div>
                <label className="block font-semibold mb-1">เบอร์ติดต่อ</label>
                <input
                  type="tel"
                  name="contact"
                  maxLength={10}
                  value={formData.contact || ""}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-gray-100 focus:ring-2 focus:ring-red-400"
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                    setFormData((prev) => ({ ...prev, contact: onlyNums }));
                  }}
                />
              </div>
  
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-gray-100 focus:ring-2 focus:ring-red-400"
                  onChange={handleChange}
                />
              </div>
  
              <button
                type="submit"
                className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  !formData.contact ||
                  !formData.email ||
                  !location?.lat ||
                  !location?.lng ||
                  !formData.title
                }
              >
                ส่งเรื่องแจ้งเหตุ
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
  
}
