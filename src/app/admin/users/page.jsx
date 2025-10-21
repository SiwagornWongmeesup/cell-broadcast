"use client";
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar"

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/user");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการโหลดผู้ใช้: " + error.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("คุณแน่ใจว่าจะลบผู้ใช้นี้?")) return;

    try {
      const res = await fetch("/api/admin/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("ลบผู้ใช้สำเร็จ");
        fetchUsers();
      } else {
        alert("เกิดข้อผิดพลาด: " + data.error);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ✅ ใช้ Sidebar เดิม */}
      <Sidebar />

      {/* เนื้อหาหลัก */}
      <main className="flex-1 p-4 md:p-6 overflow-x-auto">
        <h1 className="text-2xl font-bold mb-6">รายชื่อผู้ใช้ทั้งหมด</h1>

        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full border text-sm md:text-base">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 md:p-3 border">ชื่อผู้ใช้</th>
                <th className="p-2 md:p-3 border">อีเมล</th>
                <th className="p-2 md:p-3 border">วันที่สมัคร</th>
                <th className="p-2 md:p-3 border text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-2 md:p-3 border">{user.name}</td>
                    <td className="p-2 md:p-3 border break-words">{user.email}</td>
                    <td className="p-2 md:p-3 border">
                      {new Date(user.createdAt).toLocaleDateString("th-TH")}
                    </td>
                    <td className="p-2 md:p-3 border text-center">
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs md:text-sm"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center text-gray-500 p-4 italic"
                  >
                    ไม่พบข้อมูลผู้ใช้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
