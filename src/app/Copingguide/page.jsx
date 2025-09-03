import React from 'react';
import Navbar from '../components/navbar';



export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-red-700 mb-6 md:mb-10">
          คู่มือรับมือภัยพิบัติ
        </h1>
        <p className="text-center text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto">
          เลือกประเภทภัยพิบัติที่คุณต้องการดูคำแนะนำและวิธีปฏิบัติตัวอย่างถูกต้อง เพื่อความปลอดภัยของคุณและคนที่คุณรัก
        </p>
        
        
      </main>
    </div>
  );
}