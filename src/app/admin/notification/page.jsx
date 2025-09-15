'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('../../components/MapClient'), { ssr: false });

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [type, setType] = useState('');
  const [radius, setRadius] = useState(500);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // กำหนดรัศมี default ตามประเภทภัยพิบัติ
  const defaultRadius = {
    earthquake: 3000,
    volcanic: 10000,
    flood: 3000,
    storm: 7000,
    wildfire: 2000,
    other: 3000,
  };

  // แปลงเมตร → กิโลเมตร สำหรับแสดงใน input
const metersToKm = (meters) => (meters / 1000).toFixed(1);

// แปลงกิโลเมตร → เมตร ก่อนเก็บ/ส่ง
const kmToMeters = (km) => Math.round(km * 1000);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message || !location) {
      alert('กรุณากรอกข้อความและเลือกตำแหน่ง');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message, type, radius, location }),
      });

      if (res.ok) {
        alert('ส่งแจ้งเตือนสำเร็จ');
        setMessage('');
        setType('');
        setRadius(500);
        setLocation(null);
      } else {
        const data = await res.json();
        const errorMessage = data?.error || 'ไม่ทราบสาเหตุ';
        alert('เกิดข้อผิดพลาด: ' + errorMessage);
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.replace('/login');
    } else if (session.user.role !== 'admin') {
      router.replace('/Homepage');
    }
  }, [session, status, router]);

  if (status === 'loading') return <div>Loading...</div>;
  if (!session || session.user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <form
          onSubmit={handleSubmit}
          className="p-4 max-w-xl mx-auto space-y-4 bg-white rounded shadow"
        >
          <h2 className="text-xl font-bold">ส่งแจ้งเตือน</h2>

          <textarea
            className="w-full border p-2 rounded"
            rows={3}
            placeholder="ข้อความแจ้งเตือน"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <select
            className="w-full border p-2 rounded"
            value={type}
            onChange={(e) => {
              const selectedType = e.target.value;
              setType(selectedType);
              // กำหนดรัศมี default ตามประเภทภัยพิบัติ
              setRadius(defaultRadius[selectedType] || 3000);
            }}
          >
            <option value="">เลือกประเภทภัยพิบัติ</option>
            <option value="แผ่นดินไหว">แผ่นดินไหว</option>
            <option value="ภูเขาไฟระเบิด">ภูเขาไฟระเบิด</option>
            <option value="น้ำท่วม">น้ำท่วม</option>
            <option value="พายุ">พายุ</option>
            <option value="ไฟป่า">ไฟป่า</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>

          <input
            type="number"
            className="w-full border p-2 rounded"
            placeholder="รัศมี (กิโลเมตร)"
            value={metersToKm(radius)}
            onChange={(e) => setRadius(kmToMeters(Number(e.target.value)))}
          />

          <MapClient location={location} setLocation={setLocation} radius={radius} />

          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'กำลังส่ง...' : 'ส่งแจ้งเตือน'}
          </button>
        </form>
      </div>
    </div>
  );
}
