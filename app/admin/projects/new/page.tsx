"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    projectName: "",
    media: "instagram",
    overview: "",
    hashtags: "",
    status: "募集中",
    recruitmentPeriod: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Firestoreの 'projects' コレクションに新規案件データを追加
      await addDoc(collection(db, "projects"), {
        ...formData,
        createdAt: serverTimestamp(),
      });

      alert("案件を新規作成しました！");
      router.push("/admin/projects"); // 一覧画面へ遷移
    } catch (error) {
      console.error("案件の追加に失敗しました:", error);
      alert("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="mb-4">
          <Link href="/admin/projects" className="text-sm text-gray-500 hover:text-gray-700 underline">
            ← 管理一覧に戻る
          </Link>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-6">新規案件の登録</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">オリエンシートタイトル *</label>
            <input
              type="text"
              required
              placeholder="例: OMOT Influencer 【Instagramリール】Lactofit PR案件オリエンシート"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">案件名 *</label>
            <input
              type="text"
              required
              placeholder="例: 【Instagramリール】Lactofitラクトフィット ゴールド PR案件"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">投稿先メディア *</label>
              <select
                value={formData.media}
                onChange={(e) => setFormData({ ...formData, media: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="instagram">Instagram</option>
                <option value="x">X (旧Twitter)</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">募集期間 *</label>
              <input
                type="text"
                required
                placeholder="例: 2026/03/01 〜 2026/03/15"
                value={formData.recruitmentPeriod}
                onChange={(e) => setFormData({ ...formData, recruitmentPeriod: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">必須ハッシュタグ</label>
            <input
              type="text"
              placeholder="例: #PR #Lactofit #ラクトフィット"
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">概要・詳細説明</label>
            <textarea
              rows={5}
              placeholder="商品の説明や投稿ルールなどを入力"
              value={formData.overview}
              onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "保存中..." : "案件を登録して公開"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}