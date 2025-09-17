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
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while sending reset link.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">ลืมรหัสผ่าน</h2>

        {success ? (
          <p className="text-green-600 text-center">ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <input
              type="email"
              placeholder="กรอกอีเมลของคุณ"
              className="border border-gray-300 p-3 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600"
            >
               ส่งลิงก์รีเซ็ตรหัสผ่าน
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
