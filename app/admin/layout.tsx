"use client";

import { useState, useEffect } from "react";

// 設定したい管理者パスワード
const ADMIN_PASSWORD = "admin123"; // ※必要に応じて変更してください

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // ページ読み込み時にログイン状態をチェック
  useEffect(() => {
    const authStatus = sessionStorage.getItem("admin_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_authenticated", "true");
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">読み込み中...</div>;
  }

  // 未認証の場合はパスワード入力画面を表示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-sm w-full border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">管理者認証</h2>
          <p className="text-xs text-gray-500 mb-6 text-center">管理画面にアクセスするにはパスワードを入力してください。</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="パスワードを入力"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              />
              {error && (
                <p className="text-red-500 text-xs mt-1">パスワードが正しくありません。</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm hover:bg-indigo-700 transition"
            >
              ログイン
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 認証済みの場合は管理画面を表示
  return <>{children}</>;
}