  // components/navbar.jsx
'use client'
import React, { useState, useRef, useEffect } from 'react' // <--- เพิ่ม useState, useRef, useEffect
import Link from 'next/link' 
import { signOut } from 'next-auth/react'

function Navbar({session}) { 

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef(null);

  // Effect สำหรับปิด Dropdown เมื่อคลิกนอกพื้นที่
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
      }
    }
    // เพิ่ม event listener เมื่อ component mount
    document.addEventListener("mousedown", handleClickOutside);
    // ลบ event listener เมื่อ component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className='bg-black text-white p-5'> 
      <div className="container mx-auto">
        <div className='flex items-center justify-between'>
          <div>
            <Link href="/" className="text-2xl font-bold text-gray-800 dark:text-white">Logo</Link>
          </div>
          <ul className='flex space-x-4'>
            {!session ? (
              <>  
                <li><Link href='/' className='hover:text-gray-300 transition-colors duration-200'>Sing in</Link></li>
                <li><Link href='/register' className='hover:text-gray-300 transition-colors duration-200'>Sing Up</Link></li>
              </>
            ): (
              <>
                <li><Link href='/Homepage' className='flex items-center text-white px-1 py-1 rounded-md my-2 hover:text-gray-300 transition-colors duration-200'>หน้าหลัก</Link></li>
                   <li><Link href='/incident' className='flex items-center bg-green-600 border text-white px-1 py-1 rounded-md my-2 hover:text-gray-300 transition-colors duration-200'>แจ้งเหตุ</Link></li>

                {/* --- ส่วนของ Dropdown "คู่มือรับมือ" --- */}
                <li className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center text-white px-1 py-1 rounded-md my-2 hover:text-gray-300 transition-colors duration-200 focus:outline-none"
                  >
                    ข้อมูล
                    {/* ไอคอนลูกศรชี้ลง */}
                    <svg
                      className={`ml-1 w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10">
                      <Link href='/manual/level' className='block px-4 py-2 text-sm text-white hover:bg-gray-600 transition-colors duration-200'>ข่าวสาร</Link>
                      <Link href='/Copingguide' className='block px-4 py-2 text-sm text-white hover:bg-gray-600 transition-colors duration-200'>คู่มือรับมือ</Link>
                      <Link href='/manual/level' className='block px-4 py-2 text-sm text-white hover:bg-gray-600 transition-colors duration-200'>ระดับการแจ้งเตือน</Link>
                      <Link href='/Contact' className='block px-4 py-2 text-sm text-white hover:bg-gray-600 transition-colors duration-200'>ติดต่อเรา</Link>
                    </div>
                  )}
                </li>
                {/* --- สิ้นสุดส่วนของ Dropdown --- */}

                    <li className="relative" ref={accountDropdownRef}>
                  <button
                    onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                    className="flex items-center text-white px-1 py-1 rounded-md my-2 hover:text-gray-300 transition-colors duration-200 focus:outline-none"
                  >
                    บัญชีของฉัน
                    {/* ไอคอนลูกศรชี้ลง */}
                    <svg
                      className={`ml-1 w-4 h-4 transition-transform duration-200 ${isAccountDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  {isAccountDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10">
                      <Link href='/alertshistory' className='block px-4 py-2 text-sm text-white hover:bg-gray-600 transition-colors duration-200'>ประวัติการแจ้งเตือน</Link>
                      <Link href='/profile' className='block px-4 py-2 text-sm text-white hover:bg-gray-600 transition-colors duration-200'>โปรไฟล์</Link>
                      <Link href='/manual/level' className='block px-4 py-2 text-sm text-white hover:bg-gray-600 transition-colors duration-200'>ออกจากระบบ</Link>
                    </div>
                  )}
                </li>

                  
                  
                  <li><a onClick={() => signOut()} className='flex items-center bg-red-500 text-white border px-1 py-1 rounded-md my-2 cursor-pointer hover:bg-red-600 transition-colors duration-200'>Logout</a></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar