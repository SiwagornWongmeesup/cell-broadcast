'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Sidebar from '../../components/Sidebar'; // import Sidebar

const MapClient = dynamic(() => import('../../components/MapClient'), { ssr: false });

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [type, setType] = useState('');
  const [radius, setRadius] = useState(500);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [address, setAddress] = useState({ province: '', district: ''})

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

  useEffect(() => {
    if (location?.lat != null && location?.lng != null) {
      console.log('🔹 Selected location:', location);
  
      const fetchAddress = async () => {
        try {
          const res = await fetch('/api/reverse-geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: location.lat, lng: location.lng }),
          });
  
          if (!res.ok) {
            console.error('❌ Reverse geocode API failed', res.status);
            setAddress({ province: '', district: '' });
            return;
          }
  
          const data = await res.json();
          console.log('✅ Address fetched:', data);
  
          setAddress({
            province: data.province || '',
            district: data.district || '',
          });
        } catch (err) {
          console.error('❌ Error fetching address:', err);
          setAddress({ province: '', district: '' }); // ป้องกันค้าง
        }
      };
  
      fetchAddress();
    }
  }, [location]);
  
  
  

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
        body: JSON.stringify({ message, type, radius, location, sendEmail, address }),  
      });
      if (res.ok) {
        alert('ส่งแจ้งเตือนสำเร็จ');
        setMessage('');
        setType('');
        setRadius(500);
        setLocation(null);
        setSendEmail(false);
        setAddress({ province: '', district: ''});
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

    if (!session) router.replace('/');
    else if (session.user.role !== 'admin') router.replace('/Homepage');
  }, [session, status, router]);


  if (status === 'loading') return <div>Loading...</div>;
  if (!session || session.user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar แสดงเฉพาะ Desktop */}
      <Sidebar session={session} />

      {/* ส่วนเนื้อหา */}
      <div className="flex-1 p-4 flex flex-col md:flex-row gap-4">
        {/* Map ทางซ้าย */}
        <div className="md:w-2/3 w-full h-96 md:h-[600px] bg-gray-200 rounded overflow-hidden">
          <MapClient location={location} setLocation={setLocation} radius={radius} />
        </div>
        <div className="mb-2 flex flex-col sm:flex-row gap-2">
          <p className="font-semibold">จังหวัด: <span className="font-normal">{address.province || '-'}</span></p>
          <p className="font-semibold">เขต: <span className="font-normal">{address.district || '-'}</span></p>
        </div>


        {/* Form ทางขวา */}
        <form
          onSubmit={handleSubmit}
          className="md:w-1/3 w-full p-4 bg-white rounded shadow space-y-4"
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
              setRadius(defaultRadius[selectedType] || 3000);
            }}
          >
            <option value="">เลือกประเภทภัยพิบัติ</option>
            <option value="แผ่นดินไหว">แผ่นดินไหว</option>
            <option value="ดินถล่ม">ดินถล่ม</option>
            <option value="คลื่นสึนามิ">คลื่นสึนามิ</option>
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

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={e => setSendEmail(e.target.checked)}
            />
            ส่งทางอีเมล
          </label>

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
  );
}
