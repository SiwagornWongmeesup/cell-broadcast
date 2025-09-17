'use client'

import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.message || 'เกิดข้อผิดพลาดบางอย่าง');
      }
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดขณะส่งลิงก์รีเซ็ตรหัสผ่าน');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">ลืมรหัสผ่าน</h2>

        {success ? (
          <p className="text-green-600 text-center text-sm sm:text-base">
            ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <input
              type="email"
              placeholder="กรอกอีเมลของคุณ"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-red-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition-colors duration-200 w-full text-sm sm:text-base"
            >
              ส่งลิงก์รีเซ็ตรหัสผ่าน
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
