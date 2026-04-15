"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut } from "lucide-react";

// 관리자 접근: 이 이메일만 /admin 및 헤더 「관리자」 링크 노출
const ADMIN_EMAIL = "eomhihi007@gmail.com";

export function SejongHeader() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isAdmin = isLoggedIn && session?.user?.email === ADMIN_EMAIL;

  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    await signOut({ callbackUrl: "/", redirect: false });
    router.refresh();
    window.location.replace("/");
  };

  return (
    <header className="sticky top-0 z-30 bg-transparent">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-2" aria-hidden />
      </div>
    </header>
  );
}
