'use client';
import React from 'react';
import { useSession } from 'next-auth/react';

const alertTypeMap = {
  'แผ่นดินไหว': 'แผ่นดินไหว',
  'คลื่นสึนามิ': 'คลื่นสึนามิ',
  'ดินถล่ม': 'ดินถล่ม',
  'น้ำท่วม': 'น้ำท่วม',
  'พายุ': 'พายุ',
  'ไฟป่า': 'ไฟป่า',
  'อื่นๆ': 'อื่นๆ',
};

export default function AlertBox({ alert, onDismiss }) {
  const { data: session } = useSession();
  const thaiType = alertTypeMap[alert.type] || alert.type;

  // ฟังก์ชัน markAsRead
  const markAsRead = async (alertId) => {
    await fetch("/api/alerts/readalerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alertId,
        userId: session.user.id,
      }),
    });
  };

  // ฟังก์ชัน dismiss
  const dismissAlert = async (alertId) => {
    await fetch("/api/alerts/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId, userId: session.user.id }),
    });

  
    if (onDismiss) onDismiss(alertId);
  };

  // ฟังก์ชันตอน user กดปิด
  const handleClose = async (alertId) => {
    await markAsRead(alertId);   // อัพเดตว่าอ่านแล้ว
    await dismissAlert(alertId); // อัพเดตว่า dismiss แล้ว
  };

  return (
    <div className="relative bg-amber-300 p-6 shadow-lg rounded-lg w-full max-w-md mx-auto mt-10">
      <button
        onClick={() => handleClose(alert._id)}
        className="absolute top-2 right-2 text-gray-700 hover:text-black"
      >
        ❌
      </button>

      <h3 className="text-lg font-bold text-red-600 text-center mb-2">
        ⚠️ แจ้งเตือนเหตุการณ์
      </h3>

      <div className="space-y-2">
        <div>
          <label className="font-medium">ประเภทเหตุการณ์:</label>
          <p className="text-gray-800">{thaiType}</p>
        </div>

        <div>
          <label className="font-medium">ข้อความแจ้งเตือน:</label>
          <p className="text-red-700 font-bold">{alert.message}</p>
        </div>

        <div>
          <label className="font-medium">จังหวัด:</label>
          <p className="text-red-700 font-bold">{alert.address?.province || '-'}</p>
        </div>

        <div>
          <label className="font-medium">เขต:</label>
          <p className="text-red-700 font-bold">{alert.address?.district || '-'}</p>
        </div>

        <div>
          <label className="font-medium">รัศมีที่ได้รับผลกระทบ:</label>
          <p className="text-gray-800">{alert.radius} เมตร</p>
        </div>

        <div>
          <label className="font-medium">วันที่:</label>
          <p className="text-gray-600 text-sm">
            {new Date(alert.createdAt).toLocaleString()}
          </p>
        </div>

        {alert.fileUrl && (
          <img
            src={alert.fileUrl}
            alt="alert"
            className="mt-2 rounded-md max-h-40 mx-auto"
          />
        )}
      </div>
    </div>
  );
}
