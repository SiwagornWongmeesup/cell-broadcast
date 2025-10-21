"use client";
import { useEffect, useState } from "react";

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
        fetchUsers(); // โหลดรายการผู้ใช้ใหม่
      } else {
        alert("เกิดข้อผิดพลาด: " + data.error);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  // โหลดผู้ใช้ตอน component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">รายชื่อผู้ใช้ทั้งหมด</h1>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">ชื่อผู้ใช้</th>
            <th className="p-2 border">อีเมล</th>
            <th className="p-2 border">วันที่สมัคร</th>
            <th className="p-2 border">การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">
                {new Date(user.createdAt).toLocaleDateString("th-TH")}
              </td>
              <td className="p-2 border">
                <button
                  onClick={() => deleteUser(user._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
