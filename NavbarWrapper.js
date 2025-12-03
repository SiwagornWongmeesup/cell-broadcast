"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import NavbarAdmin from "./src/app/components/navbarAdmin";
import Navbar from "./src/app/components/navbar";

const publicPaths = ['/', '/register', '/reset-password', '/forgot-password', '/emergency'];

export default function NavbarWrapper() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "loading" && (!session || !session.user)) {
      // ตรวจสอบว่าหน้านี้เป็น public page หรือไม่
      const isPublic = publicPaths.some(path => pathname.startsWith(path));
      if (!isPublic) {
        router.push("/"); // redirect client-side
      }
    }
  }, [session, status, router, pathname]);

  if (status === "loading") return null; // รอ session โหลด
  if (!session) return null; // รอ redirect

  const role = session?.user?.role;

  if (role === "admin") return <NavbarAdmin session={session} />;
  if (role === "user") return <Navbar session={session} />;

  return null;
}
