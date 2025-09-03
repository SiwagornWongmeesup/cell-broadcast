// app/admin/_components/Sidebar.jsx (สำหรับ App Router)
// หรือ components/layout/Sidebar.jsx (สำหรับ Pages Router)

'use client'; // จำเป็นสำหรับ Client Components ใน App Router

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // สำหรับ App Router
import { signOut } from 'next-auth/react';
// import { useRouter } from 'next/router'; // สำหรับ Pages Router ถ้าคุณใช้ Pages Router ให้ uncomment บรรทัดนี้และคอมเมนต์ usePathname

import { useState } from 'react';

// คุณสามารถติดตั้ง react-icons เพื่อใช้ไอคอนสวยๆ ได้: npm install react-icons
// import { FaHome, FaUsers, FaClipboardList, FaBell, FaCog, FaSignOutAlt, FaChevronRight, FaPlus, FaHistory, FaBook, FaNewspaper, FaChartBar } from 'react-icons/fa';

export default function Sidebar({ session }) {
  const pathname = usePathname(); // ใช้สำหรับ App Router
  // const router = useRouter(); // สำหรับ Pages Router
  // const pathname = router.pathname; // สำหรับ Pages Router

  // State สำหรับเก็บสถานะการเปิด/ปิด Sub-menu
  // คีย์คือชื่อเมนูหลัก, ค่าคือ boolean (true = เปิด, false = ปิด)
  const [openSubmenus, setOpenSubmenus] = useState({});

  // ฟังก์ชันสลับสถานะการเปิด/ปิด Sub-menu
  const toggleSubmenu = (menuName) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName] // สลับค่า true/false ของเมนูนั้น
    }));
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      // icon: <FaHome className="w-5 h-5 mr-3" />, // ตัวอย่างไอคอน (ถ้าใช้ react-icons)
    },
    {
      name: 'จัดการข้อมูล',
      // icon: <FaClipboardList className="w-5 h-5 mr-3" />, // ตัวอย่างไอคอน
      submenu: [
        { name: 'รายการเหตุการณ์', href: '/admin/incidents' },//หน้าจัดการข้อความที่แอดมินส่งให้userสามารถลบได้
        { name: 'ผู้ใช้งาน', href: '/admin/users' },
        { name: 'คู่มือและข่าวสาร', href: '/admin/content' },
      ],
    },
    {
      name: 'แจ้งเตือน',
      
      submenu: [
        { name: 'ส่งแจ้งเตือน', href: 'notification' }, 
        { name: 'ประวัติการแจ้งเตือน', href: 'Notificationhistory' }, 

      ],
    },
    {
      name: 'ตั้งค่า',
      // icon: <FaCog className="w-5 h-5 mr-3" />, // ตัวอย่างไอคอน
      submenu: [
        
        { name: 'ตั้งค่าระบบ', href: '/admin/settings' },
      ],
    },
    // คุณสามารถเพิ่มเมนูอื่นๆ ได้ที่นี่ เช่น:
    // {
    //   name: 'รายงานสถิติ',
    //   href: '/admin/reports',
    //   icon: <FaChartBar className="w-5 h-5 mr-3" />,
    // },
    // หรือเมนูที่นำไปสู่หน้าอื่นๆ
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col shadow-lg">
      {/* ส่วนบน: โลโก้/ชื่อระบบใน Sidebar */}
      <div className="text-2xl font-bold mb-8 text-blue-300">
        <Link href="/admin/dashboard">{session?.user?.name || 'Admin Dashboard'}</Link> 
      </div>

      {/* ส่วนกลาง: เมนูนำทางหลัก */}
      <nav className="flex-1">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-2">
              {item.href ? (
                // เมนูหลักที่ไม่มี Sub-menu (เช่น Dashboard)
                <Link
                  href={item.href}
                  className={`flex items-center py-2 px-3 rounded-md transition-colors duration-200 ${
                    pathname === item.href ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
                  }`}
                >
                  {/* {item.icon} */} {/* ถ้าใช้ react-icons ก็เอาคอมเมนต์ออก */}
                  <span>{item.name}</span>
                </Link>
              ) : (
                // เมนูที่มี Sub-menu (มี Collapse/Expand)
                <>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className="flex items-center justify-between w-full py-2 px-3 text-left rounded-md hover:bg-gray-700 transition-colors duration-200"
                  >
                    <span className="flex items-center">
                      {/* {item.icon} */} {/* ถ้าใช้ react-icons ก็เอาคอมเมนต์ออก */}
                      <span className="font-semibold">{item.name}</span>
                    </span>
                    {/* ไอคอนสำหรับแสดงสถานะเปิด/ปิด Sub-menu (หมุนได้เมื่อเปิด) */}
                    <svg className={`w-4 h-4 transition-transform duration-200 ${openSubmenus[item.name] ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                  {openSubmenus[item.name] && item.submenu && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            href={subItem.href}
                            className={`block py-1 px-3 text-sm rounded-md transition-colors duration-200 ${
                              pathname === subItem.href ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
                            }`}
                          >
                            {subItem.name}
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

      {/* ส่วนล่าง: ปุ่ม Logout (เป็นทางเลือก) */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: '/' })} // ใช้ signOut จาก next-auth/react
          className="flex items-center w-full py-2 px-3 rounded-md text-red-400 hover:bg-gray-700 transition-colors duration-200"
        >
          {/* <FaSignOutAlt className="w-5 h-5 mr-3" /> */} {/* ถ้าใช้ react-icons ก็เอาคอมเมนต์ออก */}
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}