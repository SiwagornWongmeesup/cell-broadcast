'use client';

import React, { useState } from 'react';
import Navbar from "../components/navbar";
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function Register() {
  // State หลัก
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [userrole] = useState('user');
  const router = useRouter();

  // State สำหรับ OTP
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);

  // UI
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check session
  const { data: session } = useSession();
  if (session) router.push('/Homepage');

  // ====== Submit Register ======
 

         const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  // ตรวจสอบความถูกต้องเบื้องต้น
  if (!name || !email || !password || !confirmPassword) {
    setError('กรุณากรอกข้อมูลให้ครบถ้วน');
    setLoading(false);
    return;
  }
  if (password !== confirmPassword) {
    setError('รหัสผ่านไม่ตรงกัน');
    setLoading(false);
    return;
  }
  if (!acceptTerms) {
    setError('กรุณายอมรับเงื่อนไขการใช้งาน');
    setLoading(false);
    return;
  }

  try {
    if (!showOtpInput) {
      // 1️⃣ ตรวจสอบผู้ใช้อีเมลซ้ำ
      const resCheckUser = await fetch("/api/checkUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let checkData;
      try {
        checkData = await resCheckUser.json();
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการตรวจสอบผู้ใช้");
        setLoading(false);
        return;
      }

      if (checkData.user) {
        setError('มีผู้ใช้งานอีเมลนี้อยู่แล้ว');
        setLoading(false);
        return;
      }

      // 2️⃣ ส่ง OTP
      const resSendOtp = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, location, phone, name }),
      });

      let sendData;
      try {
        sendData = await resSendOtp.json();
      } catch (err) {
        console.error("Error parsing JSON from send-otp:", err);
        setError("เกิดข้อผิดพลาดในการส่ง OTP (response ไม่ถูกต้อง)");
        setLoading(false);
        return;
      }

      if (resSendOtp.ok) {
        setToken(sendData.token);
        setShowOtpInput(true);
        toast.success('✅ ส่ง OTP สำเร็จ! กรุณาตรวจสอบอีเมล', { position: "top-center", autoClose: 3000 });
      } else {
        setError(sendData.message || 'เกิดข้อผิดพลาดในการส่ง OTP');
        setLoading(false);
      }

    } else {
      // 3️⃣ ตรวจ OTP และลงทะเบียน
      const resVerifyOtp = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, otp, password }),
        
      });

      let verifyData;
      try {
        verifyData = await resVerifyOtp.json();
      } catch (err) {
        console.error("Error parsing JSON from verify-otp:", err);
        setError("เกิดข้อผิดพลาดในการตรวจสอบ OTP (response ไม่ถูกต้อง)");
        setLoading(false);
        return;
      }

      if (resVerifyOtp.ok) {
        // OTP ถูกต้อง → ลงทะเบียน
        const resRegister = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, phone, location, role: userrole }),
        });

        let regData;
        try {
          regData = await resRegister.json();
        } catch (err) {
          setError("เกิดข้อผิดพลาดระหว่างลงทะเบียน (response ไม่ถูกต้อง)");
          setLoading(false);
          return;
        }

        if (resRegister.ok) {
          toast.success('✅ ลงทะเบียนสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว', { position: "top-center", autoClose: 3000 });
         
          setError('');
          setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
          setPhone(''); setLocation(''); setAcceptTerms(false);
          setOtp(''); setToken(null); setShowOtpInput(false);
          router.push('/');
        } else {
          setError(regData.message || 'เกิดข้อผิดพลาดระหว่างลงทะเบียน');
        }
      } else {
        setError(verifyData.message || 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ');
      }
    }
  } catch (error) {
    setError("เกิดข้อผิดพลาดระหว่างการทำงาน: " + error.message);
  } finally {
    setLoading(false);
  }
};

  
  // ====== Location ======
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
          toast.success('✅ ดึงตำแหน่งสำเร็จ!', { position: "bottom-right", autoClose: 1500 });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED: setError("คุณต้องอนุญาตให้แอปเข้าถึงตำแหน่ง"); break;
            case error.POSITION_UNAVAILABLE: setError("ไม่สามารถดึงตำแหน่งของคุณได้"); break;
            case error.TIMEOUT: setError("การดึงตำแหน่งของคุณใช้เวลานานเกินไป"); break;
            default: setError("เกิดข้อผิดพลาดไม่ทราบสาเหตุ"); break;
          }
        }
      );
    } else {
      setError("เบราว์เซอร์ไม่รองรับการดึงตำแหน่ง");
    }
  };

  return (
    <div>
      <Navbar />
      <div id="recaptcha-container"></div>
      <div className="bg-[url('/bg.jpg')] bg-cover bg-center min-h-screen flex items-center justify-center">
        <div className="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md mt-10">
          <form className="flex flex-col overflow-hidden" onSubmit={handleSubmit}>
            <input
              className="bg-amber-200 p-3 my-2 rounded-md"
              type="text"
              placeholder="ชื่อผู้ใช้"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={showOtpInput}
            />
            <input
              className="bg-amber-200 p-3 my-2 rounded-md"
              type="email"
              placeholder="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={showOtpInput}
            />
            <input
              className="bg-amber-200 p-3 my-2 rounded-md"
              type="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={showOtpInput}
            />
            <input
              className="bg-amber-200 p-3 my-2 rounded-md"
              type="password"
              placeholder="ยืนยันรหัสผ่าน"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={showOtpInput}
            />
            <div className="flex space-x-2 my-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="เบอร์โทรศัพท์"
                value={phone}
                maxLength={10}
                onChange={(e) => setPhone(e.target.value.replace(/\D/, ""))}
                className="bg-amber-200 p-3 rounded-md w-full"
                disabled={showOtpInput}
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="bg-blue-500 text-white px-3 py-2 rounded-md cursor-pointer disabled:opacity-50"
                onClick={getLocation}
                disabled={showOtpInput}
              >
                ใช้ตำแหน่งปัจจุบัน
              </button>
              <input
                className="bg-amber-200 p-3 my-2 rounded-md flex-1"
                type="text"
                placeholder="พิกัด"
                value={location}
                readOnly
                disabled={showOtpInput}
              />
            </div>
            
            {!showOtpInput && (
              <label className="my-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={() => setAcceptTerms(!acceptTerms)}
                  required
                />
                <span className="ml-2">ฉันยอมรับเงื่อนไขการใช้งาน</span>
              </label>
            )}

            {/* ส่วนสำหรับกรอก OTP */}
            {showOtpInput && (
              <div className="my-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="กรอกรหัส OTP (6 หลัก)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/, ""))}
                  maxLength={6}
                  required
                  className="bg-amber-200 p-3 rounded-md w-full"
                />
              </div>
            )}
            
            {error && <p className="text-red-700 text-sm">{error}</p>}
            
            <button
              style={{ backgroundColor: '#D4583B' }}
              className="text-white p-2 my-3 rounded-md cursor-pointer disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? 'กำลังดำเนินการ...' : showOtpInput ? 'ยืนยัน OTP และลงทะเบียน' : 'ส่ง OTP'}
            </button>
            
            <p className="text-center text-gray-800">
              มีบัญชีอยู่แล้ว?
              <Link className="text-white hover:underline ml-1" href="/">
                เข้าสู่ระบบ
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;