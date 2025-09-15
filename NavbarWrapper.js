"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // <-- ใช้ next/navigation
import { useEffect } from "react";
import NavbarAdmin from "./src/app/components/navbarAdmin";
import Navbar from "./src/app/components/navbar";

export default function NavbarWrapper() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && (!session || !session.user)) {
      router.push("/"); // redirect client-side
    }
  }, [session, status, router]);

  if (status === "loading") return null; // รอ session โหลด
  if (!session) return null; // รอ redirect

  const role = session?.user?.role;

  if (role === "admin") return <NavbarAdmin session={session} />;
  if (role === "user") return <Navbar session={session} />;

  return null;
}
