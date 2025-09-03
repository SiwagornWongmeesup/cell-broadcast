'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

export default function NavbarAdmin() {
  // State และ Ref สำหรับ Dropdown "จัดการข้อมูล"
  const [isManagementDropdownOpen, setIsManagementDropdownOpen] = useState(false);
  const managementDropdownRef = useRef(null);

  // State และ Ref สำหรับ Dropdown "ส่งแจ้งเตือน"
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const notificationDropdownRef = useRef(null);

  // State และ Ref สำหรับ Dropdown "ตั้งค่า"
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const settingsDropdownRef = useRef(null);

  // Effect สำหรับปิด Dropdown ทั้งหมดเมื่อคลิกนอกพื้นที่
  // useEffect(() => {
  //   function handleClickOutside(event) {
  //     if (managementDropdownRef.current && !managementDropdownRef.current.contains(event.target)) {
  //       setIsManagementDropdownOpen(false);
  //     }
  //     if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
  //       setIsNotificationDropdownOpen(false);
  //     }
  //     if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target)) {
  //       setIsSettingsDropdownOpen(false);
  //     }
  //   }

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, []);

  // ฟังก์ชันช่วยปิด Dropdown ทั้งหมด
  const closeAllDropdowns = () => {
    setIsManagementDropdownOpen(false);
    setIsNotificationDropdownOpen(false);
    setIsSettingsDropdownOpen(false);
  };

  return (
    <nav className="bg-gray-900 p-4 text-white shadow-lg">
      <div className="container mx-auto">
        <div className='flex items-center justify-between'>
          <Link href="" className="text-2xl font-bold hover:text-gray-300 transition-colors">
          Logo
          </Link>

           <div className="flex items-center space-x-4">
            <ul className="flex items-center space-x-4">

              {/* <li>
                <Link href="dashboard" className="px-3 py-2 rounded-md hover:text-gray-300 transition-colors">
                  Dashboard
                </Link>
              </li> */} 
              <li>
                  <Link href="Report" className="px-3 py-2 rounded-md hover:text-gray-300 transition-colors">
                    {/* ใส่ SVG icon หรือใช้ react-icons */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    
                  </Link>
              </li>

              

              {/* Dropdown: จัดการข้อมูล */}
              {/* <li className="relative" ref={managementDropdownRef}>
                <button
                  onClick={() => setIsManagementDropdownOpen(!isManagementDropdownOpen)}
                  className="flex items-center px-3 py-2 rounded-md hover:text-gray-300 transition-colors focus:outline-none"
                >
                  จัดการข้อมูล
                  <svg
                    className={`ml-1 w-4 h-4 transition-transform duration-200 ${isManagementDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {isManagementDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-gray-700 rounded-md shadow-lg py-1 z-10">
                    <Link onClick={closeAllDropdowns} href='/admin/incidents' className='block px-4 py-2 text-sm text-white hover:bg-gray-600 transition-colors duration-200'>รายการเหตุการณ์</Link>
                    <Link onClick={closeAllDropdowns} href='/admin/users' className='block px-4 py-2 text-sm text-white hover:bg-gray-600 transition-colors duration-200'>ผู้ใช้งาน</Link>
                    <Link onClick={closeAllDropdowns} href='/admin/content' className='block px-4 py-2 text-sm text-white hover:bg-gray-600 transition-colors duration-200'>คู่มือและข่าวสาร</Link>
                  </div>
                )}
              </li> */}

              {/* Dropdown: ส่งแจ้งเตือน */}
              {/* <li className="relative" ref={notificationDropdownRef}>
                <button
                  onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                  className="flex items-center px-3 py-2 rounded-md hover:text-gray-300 transition-colors focus:outline-none"
                >
                  แจ้งเตือน
                  <svg
                    className={`ml-1 w-4 h-4 transition-transform duration-200 ${isNotificationDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {isNotificationDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-gray-700 rounded-md shadow-lg py-1 z-10">
                    <Link onClick={closeAllDropdowns} href='notification' className='block px-4 py-2 text-sm text-white hover:bg-gray-600 transition-colors duration-200'>ส่งแจ้งเตือน</Link>
                    <Link onClick={closeAllDropdowns} href='/admin/alerts/history' className='block px-4 py-2 text-sm text-white hover:bg-gray-600 transition-colors duration-200'>ประวัติการแจ้งเตือน</Link>
                  </div>
                )}
              </li> */}

              
                <li className="relative" ref={settingsDropdownRef}>
                    <Link onClick={closeAllDropdowns} href='/admin/profile' className='block px-4 py-2 text-sm text-white hover:hover:text-gray-300 transition-colors  duration-200'>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </Link>
                </li> 
             </ul> 
           </div> 
        </div>
      </div>
    </nav>
  );
}