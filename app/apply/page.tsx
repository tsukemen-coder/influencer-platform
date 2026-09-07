"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

function ApplyFormContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const router = useRouter();

  const [projectTitle, setProjectTitle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [snsAccount, setSnsAccount] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (projectId) {
      async function fetchProject() {
        try {
          const docRef = doc(db, "projects", projectId as string);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProjectTitle(docSnap.data().title);
          }
        } catch (e) {
          console.error("案件情報の取得失敗:", e);
        }
      }
      fetchProject();
    }
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      alert("案件IDが見つかりません。");
      return;
    }

    setLoading(true);

    try {
      // サブコレクション (projects/{projectId}/applications) へ追加
      const subColRef = collection(db, "projects", String(projectId), "applications");
      await addDoc(subColRef, {
        name,
        email,
        snsAccount,
        followerCount,
        note,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
    } catch (error) {
      console.error("応募送信エラー:", error);
      alert("送信に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-md mx-auto">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">ご応募ありがとうございました！</h2>
        <p className="text-xs text-slate-500 mb-6">
          選考結果につきましては、ご登録いただいたメールアドレス宛にご連絡いたします。
        </p>
        <button
          onClick={() => router.push("/projects")}
          className="bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-slate-800 transition"
        >
          案件一覧へ戻る
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto">
      <div className="mb-6">
        <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded">応募フォーム</span>
        <h1 className="text-lg font-bold text-slate-900 mt-1">
          {projectTitle ? `「${projectTitle}」に応募` : "案件への応募"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">お名前 *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="山田 太郎"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">メールアドレス *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">メインSNSアカウント名 (ID) *</label>
          <input
            type="text"
            required
            value={snsAccount}
            onChange={(e) => setSnsAccount(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="@username"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">フォロワー数 *</label>
          <input
            type="number"
            required
            value={followerCount}
            onChange={(e) => setFollowerCount(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="5000"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">自己PR・アピールポイント</label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="過去の案件実績や意気込みをご記入ください"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition disabled:opacity-50 mt-2"
        >
          {loading ? "送信中..." : "応募を送信する"}
        </button>
      </form>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-xs text-slate-500">読み込み中...</div>}>
      <ApplyFormContent />
    </Suspense>
  );
}