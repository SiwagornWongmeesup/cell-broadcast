'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Sidebar from '../../components/Sidebar';

const MapClient = dynamic(() => import('../../components/MapClient'), { ssr: false });

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [type, setType] = useState('');
  const [radius, setRadius] = useState(500);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const defaultRadius = {
    earthquake: 3000,
    volcanic: 10000,
    flood: 3000,
    storm: 7000,
    wildfire: 2000,
    other: 3000,
  };

  const metersToKm = (meters) => (meters / 1000).toFixed(1);
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
        alert('เกิดข้อผิดพลาด: ' + (data?.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.replace('/login');
    else if (session.user.role !== 'admin') router.replace('/Homepage');
  }, [session, status, router]);

  if (status === 'loading') return <div>Loading...</div>;
  if (!session || session.user.role !== 'admin') return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar: แสดงเฉพาะ md+ */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-gray-800 text-white">
        <Sidebar session={session} />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-2 md:p-4">
        <div className="flex flex-col md:flex-row gap-4 min-h-screen">
        {/* Map */}
          <div className="w-full md:w-2/3 bg-gray-200 rounded overflow-hidden 
                          h-64 sm:h-72 md:h-[600px]">
            <MapClient location={location} setLocation={setLocation} radius={radius} />
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="w-full md:w-1/3 p-4 bg-white rounded shadow flex flex-col space-y-3 
                      overflow-auto h-64 sm:h-72 md:h-[600px]"
          >
            <h2 className="text-xl font-bold">ส่งแจ้งเตือน</h2>
            <textarea
              className="w-full border p-2 rounded resize-none"
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
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 w-full"
            >
              {loading ? 'กำลังส่ง...' : 'ส่งแจ้งเตือน'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
