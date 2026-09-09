"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/lib/useAuth";
import { Project } from "@/types";
import Container from "@/components/layout/Container";

function ApplyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [snsAccount, setSnsAccount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setEmail(user.email || "");
      setSnsAccount(user.snsAccount || "");
    }
  }, [user]);

  useEffect(() => {
    const checkAndFetch = async () => {
      if (!projectId || !user) {
        setLoading(false);
        return;
      }

      try {
        // 案件情報取得
        const projDoc = await getDoc(doc(db, "projects", projectId));
        if (projDoc.exists()) {
          setProject({ id: projDoc.id, ...projDoc.data() } as Project);
        }

        // 重複応募チェック
        const q = query(
          collection(db, "applications"),
          where("projectId", "==", projectId),
          where("userId", "==", user.uid)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setAlreadyApplied(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    checkAndFetch();
  }, [projectId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "applications"), {
        projectId,
        userId: user.uid,
        name,
        email,
        snsAccount,
        status: "pending",
        progressStep: "applied",
        appliedAt: new Date(),
      });

      alert("応募が完了しました！マイページで進捗を確認できます。");
      router.push("/mypage");
    } catch (e) {
      console.error(e);
      alert("応募処理に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center py-12 text-xs text-slate-400">読み込み中...</div>
      </Container>
    );
  }

  if (alreadyApplied) {
    return (
      <Container>
        <div className="max-w-md mx-auto text-center py-12 space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-lg font-bold text-slate-900">既に応募済みの案件です</h2>
          <p className="text-xs text-slate-500">この案件には既に応募が完了しています。マイページより選考結果・進捗状況をご確認ください。</p>
          <button
            onClick={() => router.push("/mypage")}
            className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-indigo-700 transition"
          >
            マイページへ移動する
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-extrabold text-slate-900">案件への応募</h1>
          {project && <p className="text-xs text-indigo-600 font-bold">{project.title}</p>}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">お名前 / 活動名</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">メールアドレス</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">SNSアカウント名 (例: @account)</label>
            <input
              type="text"
              required
              value={snsAccount}
              onChange={(e) => setSnsAccount(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition text-xs shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? "送信中..." : "利用規約に同意して応募する"}
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