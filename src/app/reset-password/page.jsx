import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">รีเซ็ตรหัสผ่าน</h2>

        <Suspense fallback={<p className="text-center">กำลังโหลด...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
