"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { collection, getDocs, collectionGroup, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ApplicationStatus {
  id: string;
  projectId: string;
  projectTitle: string;
  status: "pending" | "accepted" | "rejected";
  orientSheetUrl?: string;
  createdAt?: any;
}

function StatusContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<ApplicationStatus[]>([]);

  const handleSearch = async (targetEmail: string) => {
    if (!targetEmail.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      // 案件一覧を取得して全検索
      const projectsSnap = await getDocs(collection(db, "projects"));
      const userApps: ApplicationStatus[] = [];

      for (const projectDoc of projectsSnap.docs) {
        const subColRef = collection(db, "projects", projectDoc.id, "applications");
        const q = query(subColRef, where("email", "==", targetEmail.trim().toLowerCase()));
        const appSnap = await getDocs(q);

        appSnap.forEach((appDoc) => {
          const appData = appDoc.data();
          const pData = projectDoc.data();
          userApps.push({
            id: appDoc.id,
            projectId: projectDoc.id,
            projectTitle: pData.title || "名称未設定",
            status: appData.status || "pending",
            orientSheetUrl: pData.orientSheetUrl,
            createdAt: appData.createdAt,
          });
        });
      }

      setResults(userApps);
    } catch (e) {
      console.error("検索エラー:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialEmail) {
      handleSearch(initialEmail);
    }
  }, [initialEmail]);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">🔍 応募状況の確認</h1>
          <p className="text-xs text-slate-500">応募時に使用したメールアドレスを入力して選考結果をご確認ください。</p>
        </div>

        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleSearch(email)}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
          >
            {loading ? "検索中..." : "照会する"}
          </button>
        </div>
      </div>

      {searched && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">検索結果 ({results.length}件)</h2>

          {results.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
              指定されたメールアドレスでの応募履歴が見つかりませんでした。
            </div>
          ) : (
            results.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400">案件名</span>
                    <h3 className="font-bold text-slate-800 text-sm">{item.projectTitle}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.status === "accepted"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.status === "rejected"
                        ? "bg-slate-100 text-slate-500"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.status === "accepted" ? "🎉 採用（選考通過）" : item.status === "rejected" ? "不採用" : "選考中"}
                  </span>
                </div>

                {/* 採用の場合のみオリエン資料を表示 */}
                {item.status === "accepted" && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
                    <div className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <span>📋</span> 採用者限定：オリエンテーション資料・案内
                    </div>
                    <p className="text-xs text-emerald-800 whitespace-pre-wrap">
                      {item.orientSheetUrl || "案内文・資料URLは準備中です。担当者からのご連絡をお待ちください。"}
                    </p>
                    {item.orientSheetUrl?.startsWith("http") && (
                      <a
                        href={item.orientSheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-1 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-emerald-700 transition"
                      >
                        資料を別タブで開く ➔
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">読み込み中...</div>}>
      <StatusContent />
    </Suspense>
  );
}