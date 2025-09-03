import React from 'react'

export default function Notificationhistory() {
  // สร้างข้อมูลสมมติสำหรับตาราง
  const recentAlerts = [
    { id: '#001', type: 'ภัยน้ำท่วม', message: 'กรุงเทพฯ ระดับน้ำเพิ่มขึ้น', status: 'สำเร็จ', area: 'กรุงเทพฯ', time: '2025-08-04 10:00' },
    { id: '#002', type: 'แผ่นดินไหว', message: 'รู้สึกสั่นสะเทือนในภาคเหนือ', status: 'สำเร็จ', area: 'เชียงใหม่', time: '2025-08-03 15:30' },
    { id: '#003', type: 'ไฟไหม้', message: 'เกิดเหตุเพลิงไหม้ที่ตลาด', status: 'ล้มเหลว', area: 'โคราช', time: '2025-08-02 08:15' },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">ภาพรวม Dashboard</h1>

      {/* Grid สำหรับ Card Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* ... โค้ด Card Metrics เดิม ... */}
      </div>

      {/* Grid สำหรับกราฟ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ... โค้ดกราฟเดิม ... */}
      </div>

      {/* ตารางแสดงข้อมูลการแจ้งเตือนล่าสุด */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">การแจ้งเตือนล่าสุด</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-left text-gray-600 uppercase text-sm">
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">ประเภท</th>
                <th className="py-3 px-6">ข้อความ</th>
                <th className="py-3 px-6">พื้นที่</th>
                <th className="py-3 px-6">สถานะ</th>
                <th className="py-3 px-6">เวลา</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {recentAlerts.map((alert, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6">{alert.id}</td>
                  <td className="py-3 px-6">{alert.type}</td>
                  <td className="py-3 px-6">{alert.message}</td>
                  <td className="py-3 px-6">{alert.area}</td>
                  <td className="py-3 px-6">
                    <span className={`py-1 px-3 rounded-full text-xs font-semibold 
                      ${alert.status === 'สำเร็จ' ? 'bg-green-200 text-green-600' : 'bg-red-200 text-red-600'}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">{alert.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}