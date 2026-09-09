"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // 管理者ページ（/admin から始まるパス）ではユーザー用Navbarを表示しない
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/projects" className="font-extrabold text-base tracking-tight text-slate-900">
          インフルエンサー Portal
        </Link>

        <nav className="flex items-center gap-4 text-xs font-bold">
          <Link href="/projects" className="text-slate-600 hover:text-indigo-600 transition">
            案件を探す
          </Link>
          <Link href="/mypage" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition">
            👤 マイページ
          </Link>
          <Link href="/admin/projects" className="text-slate-400 hover:text-slate-600 transition text-[11px]">
            管理者画面
          </Link>
        </nav>
      </div>
    </header>
  );
}