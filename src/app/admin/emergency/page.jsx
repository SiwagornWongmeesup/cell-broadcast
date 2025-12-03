'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '../../components/Sidebar';

// Dynamic import แผนที่
const AdminMap = dynamic(() => import('../../components/admin-map'), { ssr: false });

export default function AdminEmergencyPage() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/emergency');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  // บันทึก & ลบ
  const handleDelete = async (id) => {
    const res = await fetch('/api/admin/emergency', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
  
    const data = await res.json();
    if (data.success) {
      alert('ลบข้อความเรียบร้อย');
      fetchRequests(); // รีเฟรชตาราง
    } else {
      alert(data.error);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000); // update ทุก 5 วิ
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 border-b md:border-b-0 md:border-r border-gray-700">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800">คำขอความช่วยเหลือ</h1>

        {/* แผนที่ */}
        <div className="w-full h-64 md:h-[400px] mb-6 rounded-lg overflow-hidden shadow-md">
          <AdminMap requests={requests} />
        </div>

        {/* ตารางคำขอ */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px] md:min-w-full">
            <thead>
              <tr>
                <th className="border px-2 py-1">ชื่อผู้ขอ</th>
                <th className="border px-2 py-1">เบอร์</th>
                <th className="border px-2 py-1">ข้อความ</th>
                <th className="border px-2 py-1">พิกัด</th>
                <th className="border px-2 py-1">เวลา</th>
                <th className="border px-2 py-1">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-2">ยังไม่มีคำขอ</td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id}>
                    <td className="border px-2 py-1">{req.name}</td>
                    <td className="border px-2 py-1">{req.phone}</td>
                    <td className="border px-2 py-1">{req.message}</td>
                    <td className="border px-2 py-1">{req.lat}, {req.lng}</td>
                    <td className="border px-2 py-1">{new Date(req.createdAt).toLocaleString()}</td>
                    <td className="border px-2 py-1">
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                        onClick={() => handleDelete(req)}
                      >
                        บันทึก & ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
