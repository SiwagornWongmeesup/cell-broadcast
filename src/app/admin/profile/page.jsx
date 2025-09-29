'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";

export default function ProfileAdmin() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!session?.user?.id) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile?userId=${session.user.id}`);
        const data = await res.json();
        if (res.ok) {
          setUser(data.user || {
            name: session.user.name || '',
            email: session.user.email || '',
            phone: session.user.phone || '',
          });
          setProfile(data.profile || {
            bio: '',
            address: '',
            instagram: '',
            profileImage: '',
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setUser({
          name: session.user.name || '',
          email: session.user.email || '',
          phone: session.user.phone || '',
        });
        setProfile({
          bio: '',
          address: '',
          instagram: '',
          profileImage: '',
        });
      }
    };

    fetchProfile();
  }, [session?.user?.id, status]);

  if (status === 'loading' || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-200 bg-black">
        กำลังโหลดข้อมูลโปรไฟล์...
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 bg-black">
        คุณต้องเข้าสู่ระบบเพื่อดูโปรไฟล์
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar เฉพาะ admin */}
      {session?.user?.role === "admin" && (
        <div className="hidden md:block w-64 bg-gray-900 border-r border-gray-700">
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex justify-center items-center p-4">
        <div className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-red-900 rounded-2xl shadow-xl p-6 sm:p-10">
          {/* Profile Image */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src={profile?.profileImage || "/default-avatar.png"}
                alt="Profile"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-red-500 object-cover shadow-lg"
              />
              <button
                onClick={() => router.push('/profile/Edit')}
                className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-md"
                title="แก้ไขรูปภาพ"
              >
                ✏️
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-red-400">
            โปรไฟล์ของฉัน
          </h1>

          {/* Profile Info */}
          <div className="space-y-4">
            <InfoRow label="ชื่อ" value={user?.name || "—"} />
            <InfoRow label="อีเมล" value={user?.email || "—"} />
            <InfoRow label="เบอร์โทร" value={user?.phone || "—"} />
            <InfoRow label="รหัสผ่าน" value="********" isPassword />
            <InfoRow label="ที่อยู่ปัจจุบัน" value={profile?.address || "—"} />
            <InfoRow label="เกี่ยวกับตัวเอง" value={profile?.bio || "—"} />
            <InfoRow label="Instagram" value={profile?.instagram || "—"} />
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/profile/Edit')}
              className="w-full sm:w-1/2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition"
            >
              แก้ไขโปรไฟล์
            </button>
            <button
              onClick={() => router.push('/change-password')}
              className="w-full sm:w-1/2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg shadow-md transition"
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, isPassword }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-700 pb-2">
      <span className="font-semibold text-red-300">{label}</span>
      <span className="text-gray-200 break-words">
        {isPassword ? "********" : value}
      </span>
    </div>
  );
}
