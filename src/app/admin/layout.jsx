// app/admin/layout.jsx
'use client'; // <-- ต้องใช้ 'use client' เพราะมีการใช้ hooks

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
    return <div className="text-center text-gray-700 text-lg mt-8">กำลังโหลดข้อมูล...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  
  return (
    <main>
      {children}
    </main>
  );
}