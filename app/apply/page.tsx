"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { collection, addDoc, doc, getDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

function ApplyFormContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [snsAccount, setSnsAccount] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (projectId) {
      async function fetchProject() {
        try {
          const docRef = doc(db, "projects", projectId as string);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProject(docSnap.data());
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
    setErrorMsg("");

    if (!projectId) {
      alert("案件IDが見つかりません。");
      return;
    }

    if (project?.status === "closed") {
      alert("この案件はすでに募集を終了しています。");
      return;
    }

    setLoading(true);

    try {
      const subColRef = collection(db, "projects", String(projectId), "applications");

      // 重複チェック (同じメールアドレスでの重複応募を防止)
      const q = query(subColRef, where("email", "==", email.trim().toLowerCase()));
      const existing = await getDocs(q);

      if (!existing.empty) {
        setErrorMsg("このメールアドレスからはすでに応募済みです。マイページから選考状況をご確認ください。");
        setLoading(false);
        return;
      }

      // サブコレクションへ追加
      await addDoc(subColRef, {
        name,
        email: email.trim().toLowerCase(),
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
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-md mx-auto space-y-4">
        <div className="text-4xl">🎉</div>
        <h2 className="text-xl font-bold text-slate-800">ご応募ありがとうございました！</h2>
        <p className="text-xs text-slate-500">
          選考状況のご確認や、採用後のオリエンシート閲覧は「応募状況確認ページ」から行っていただけます。
        </p>
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-left text-xs space-y-1">
          <div className="font-bold text-indigo-900">【確認時に必要な情報】</div>
          <div className="text-indigo-700">ご登録メールアドレス: <span className="font-mono font-bold">{email}</span></div>
        </div>
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => router.push(`/status?email=${encodeURIComponent(email)}`)}
            className="w-full bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition"
          >
            応募状況を確認する ➔
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto">
      <div className="mb-6">
        <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded">応募フォーム</span>
        <h1 className="text-lg font-bold text-slate-900 mt-1">
          {project?.title ? `「${project.title}」に応募` : "案件への応募"}
        </h1>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

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