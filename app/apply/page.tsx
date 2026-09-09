"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import Container from "@/components/layout/Container";

function ApplyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [snsAccount, setSnsAccount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      alert("案件IDが見つかりません。案件一覧から再度お試しください。");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "applications"), {
        projectId,
        name,
        email,
        snsAccount,
        status: "pending",
        progressStep: "drafting",
        appliedAt: new Date(),
      });
      alert("応募が完了しました！");
      router.push("/status");
    } catch (error) {
      console.error(error);
      alert("応募の送信に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">案件への応募</h1>
            <p className="text-xs text-slate-500 mt-1">以下のフォームに必要な情報を入力してください。</p>
          </div>
          <Link
            href="/projects"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition whitespace-nowrap"
          >
            ➔ 案件一覧に戻る
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">お名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
              placeholder="山田 太郎"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">SNSアカウント（ユーザー名など）</label>
            <input
              type="text"
              value={snsAccount}
              onChange={(e) => setSnsAccount(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
              placeholder="@your_account"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition mt-4 disabled:opacity-50"
          >
            {submitting ? "送信中..." : "応募を送信する"}
          </button>
        </form>
      </div>
    </Container>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-xs text-slate-400">読み込み中...</div>}>
      <ApplyForm />
    </Suspense>
  );
}