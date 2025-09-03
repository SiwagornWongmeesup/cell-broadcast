import React from 'react';

function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 md:p-10 space-y-10">
        <h1 className="text-3xl md:text-4xl font-bold text-stone-950 text-center tracking-widest">
          ติดต่อเรา
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700 tracking-wide">

          {/* ฝั่งข้อมูลติดต่อ - เลื่อนลง */}
          <div className="flex items-center justify-center md:items-start md:justify-center text-center md:text-left md:translate-y-2 lg:mt-12">
            <div className="space-y-4 text-base md:text-lg leading-relaxed">
              <p><strong>ชื่อบริษัท:</strong> บริษัท สมาร์ทโซลูชัน จำกัด</p>
              <p><strong>ที่อยู่:</strong> 123 ถนนสุขุมวิท เขตวัฒนา กรุงเทพฯ 10110</p>
              <p><strong>เบอร์โทร:</strong> 02-123-4567</p>
              <p><strong>มือถือ:</strong> 089-765-4321</p>
              <p><strong>อีเมล:</strong> info@smartsolution.co.th</p>
            </div>
          </div>

          {/* แบบฟอร์ม */}
          <form className="space-y-5 text-base md:text-lg tracking-wide">
            <div>
              <label className="block text-gray-600 font-medium mb-1">ชื่อของคุณ</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="กรอกชื่อของคุณ"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">อีเมล</label>
              <input
                type="email"
                className="w-full border rounded-lg p-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">ข้อความ</label>
              <textarea
                rows="3"
                className="w-full border rounded-lg p-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="พิมพ์ข้อความของคุณที่นี่"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-stone-950 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg tracking-wider text-base md:text-lg"
            >
              ส่งข้อความ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
