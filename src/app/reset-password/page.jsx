import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div>
        <Suspense fallback={<p className="text-center">กำลังโหลด...</p>}>
          <ResetPasswordForm />
        </Suspense>
    </div>
  );
}
