'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success('รีเซ็ตรหัสผ่านเรียบร้อย');
    } else {
      toast.error(data.error || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl mb-4">ตั้งรหัสผ่านใหม่</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="รหัสผ่านใหม่"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 w-full mb-4"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          รีเซ็ตรหัสผ่าน
        </button>
      </form>
    </div>
  );
}
