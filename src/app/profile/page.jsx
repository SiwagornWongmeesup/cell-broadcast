'use client';

import React, { useState, useEffect } from 'react';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editProfilePictureFile, setEditProfilePictureFile] = useState(null); // State ใหม่สำหรับเก็บไฟล์รูป
  const [previewProfilePicture, setPreviewProfilePicture] = useState(''); // State ใหม่สำหรับแสดงรูปตัวอย่าง
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await new Promise(resolve => setTimeout(() => {
          resolve({
            name: "อารยา ใจดี",
            email: "araya.j@example.com",
            bio: "กราฟิกดีไซเนอร์ผู้เชี่ยวชาญด้าน UI/UX และการสร้างแบรนด์",
            location: "เชียงใหม่, ประเทศไทย",
            profilePicture: "https://placehold.co/150x150/007bff/FFFFFF?text=A"
          });
        }, 1500));

        setUser(response);
        setEditName(response.name);
        setEditBio(response.bio);
        setEditLocation(response.location);
        setPreviewProfilePicture(response.profilePicture); // กำหนดรูปตัวอย่างเริ่มต้นจากข้อมูลเดิม

      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditProfilePictureFile(file);
      // สร้าง URL ชั่วคราวเพื่อแสดงรูปภาพที่ผู้ใช้เลือก
      setPreviewProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      // โค้ดส่วนนี้คือการจำลองการอัปโหลดรูปภาพและบันทึกข้อมูล
      console.log("Saving profile with:", {
        name: editName,
        bio: editBio,
        location: editLocation,
        profilePictureFile: editProfilePictureFile ? editProfilePictureFile.name : null,
      });

      // จำลองการบันทึกข้อมูล
      await new Promise(resolve => setTimeout(resolve, 1000));

      // เตรียม URL รูปภาพใหม่
      let newProfilePictureUrl = user.profilePicture;
      if (editProfilePictureFile) {
        // ในโลกจริง คุณจะได้รับ URL จากการอัปโหลดไฟล์ที่นี่
        // สำหรับโค้ดตัวอย่างนี้ เราจะใช้ URL ชั่วคราวจาก state preview
        newProfilePictureUrl = previewProfilePicture;
      }

      // อัปเดตข้อมูล user ใน state หลังจากบันทึกสำเร็จ
      setUser(prevUser => ({
        ...prevUser,
        name: editName,
        bio: editBio,
        location: editLocation,
        profilePicture: newProfilePictureUrl,
      }));

      setIsEditing(false);
      setMessage('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!');

    } catch (err) {
      setError("ไม่สามารถบันทึกข้อมูลโปรไฟล์ได้");
      console.error("Error saving profile:", err);
      setMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditName(user.name);
      setEditBio(user.bio);
      setEditLocation(user.location);
      setPreviewProfilePicture(user.profilePicture); // คืนรูปภาพตัวอย่างเป็นรูปเดิม
      setEditProfilePictureFile(null); // ล้างไฟล์ที่เลือก
    }
    setIsEditing(false);
    setMessage('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl font-semibold text-gray-700 p-8 bg-white rounded-lg shadow-xl">
          กำลังโหลดข้อมูลโปรไฟล์...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl font-semibold text-red-600 p-8 bg-white rounded-lg shadow-xl">
          เกิดข้อผิดพลาด: {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl font-semibold text-gray-700 p-8 bg-white rounded-lg shadow-xl">
          ไม่พบข้อมูลโปรไฟล์
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-10">
      <div className="p-8 max-w-xl w-full mx-auto font-sans bg-white border border-blue-200 rounded-2xl shadow-2xl md:p-10 lg:p-12 transform transition-all duration-300 hover:scale-[1.01]">
        <h1 className="text-center text-4xl font-extrabold text-blue-700 mb-8 tracking-wide">โปรไฟล์ผู้ใช้</h1>
        <hr className="border-t-2 border-blue-300 mb-8" />

        {message && (
          <div className={`p-4 mb-6 rounded-lg text-center font-medium ${message.includes('เรียบร้อย') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
            {message}
          </div>
        )}

        {isEditing ? (
          // โหมดแก้ไข
          <form onSubmit={handleSaveProfile} className="flex flex-col space-y-6">
            <div className="flex flex-col items-center">
              <img
                src={previewProfilePicture}
                alt="รูปโปรไฟล์ตัวอย่าง"
                className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 shadow-xl"
              />
              <label className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors duration-200">
                เลือกรูปโปรไฟล์ใหม่
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <label className="block text-gray-700 font-bold text-lg">
              ชื่อ:
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                required
              />
            </label>
            <label className="block text-gray-700 font-bold text-lg">
              เกี่ยวกับฉัน:
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows="5"
                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y transition-all duration-200"
              ></textarea>
            </label>
            <label className="block text-gray-700 font-bold text-lg">
              ที่ตั้ง:
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </label>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-6 py-3 rounded-lg border border-gray-400 text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isSaving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
              </button>
            </div>
          </form>
        ) : (
          // โหมดแสดงผล
          <div className="flex flex-col items-center space-y-6">
            {user.profilePicture && (
              <img
                src={user.profilePicture}
                alt="รูปโปรไฟล์"
                className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 shadow-xl transform transition-transform duration-300 hover:scale-105"
              />
            )}
            <h2 className="text-4xl font-bold text-blue-600 mt-0">{user.name}</h2>
            <p className="text-gray-700 text-xl">
              <strong className="font-semibold text-gray-800">อีเมล:</strong> {user.email}
            </p>
            <p className="text-gray-700 text-xl">
              <strong className="font-semibold text-gray-800">ที่ตั้ง:</strong> {user.location}
            </p>
            <div className="bg-blue-50 p-7 rounded-xl w-full shadow-inner border border-blue-100">
              <h3 className="text-2xl font-semibold text-blue-700 mb-4">เกี่ยวกับฉัน:</h3>
              <p className="text-gray-700 leading-relaxed text-lg">{user.bio}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl mt-6"
            >
              แก้ไขโปรไฟล์
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;