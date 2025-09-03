'use client'
import Navbar from "../app/components/navbar";
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
        router.replace('/admin/dashboard'); // เปลี่ยนเส้นทางไปยังหน้า Admin
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
          const newLockTime = 50 * Math.ceil(newAttempts / 5); // เพิ่มเวลาล็อกทุก 5 ครั้ง
          setCountdown(newLockTime);
          setLockTime(newLockTime);
          setIsLocked(true);
          setError(`พยายามผิดเกิน 5 ครั้ง บัญชีถูกล็อก ${newLockTime} วินาที`);
        } else {
          setError(`กรอกข้อมูลผิดครั้งที่ ${newAttempts}`);
        }
        return;
      }

      // ล็อกอินสำเร็จ
      setError('');
      setAttempts(0);
    } catch (error) {
      console.log(error);
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  }

  return (
    <div>
      <Navbar />
      <div className="bg-[url('/bg.jpg')] bg-cover bg-center min-h-screen flex items-center justify-center">
        <div className="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md">
          <form className='flex flex-col' onSubmit={handleSubmit}>
            {error && <p className="text-red-700 text-sm">{error}</p>}
            <input
              onChange={(e) => setEmail(e.target.value)}
              className='block bg-amber-200 p-3 my-3 rounded-md'
              placeholder='กรุณากรอกอีเมล'
              disabled={isLocked}
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              type='password'
              className='block bg-amber-200 p-3 my-3 rounded-md'
              placeholder='กรุณากรอกรหัสผ่าน'
              disabled={isLocked}
            />
            <button
              className={`p-2 my-3 rounded-md ${isLocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 cursor-pointer'}`}
              type='submit'
              disabled={isLocked}
            >
              {isLocked ? `รอ ${countdown} วินาที` : 'เข้าสู่ระบบ'}
            </button>

            <Link href="/forgot-password" className="text-sm text-stone-700 underline text-right">
              ลืมรหัสผ่าน?
            </Link>
          </form>

          <hr className='my-3' />
          <p>ยังไม่มีบัญชีผู้ใช้?
            <Link className='text-rose-900 hover:underline pl-1.5' href="/register">ลงทะเบียน</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
