'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Sidebar({ session }) {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState({});

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    {
      name: 'จัดการข้อมูล',
      submenu: [
        { name: 'รายงานเหตุการณ์', href: '/admin/Report' },
        { name: 'ผู้ใช้งาน', href: '/admin/users' },
        { name: 'คู่มือและข่าวสาร', href: '/admin/content' },
      ],
    },
    {
      name: 'แจ้งเตือน',
      submenu: [
        { name: 'ส่งแจ้งเตือน', href: '/admin/notification' },
        { name: 'ประวัติการแจ้งเตือน', href: '/admin/Notificationhistory' },
      ],
    },
  ];

  const isActive = (href) => href && pathname.startsWith(href);

  return (
    // ซ่อนบนมือถือ, แสดงบน Desktop
    <aside className="hidden md:flex md:flex-col w-64 bg-gray-800 text-white p-4 shadow-lg min-h-screen">
      {/* ส่วนบน */}
      <div className="text-2xl font-bold mb-8 text-blue-300">
        <Link href="/admin/dashboard">{session?.user?.name || 'Admin Dashboard'}</Link>
      </div>

      {/* ส่วนกลาง: เมนูหลัก */}
      <nav className="flex-1">
        <ul>
          {menuItems.map(item => (
            <li key={item.name} className="mb-2">
              {item.href ? (
                <Link
                  href={item.href}
                  className={`flex items-center py-2 px-3 rounded-md transition-colors duration-200 ${
                    isActive(item.href) ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
                  }`}
                >
                  <span>{item.name}</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`flex items-center justify-between w-full py-2 px-3 text-left rounded-md transition-colors duration-200 ${
                      item.submenu.some(sub => isActive(sub.href)) ? 'bg-blue-600' : 'hover:bg-gray-700'
                    }`}
                  >
                    <span className="font-semibold">{item.name}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${openSubmenus[item.name] ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {openSubmenus[item.name] && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {item.submenu.map(sub => (
                        <li key={sub.name}>
                          <Link
                            href={sub.href}
                            className={`block py-1 px-3 text-sm rounded-md transition-colors duration-200 ${
                              isActive(sub.href) ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
                            }`}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center w-full py-2 px-3 rounded-md text-red-400 hover:bg-gray-700 transition-colors duration-200"
        >
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
