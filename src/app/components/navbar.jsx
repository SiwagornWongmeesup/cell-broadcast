'use client'
import React, { useState, useRef, useEffect } from 'react' 
import Link from 'next/link' 
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

function Navbar({ session }) { 
  const pathname = usePathname();
  const isActive = (path) => pathname.toLowerCase().startsWith(path.toLowerCase());

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ปิด dropdown เมื่อคลิกนอกพื้นที่
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className='bg-black text-white p-5 z-50 relative'>
      <div className="container mx-auto flex items-center justify-between">
        <div>
          <a href="/Homepage">
          <img src="/Logo.png" alt="" className="h-18 w-18" />
          </a>
        </div>

        {/* Hamburger สำหรับมือถือ */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        <ul className={`flex-col md:flex-row md:flex space-y-2 md:space-y-0 md:space-x-4 absolute md:static top-20 left-0 w-full md:w-auto bg-black md:bg-transparent p-4 md:p-0 transition-all duration-300 z-100 ${isMobileMenuOpen ? 'flex' : 'hidden md:flex'}`}>
          {!session ? (
            <>
              <li>
                <Link href='/' onClick={() => setIsMobileMenuOpen(false)} className='hover:text-gray-300 transition-colors duration-200'>Sign in</Link>
              </li>
              <li>
                <Link href='/register' onClick={() => setIsMobileMenuOpen(false)} className='hover:text-gray-300 transition-colors duration-200'>Sign Up</Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href='/Homepage' onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center px-1 py-1 rounded-md hover:text-gray-300 transition-colors duration-200 ${isActive('/Homepage') ? 'underline underline-offset-4' : ''}`}>
                  หน้าหลัก
                </Link>
              </li>
              <li>
                <Link href='/incident' onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center px-1 py-1 rounded-md hover:text-gray-300 transition-colors duration-200 ${isActive('/incident') ? 'bg-green-600 border' : ''}`}>
                  แจ้งเหตุ
                </Link>
              </li>

              {/* Dropdown ข้อมูล */}
              <li className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center px-1 py-1 rounded-md hover:text-gray-300 transition-colors duration-200 focus:outline-none"
                >
                  ข้อมูล
                  <svg
                    className={`ml-1 w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50">
                    <Link href='/manual/level' onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-2 text-white hover:bg-gray-600 transition-colors duration-200 ${isActive('/manual/level') ? 'bg-gray-600' : ''}`}>ข่าวสาร</Link>
                    <Link href='/Copingguide' onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-2 text-white hover:bg-gray-600 transition-colors duration-200 ${isActive('/Copingguide') ? 'bg-gray-600' : ''}`}>คู่มือรับมือ</Link>
                    <Link href='/Contact' onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-2 text-white hover:bg-gray-600 transition-colors duration-200 ${isActive('/Contact') ? 'bg-gray-600' : ''}`}>ติดต่อเรา</Link>
                  </div>
                )}
              </li>

              {/* Dropdown บัญชี */}
              <li className="relative" ref={accountDropdownRef}>
                <button
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  className="flex items-center px-1 py-1 rounded-md hover:text-gray-300 transition-colors duration-200 focus:outline-none"
                >
                  บัญชีของฉัน
                  <svg
                    className={`ml-1 w-4 h-4 transition-transform duration-200 ${isAccountDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {isAccountDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10">
                    <Link href='/alertshistory' onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-2 text-white hover:bg-gray-600 transition-colors duration-200 ${isActive('/alertshistory') ? 'bg-gray-600' : ''}`}>ประวัติการแจ้งเตือน</Link>
                    <Link href='/profile' onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-2 text-white hover:bg-gray-600 transition-colors duration-200 ${isActive('/profile') ? 'bg-gray-600' : ''}`}>โปรไฟล์</Link>
                  </div>
                )}
              </li>

              <li>
                <a onClick={() => { setIsMobileMenuOpen(false); signOut(); }} className='flex items-center bg-red-500 border text-white px-1 py-1 rounded-md hover:bg-red-600 transition-colors duration-200 cursor-pointer'>
                  Logout
                </a>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
