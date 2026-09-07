"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    snsAccount: "",
    followers: "",
    category: "美容・コスメ",
    pr: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "applications"), {
        ...formData,
        followers: Number(formData.followers) || 0,
        status: "未対応",
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("送信エラー:", error);
      alert("送信に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ご応募ありがとうございます</h1>
          <p className="text-gray-600 mb-6">
            内容を確認のうえ、ご登録いただいたメールアドレスへ担当者よりご連絡いたします。
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                name: "",
                email: "",
                snsAccount: "",
                followers: "",
                category: "美容・コスメ",
                pr: "",
              });
            }}
            className="text-indigo-600 font-medium hover:underline"
          >
            別の内容でフォームを送信する
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">マイクロインフルエンサー募集</h1>
          <p className="text-gray-600 mt-2">
            ブランド案件へのお申し込みはこちらのフォームからご記入ください。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              お名前（氏名） <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
              placeholder="山田 太郎"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SNSアカウント（Instagram / TikTok IDなど） <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.snsAccount}
              onChange={(e) => setFormData({ ...formData, snsAccount: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              フォロワー数（概算） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={formData.followers}
              onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
              placeholder="3000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              得意なジャンル
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
            >
              <option value="美容・コスメ">美容・コスメ</option>
              <option value="ファッション">ファッション</option>
              <option value="グルメ・カフェ">グルメ・カフェ</option>
              <option value="ライフスタイル・インテリア">ライフスタイル・インテリア</option>
              <option value="旅行・お出かけ">旅行・お出かけ</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              自己PR・実績など
            </label>
            <textarea
              rows={4}
              value={formData.pr}
              onChange={(e) => setFormData({ ...formData, pr: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
              placeholder="過去のPR案件実績や意気込みをご記入ください"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "送信中..." : "応募を送信する"}
          </button>
        </form>
      </div>
    </main>
  );
}