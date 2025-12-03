'use client'

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import
const EmergencyMap = dynamic(() => import('../components/emergency-map'), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function EmergencyPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [userLabel, setUserLabel] = useState('');

  // ดึงตำแหน่งอัตโนมัติ
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => alert("เปิด GPS ด้วยนะ")
    );
  }, []);

  // ดึงข้อมูลคำขอทั้งหมด
  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/emergency');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  // ดึงตำแหน่งปุ่มกด
  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      (err) => alert("ไม่สามารถดึงตำแหน่งได้")
    );
  };

  // ส่งฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !phone || !lat || !lng) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    if (phone.length !== 10) {
        alert("กรุณากรอกเบอร์ติดต่อให้ถูกต้อง");
        return;
    }

     // เช็คจำนวนครั้งส่งต่อวัน (เก็บใน localStorage)
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const history = JSON.parse(localStorage.getItem('emergencyHistory') || '{}');

    const count = history[today] || 0;
    if (count >= 3) {
        alert("คุณสามารถส่งคำขอได้ไม่เกิน 3 ครั้งต่อวัน");
        return;
    }


    setLoading(true);

    try {
      await fetch('/api/emergency', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            phone,
            lat,
            lng,
            message,
          }),
      });

      setUserLabel(name);

      alert("ส่งคำขอสำเร็จ");
       // เพิ่มจำนวนครั้งใน localStorage
    history[today] = count + 1;
    localStorage.setItem('emergencyHistory', JSON.stringify(history));

      setName('');
      setPhone('');
      setMessage('');
      fetchRequests();
    } catch (err) {
      alert("ส่งคำขอล้มเหลว");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row p-4 gap-4 bg-gradient-to-b from-black via-gray-900 to-red-900">

      {/* ฟอร์ม */}
      <div className="bg-gray-800/80 rounded-xl shadow-lg p-6 w-full md:w-1/3">
        <h1 className="text-2xl font-bold text-center mb-6 text-white">🚨 ขอความช่วยเหลือด่วน</h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          
          <input
            type="text"
            placeholder="ชื่อของคุณ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 rounded-md border text-white"
            required
          />

             <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="เบอร์ติดต่อ"
              value={phone}
              maxLength={10}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            className="p-3 rounded-md border text-white"
            required
            />

          <textarea
            placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="p-3 rounded-md border text-white"
          />

            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <button
                type="button"
                className="bg-blue-500 text-white p-3 rounded-md w-full sm:w-auto hover:bg-blue-600 transition"
                onClick={getLocation}
             
              >
                ใช้ตำแหน่งปัจจุบัน
              </button>
              <input
                className="bg-amber-200 p-3 rounded-md flex-1 text-base sm:text-lg"
                type="text"
                placeholder="พิกัด"
                value={lat && lng ? `${lat}, ${lng}` : ''}
                readOnly
           
              />
            </div>

          <button
            type="submit"
            disabled={loading}
            className={`p-3 rounded-md text-white font-bold ${
              loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? 'กำลังส่ง...' : 'ส่งคำขอความช่วยเหลือ'}
          </button>
        </form>

      </div>

      {/* แผนที่ */}
      <div className="w-full md:w-2/3 h-[500px] rounded-xl overflow-hidden shadow-lg">
       <EmergencyMap userLocation={{ lat, lng }}   userLabel={userLabel} requests={requests}/>
      </div>

    </div>
  );
}
