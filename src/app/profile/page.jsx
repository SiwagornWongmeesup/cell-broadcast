'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="text-lg sm:text-xl font-semibold text-white p-6 sm:p-8 bg-red-700 rounded-lg shadow-lg">
          กำลังโหลดข้อมูลโปรไฟล์...
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="text-lg sm:text-xl font-semibold text-red-500 p-6 sm:p-8  rounded-lg shadow-lg">
          คุณต้องเข้าสู่ระบบเพื่อดูโปรไฟล์
        </div>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center px-4">
      <div className="w-full max-w-2xl bg-gradient-to-br from-red-600 to-black rounded-2xl shadow-lg p-6 sm:p-10">
        
        {/* Profile Image */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src={user.profileImage || "/default-avatar.png"}
              alt="Profile"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-red-500 object-cover"
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

        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
          โปรไฟล์ของฉัน
        </h1>

        {/* Profile Info */}
        <div className="space-y-4">
          <InfoRow label="ชื่อ" value={user.name} />
          <InfoRow label="อีเมล" value={user.email} />
          <InfoRow label="เบอร์โทร" value={user.phone || "—"} />
          <InfoRow label="รหัสผ่าน" value="********" isPassword />
          <InfoRow label="ที่อยู่ปัจจุบัน" value={user.address || "—"} />
          <InfoRow label="เกี่ยวกับตัวเอง" value={user.aboutMe || "—"} />
          <InfoRow label="Instagram" value={user.igHandle || "—"} />
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/profile/Edit')}
            className="w-full sm:w-1/2 px-4 py-2 bg-red-500 hover:bg-red-700 rounded-lg shadow-md"
          >
            แก้ไขโปรไฟล์
          </button>
          <button
            onClick={() => router.push('/reset-password')}
            className="w-full sm:w-1/2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg shadow-md"
          >
            เปลี่ยนรหัสผ่าน
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, isPassword }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-600 pb-2">
      <span className="font-semibold">{label}</span>
      <span className="text-gray-200 break-words">
        {isPassword ? "********" : value}
      </span>
    </div>
  );
}
