'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    address: '',
    bio: '',
    instagram: '',
    phone: '',
    image: ''
  });

  const [preview, setPreview] = useState('');

  // โหลดข้อมูลจาก session
  useEffect(() => {
    if (session?.user) {
      setForm({
        name: session.user.name || '',
        image: session.user.image || '',
        address: session.user.address || '',
        bio: session.user.bio || '',
        instagram: session.user.instagram || '',
        phone: session.user.phone || ''
      });
      setPreview(session.user.image || '');
    }
  }, [session]);

  if (status === 'loading') {
    return <p className="text-center text-gray-500">กำลังโหลด...</p>;
  }

  if (!session) {
    router.replace('/');
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // handle รูปที่อัปโหลด (preview ก่อน)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result); // preview รูป
      setForm({ ...form, image: reader.result }); // เก็บ base64 ไว้ส่ง API
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, ...form })
      });

      if (res.ok) {
        alert('อัปเดตข้อมูลเรียบร้อยแล้ว');
        router.push('/profile');
      } else {
        alert('เกิดข้อผิดพลาดในการอัปเดต');
      }
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900 p-4">
      <div className="w-full max-w-2xl bg-gray-800 text-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-red-500">
          แก้ไขโปรไฟล์
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* รูปโปรไฟล์ */}
          <div className="flex flex-col items-center">
            {preview ? (
              <img
                src={preview}
                alt="profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-red-500 shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-600 flex items-center justify-center text-gray-300">
                ไม่มีรูป
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-3 text-sm text-gray-300"
            />
          </div>

          {/* ชื่อ */}
          <div>
            <label className="block text-sm font-medium text-gray-300">ชื่อ</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg p-2 bg-gray-700 text-white"
              required
            />
          </div>

          {/* ที่อยู่ */}
          <div>
            <label className="block text-sm font-medium text-gray-300">ที่อยู่</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg p-2 bg-gray-700 text-white"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-300">เกี่ยวกับตัวเอง</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows="3"
              className="mt-1 w-full border rounded-lg p-2 bg-gray-700 text-white"
            ></textarea>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Instagram</label>
            <input
              type="text"
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg p-2 bg-gray-700 text-white"
              placeholder="@username"
            />
          </div>

          {/* เบอร์โทรศัพท์ */}
          <div>
            <label className="block text-sm font-medium text-gray-300">เบอร์โทรศัพท์</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg p-2 bg-gray-700 text-white"
            />
          </div>

          {/* ปุ่มบันทึก */}
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            บันทึกการเปลี่ยนแปลง
          </button>
        </form>
      </div>
    </div>
  );
}
