"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import dynamic from "next/dynamic";

const UserMapComponent = dynamic(() => import('../components/mapuser'), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function IncidentPage() {
  const [hasFetchedLocation, setHasFetchedLocation] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    details: "",
    location: "",
    date: "",
    time: "",
    name: "",
    contact: "",
    email: "",
    file: null,
  });

  // ✅ ดึงตำแหน่งปัจจุบันครั้งแรก
  useEffect(() => {
    if (!hasFetchedLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserLocation(coords);
          setMarkers([coords]);
          setHasFetchedLocation(true);
        },
        (err) => {
          console.error("ไม่สามารถดึงตำแหน่งได้:", err);
          setHasFetchedLocation(true); // ยังให้ map render แต่ไม่ set marker
        }
      );
    }
  }, [hasFetchedLocation]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(" Submitting form:", formData); 

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      // ✅ เก็บตำแหน่งจาก map
      if (userLocation) {
        data.append("lat", userLocation.lat);
        data.append("lng", userLocation.lng);
      }

      const res = await fetch("/api/user-alerts", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("ส่งข้อมูลล้มเหลว");

      alert("✅ ส่งเรื่องเรียบร้อยแล้ว");
      setFormData({
        title: "",
        details: "",
        location: "",
        date: "",
        time: "",
        name: "",
        contact: "",
        email: "",
        file: null,
      });
    } catch (err) {
      console.error("Error:", err);
      alert("❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-md mt-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-red-600">
          แจ้งเหตุการณ์
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">หัวข้อเหตุการณ์</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              className="w-full p-2 border rounded"
              onChange={handleChange}
              required
            />
          </div>

          {/* ✅ Map Responsive */}
          
          <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-gray-200 rounded-lg overflow-hidden">
            {hasFetchedLocation && userLocation && (
              <UserMapComponent markers={markers} userLocation={userLocation} />
            )}
            {!userLocation && <p>กรุณาเปิดใช้งานตำแหน่ง</p>}
          </div>;

          <div>
            <label className="block font-semibold">รายละเอียดเหตุการณ์</label>
            <textarea
              name="details"
              rows={4}
              value={formData.details}
              className="w-full p-2 border rounded"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block font-semibold">สถานที่เกิดเหตุ</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              className="w-full p-2 border rounded"
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">วันที่</label>
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
              <label className="block font-semibold">เวลา</label>
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

          <div>
            <label className="block font-semibold">
              แนบรูปภาพ/วิดีโอ (ถ้ามี)
            </label>
            <input
              type="file"
              name="file"
              accept="image/*,video/*"
              className="w-full p-2"
              onChange={handleChange}
            />
          </div>

          <hr className="my-4" />
          <h2 className="text-lg font-bold text-gray-700">
            ข้อมูลผู้แจ้ง (ไม่บังคับ)
          </h2>

          <div>
            <label className="block font-semibold">ชื่อ</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              className="w-full p-2 border rounded"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block font-semibold">เบอร์ติดต่อ</label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              className="w-full p-2 border rounded"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block font-semibold">Email</label>
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
    </div>
  );
}
