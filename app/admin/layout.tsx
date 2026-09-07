"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser && pathname !== "/admin/login") {
        router.push("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-sm text-gray-500">
        認証状態を確認中...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 py-3 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-sm">インフルエンサー管理ポータル</span>
          <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">{user.email}</span>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-red-600 hover:text-red-800 underline"
          >
            ログアウト
          </button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}