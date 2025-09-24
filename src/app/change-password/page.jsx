'use client';
import { useState } from 'react';

export default function ChangePassword() {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!currentPwd || !newPwd || !confirmPwd) {
      setMessage('กรุณากรอกทุกช่อง');
      return;
    }

    if (newPwd !== confirmPwd) {
      setMessage('รหัสผ่านใหม่และยืนยันรหัสไม่ตรงกัน');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPwd, newPwd }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('เปลี่ยนรหัสสำเร็จ');
        setCurrentPwd('');
        setNewPwd('');
        setConfirmPwd('');
      } else {
        setMessage(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      setMessage('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">เปลี่ยนรหัสผ่าน</h2>

        {message && (
          <div
            className={`mb-4 p-2 text-sm rounded ${
              message.includes('สำเร็จ') ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">รหัสผ่านปัจจุบัน</label>
            <input
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">รหัสผ่านใหม่</label>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'กำลังเปลี่ยนรหัส...' : 'เปลี่ยนรหัสผ่าน'}
          </button>
        </form>
      </div>
    </div>
  );
}
