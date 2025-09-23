'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(50); // วินาที
  const [countdown, setCountdown] = useState(0);

  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      if (session.user.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {  
        router.replace('/Homepage');
      }
    }
  }, [session]);

  useEffect(() => {
    let timer;
    if (isLocked && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown <= 0 && isLocked) {
      setIsLocked(false);
      setAttempts(0);
    }

    return () => clearInterval(timer);
  }, [isLocked, countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      setError(`บัญชีถูกล็อก กรุณารอ ${countdown} วินาที`);
      return;
    }

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res.error) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 5) {
          const newLockTime = 50 * Math.ceil(newAttempts / 5);
          setCountdown(newLockTime);
          setLockTime(newLockTime);
          setIsLocked(true);
          setError(`พยายามผิดเกิน 5 ครั้ง บัญชีถูกล็อก ${newLockTime} วินาที`);
        } else {
          setError(`กรอกข้อมูลผิดครั้งที่ ${newAttempts}`);
        }
        return;
      }

      setError('');
      setAttempts(0);
    } catch (error) {
      console.log(error);
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
   

      {/* พื้นหลังเต็มจอ */}
      <div className="relative flex-1">
        {/* รูปพื้นหลัง */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg.jpg')" }}
        ></div>

        {/* ชั้น Overlay โปร่งใส */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* ฟอร์มอยู่ตรงกลาง */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6">
          <div className="bg-white/30 backdrop-blur-md rounded-xl shadow-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8">
            {/* หัวข้อ */}
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-800">
              เข้าสู่ระบบ
            </h2>

            {/* ฟอร์ม */}
            <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
              {error && (
                <p className="text-red-700 text-center text-sm sm:text-base">{error}</p>
              )}

              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="block w-full bg-amber-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 text-base"
                placeholder="กรุณากรอกอีเมล"
                disabled={isLocked}
              />

              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                className="block w-full bg-amber-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 text-base"
                placeholder="กรุณากรอกรหัสผ่าน"
                disabled={isLocked}
              />

              <button
                className={`w-full p-3 rounded-md text-white font-semibold transition-colors text-base ${
                  isLocked
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
                type="submit"
                disabled={isLocked}
              >
                {isLocked ? `รอ ${countdown} วินาที` : 'เข้าสู่ระบบ'}
              </button>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-stone-700 underline hover:text-stone-900"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
            </form>

            <hr className="my-4" />
            <p className="text-center text-sm sm:text-base">
              ยังไม่มีบัญชีผู้ใช้?
              <Link
                className="text-rose-600 hover:text-rose-700 hover:underline pl-1.5"
                href="/register"
              >
                ลงทะเบียน
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;