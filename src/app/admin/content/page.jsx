"use client";
import { useState } from "react";

export default function AdminManualNews() {
  const [activeTab, setActiveTab] = useState("manual");

  return (
    <div className="p-4 md:p-8">
      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setActiveTab("manual")}
          className={`pb-2 ${activeTab === "manual" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
        >
          📘 คู่มือการใช้งาน
        </button>
        <button
          onClick={() => setActiveTab("news")}
          className={`pb-2 ${activeTab === "news" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
        >
          📰 ข่าวสาร
        </button>
      </div>

      {/* Content */}
      {activeTab === "manual" && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* คู่มือแต่ละหัวข้อ */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2">การดูรายงาน</h3>
            <p className="text-sm text-gray-600">
              ไปที่หน้า Dashboard เพื่อดูจำนวนการแจ้งเหตุ และสามารถกดเข้าไปดูรายละเอียดรายงานแต่ละรายการได้
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2">การส่งแจ้งเตือน</h3>
            <p className="text-sm text-gray-600">
              ไปที่หน้า Broadcast เลือกประเภทภัยพิบัติ กรอกข้อความ และเลือกพื้นที่เป้าหมาย จากนั้นกด "ส่งแจ้งเตือน"
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2">การจัดการผู้ใช้</h3>
            <p className="text-sm text-gray-600">
              ไปที่หน้า Users เพื่อดูรายชื่อผู้ใช้ และสามารถแก้ไข/ลบผู้ใช้ได้
            </p>
          </div>
        </div>
      )}

      {activeTab === "news" && (
        <div className="space-y-4">
          {/* ข่าวสาร */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-bold text-lg">📢 ระบบจะปิดปรับปรุงคืนนี้</h3>
            <p className="text-sm text-gray-600">
              ทีมงานจะปิดปรับปรุงระบบเวลา 23:00 - 02:00 น. เพื่ออัปเดตฐานข้อมูล
            </p>
            <p className="text-xs text-gray-400 mt-2">โพสต์เมื่อ 1 ต.ค. 2025</p>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-bold text-lg">🌊 อัปเดตข้อมูลน้ำท่วม</h3>
            <p className="text-sm text-gray-600">
              กรมอุตุนิยมวิทยารายงานว่าอาจมีน้ำท่วมในพื้นที่ภาคเหนือ แนะนำให้เฝ้าระวัง
            </p>
            <p className="text-xs text-gray-400 mt-2">โพสต์เมื่อ 29 ก.ย. 2025</p>
          </div>
        </div>
      )}
    </div>
  );
}
