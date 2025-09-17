'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // Next.js App Router

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // ดึง token จาก URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดขณะรีเซ็ตรหัสผ่าน');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">รีเซ็ตรหัสผ่าน</h2>

        {success ? (
          <p className="text-green-600 text-center text-sm sm:text-base">
            รีเซ็ตรหัสผ่านเรียบร้อย สามารถล็อกอินได้เลย
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <input
              type="password"
              placeholder="รหัสผ่านใหม่"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-red-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="ยืนยันรหัสผ่านใหม่"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-red-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition-colors duration-200 w-full text-sm sm:text-base"
            >
              รีเซ็ตรหัสผ่าน
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
