// app/admin/layout.jsx
'use client'; // <-- ต้องใช้ 'use client' เพราะมีการใช้ hooks

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import NavbarAdmin from '../components/navbarAdmin'; 
import Sidebar from '../components/Sidebar';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect Logic สำหรับการตรวจสอบสิทธิ์
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.replace('/'); 
    } else if (session.user.role !== 'admin') {
      router.replace('/Homepage');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  // Layout ของ Admin
  return (
    <div className="flex flex-col h-screen ">
      <NavbarAdmin />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}