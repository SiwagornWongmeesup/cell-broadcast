'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavbarAdmin({ session }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const pathname = usePathname();

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    {
      name: 'จัดการข้อมูล',
      submenu: [
        { name: 'รายการเหตุการณ์', href: '/admin/incidents' },
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
    {
      name: 'ตั้งค่า',
      submenu: [{ name: 'ตั้งค่าระบบ', href: '/admin/settings' }],
    },
    { name: 'ออกจากระบบ', action: () => signOut({ callbackUrl: '/' }) },
  ];

  const isActive = (href) => href && pathname.startsWith(href);

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto flex flex-wrap items-center justify-between p-4">
        {/* Logo */}
        <div className="flex items-center">
          <img src="/Logo.png" alt="Logo" className="h-12 w-12 mr-2" />
          {session?.user?.name && <span className="ml-2 font-semibold">{session.user.name}</span>}
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {menuItems.map((item) =>
            item.href ? (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-md transition-colors ${
                  isActive(item.href) ? 'bg-blue-600 text-white' : 'hover:text-gray-300'
                }`}
              >
                {item.name}
              </Link>
            ) : item.submenu ? (
              <div key={item.name} className="relative group">
                <button
                  className={`px-3 py-2 rounded-md transition-colors hover:text-gray-300`}
                >
                  {item.name}
                </button>
                <ul className="absolute hidden group-hover:block bg-gray-800 mt-2 rounded shadow-lg min-w-[180px] z-10">
                  {item.submenu.map((sub) => (
                    <li key={sub.name}>
                      <Link
                        href={sub.href}
                        className={`block px-4 py-2 hover:bg-gray-700 ${
                          isActive(sub.href) ? 'bg-blue-600 text-white' : ''
                        }`}
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : item.action ? (
              <button
                key={item.name}
                onClick={item.action}
                className="px-3 py-2 rounded-md hover:text-gray-300"
              >
                {item.name}
              </button>
            ) : null
          )}
        </div>

        {/* Hamburger Button */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <ul className="md:hidden bg-gray-800 text-white px-4 py-2 space-y-2 max-w-full overflow-x-auto">
          {menuItems.map((item) => (
            <li key={item.name}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`block px-3 py-2 rounded-md transition-colors ${
                    isActive(item.href) ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ) : item.action ? (
                <button
                  onClick={() => {
                    item.action();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-700"
                >
                  {item.name}
                </button>
              ) : item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`flex justify-between w-full px-3 py-2 rounded-md hover:bg-gray-700 ${
                      item.submenu.some((sub) => isActive(sub.href)) ? 'bg-blue-600' : ''
                    }`}
                  >
                    <span>{item.name}</span>
                    <span
                      className={`transform transition-transform ${
                        openSubmenus[item.name] ? 'rotate-90' : ''
                      }`}
                    >
                      &gt;
                    </span>
                  </button>
                  {openSubmenus[item.name] && (
                    <ul className="ml-4 mt-1 space-y-1 max-w-full overflow-x-auto">
                      {item.submenu.map((sub) => (
                        <li key={sub.name}>
                          <Link
                            href={sub.href}
                            className={`block px-3 py-2 rounded-md transition-colors ${
                              isActive(sub.href) ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
                            }`}
                            onClick={() => setMenuOpen(false)}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
