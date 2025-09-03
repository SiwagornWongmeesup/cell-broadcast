"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [message, setMessage] = useState("กำลังตรวจสอบ...");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) return setMessage("Token ไม่ถูกต้อง");

    fetch(`/api/verify-token?token=${token}`)
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage("เกิดข้อผิดพลาด"));
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>{message}</h2>
    </div>
  );
}
