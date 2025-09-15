'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [userrole] = useState('user');
  const router = useRouter();

  const [otp, setOtp] = useState('');
  const [token, setToken] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  if (session) router.push('/Homepage');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
    if (!phone || phone.length !== 10) {
      setError('กรุณากรอกเบอร์ติดต่อให้ครบถ้วน');
      setLoading(false);
      return;
    }

    try {
      if (!showOtpInput) {
        const resCheckUser = await fetch("/api/checkUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const checkData = await resCheckUser.json();
        if (checkData.user) {
          setError('มีผู้ใช้งานอีเมลนี้อยู่แล้ว');
          setLoading(false);
          return;
        }

        const resSendOtp = await fetch("/api/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, location, phone, name }),
        });
        const sendData = await resSendOtp.json();
        if (resSendOtp.ok) {
          setToken(sendData.token);
          setShowOtpInput(true);
          toast.success('✅ ส่ง OTP สำเร็จ! กรุณาตรวจสอบอีเมล', { position: "top-center", autoClose: 3000 });
        } else {
          setError(sendData.message || 'เกิดข้อผิดพลาดในการส่ง OTP');
          setLoading(false);
        }
      } else {
        const resVerifyOtp = await fetch("/api/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, otp, password }),
        });
        const verifyData = await resVerifyOtp.json();
        if (resVerifyOtp.ok) {
          const resRegister = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, phone, location, role: userrole }),
          });
          const regData = await resRegister.json();
          if (resRegister.ok) {
            toast.success('✅ ลงทะเบียนสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว', { position: "top-center", autoClose: 3000 });
            setError('');
            setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
            setPhone(''); setLocation({ lat: null, lng: null }); setAcceptTerms(false);
            setOtp(''); setToken(null); setShowOtpInput(false);
            router.push('/');
          } else {
            setError(regData.message || 'เกิดข้อผิดพลาดระหว่างลงทะเบียน');
          }
        } else {
          setError(verifyData.message || 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ');
        }
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดระหว่างการทำงาน: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
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
    <div className="flex flex-col min-h-screen">
     
      <div id="recaptcha-container"></div>

      <div className="flex-grow flex items-center justify-center bg-[url('/bg.jpg')] bg-cover bg-center p-4">
        <div className="bg-white/30 backdrop-blur-md rounded-xl shadow-xl w-full max-w-lg p-6 sm:p-8">
          <form className="flex flex-col space-y-3" onSubmit={handleSubmit}>
            {/* ชื่อ */}
            <input
              className="bg-amber-200 p-3 rounded-md w-full text-base sm:text-lg"
              type="text"
              placeholder="ชื่อผู้ใช้"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={showOtpInput}
            />

            {/* อีเมล */}
            <input
              className="bg-amber-200 p-3 rounded-md w-full text-base sm:text-lg"
              type="email"
              placeholder="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={showOtpInput}
            />

            {/* รหัสผ่าน */}
            <input
              className="bg-amber-200 p-3 rounded-md w-full text-base sm:text-lg"
              type="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={showOtpInput}
            />
            <input
              className="bg-amber-200 p-3 rounded-md w-full text-base sm:text-lg"
              type="password"
              placeholder="ยืนยันรหัสผ่าน"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={showOtpInput}
            />

            {/* เบอร์ */}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="เบอร์โทรศัพท์"
              value={phone}
              maxLength={10}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="bg-amber-200 p-3 rounded-md w-full text-base sm:text-lg"
              disabled={showOtpInput}
            />

            {/* Location */}
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <button
                type="button"
                className="bg-blue-500 text-white p-3 rounded-md w-full sm:w-auto hover:bg-blue-600 transition"
                onClick={getLocation}
                disabled={showOtpInput}
              >
                ใช้ตำแหน่งปัจจุบัน
              </button>
              <input
                className="bg-amber-200 p-3 rounded-md flex-1 text-base sm:text-lg"
                type="text"
                placeholder="พิกัด"
                value={location.lat && location.lng ? `${location.lat}, ${location.lng}` : ''}
                readOnly
                disabled={showOtpInput}
              />
            </div>

            {/* Terms */}
            {!showOtpInput && (
              <label className="flex items-center text-sm sm:text-base">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={() => setAcceptTerms(!acceptTerms)}
                  required
                  className="mr-2"
                />
                ฉันยอมรับเงื่อนไขการใช้งาน
              </label>
            )}

            {/* OTP */}
            {showOtpInput && (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="กรอกรหัส OTP (6 หลัก)"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/, ""))}
                maxLength={6}
                required
                className="bg-amber-200 p-3 rounded-md w-full text-base sm:text-lg"
              />
            )}

            {error && <p className="text-red-700 text-sm sm:text-base">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#D4583B] text-white p-3 rounded-md w-full sm:w-auto hover:bg-[#c5462c] transition text-base sm:text-lg"
            >
              {loading ? 'กำลังดำเนินการ...' : showOtpInput ? 'ยืนยัน OTP และลงทะเบียน' : 'ส่ง OTP'}
            </button>

            <p className="text-center text-gray-800 text-sm sm:text-base">
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
