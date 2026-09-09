"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/types";

// デモ・テスト用ユーザー
const DEMO_USER: UserProfile = {
  uid: "demo-user-001",
  displayName: "テスト インフルエンサー",
  email: "demo@example.com",
  snsAccount: "@demo_influencer",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
};

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ローカルストレージまたはセッションからユーザー情報を取得（LINE認証接続時はここを書き換え）
    const savedUser = localStorage.getItem("app_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // 開発・テスト用にデフォルトでログイン状態にする
      setUser(DEMO_USER);
      localStorage.setItem("app_user", JSON.stringify(DEMO_USER));
    }
    setLoading(false);
  }, []);

  const loginAsDemo = (customName?: string) => {
    const newUser = {
      ...DEMO_USER,
      displayName: customName || DEMO_USER.displayName,
    };
    setUser(newUser);
    localStorage.setItem("app_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("app_user");
  };

  return { user, loading, loginAsDemo, logout };
}