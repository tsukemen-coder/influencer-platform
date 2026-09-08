"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc, collection, getDocs, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  reward: string;
  platform: string;
  status: string;
}

interface Application {
  id: string;
  name?: string;
  email?: string;
  snsAccount?: string;
  followerCount?: string | number;
  followers?: string | number; // 表記ブレ対策
  note?: string;
  pr?: string; // 表記ブレ対策
  status?: "pending" | "accepted" | "rejected";
  createdAt?: Timestamp;
}

export default function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // 通知メッセージ編集用モーダルの状態
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. 案件情報の取得
        const projectDocRef = doc(db, "projects", projectId);
        const projectDoc = await getDoc(projectDocRef);
        if (projectDoc.exists()) {
          setProject({ id: projectDoc.id, ...projectDoc.data() } as Project);
        }

        // 2. サブコレクション (projects/{projectId}/applications) から応募者を取得
        const subColRef = collection(db, "projects", projectId, "applications");
        const querySnapshot = await getDocs(subColRef);

        const appsData: Application[] = [];
        querySnapshot.forEach((docSnap) => {
          appsData.push({ id: docSnap.id, ...docSnap.data() } as Application);
        });

        appsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setApplications(appsData);
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectId]);

  // ステータス更新処理
  const handleStatusChange = async (appId: string, newStatus: "pending" | "accepted" | "rejected") => {
    try {
      const appRef = doc(db, "projects", projectId, "applications", appId);
      await updateDoc(appRef, {
        status: newStatus,
      });
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (error) {
      console.error("ステータス更新エラー:", error);
      alert("ステータスの更新に失敗しました。");
    }
  };

  // CSVダウンロード機能
  const handleDownloadCSV = () => {
    if (applications.length === 0) {
      alert("ダウンロードする応募データがありません。");
      return;
    }

    const headers = ["氏名", "メールアドレス", "SNSアカウント", "フォロワー数", "ステータス", "自己PR・備考", "応募日時"];
    const rows = applications.map((app) => {
      const follower = app.followerCount || app.followers || "-";
      const prNote = app.note || app.pr || "-";
      return [
        `"${app.name || ""}"`,
        `"${app.email || ""}"`,
        `"${app.snsAccount || ""}"`,
        `"${follower}"`,
        `"${app.status === "accepted" ? "採用" : app.status === "rejected" ? "不採用" : "選考中"}"`,
        `"${String(prNote).replace(/"/g, '""')}"`,
        `"${app.createdAt?.toDate ? app.createdAt.toDate().toLocaleString("ja-JP") : ""}"`,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `applications_${project?.title || "project"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 採用通知モーダルを開く
  const openMessageModal = (app: Application) => {
    setSelectedApp(app);
    setIsCopied(false);
    const defaultTemplate = `${app.name || "応募者"} 様

この度は「${project?.title || "案件"}」にご応募いただき、誠にありがとうございます。

慎重に選考を行いました結果、ぜひ ${app.name || "あなた"} 様に本案件をお願いしたくご連絡いたしました。

【案件詳細】
・案件名：${project?.title || "-"}
・報酬：${project?.reward || "-"}

今後の進め方につきまして、本メッセージの返信にてご案内させていただきます。
ご確認のほど、よろしくお願いいたします。`;

    setCustomMessage(defaultTemplate);
  };

  // 編集した文面をクリップボードにコピー
  const handleCopyCustomMessage = () => {
    navigator.clipboard.writeText(customMessage).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">データを読み込み中...</div>;
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <div className="text-rose-500 mb-4">案件が見つかりませんでした。</div>
        <Link href="/admin/projects" className="text-indigo-600 hover:underline text-sm font-bold">
          ← 案件一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 transition mb-2"
        >
          <span>←</span> 案件一覧に戻る
        </Link>
      </div>

      {/* 案件概要ヘッダー */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded">
              {project.platform}
            </span>
            <span className="text-xs text-slate-500">報酬: {project.reward}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">{project.title}</h1>
        </div>
        <button
          onClick={handleDownloadCSV}
          disabled={applications.length === 0}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition shadow-sm"
        >
          <span>📥</span> 応募者データをCSV出力 ({applications.length}件)
        </button>
      </div>

      {/* 応募者一覧テーブル */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 text-sm">応募者一覧 ({applications.length}名)</h2>
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">まだ応募がありません。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">応募者名 / メール</th>
                  <th className="py-3 px-4">SNS / フォロワー</th>
                  <th className="py-3 px-4">自己PR・備考</th>
                  <th className="py-3 px-4">ステータス</th>
                  <th className="py-3 px-4 text-right">操作 / アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applications.map((app) => {
                  const followerVal = app.followerCount ?? app.followers ?? "-";
                  const noteVal = app.note ?? app.pr ?? "-";

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{app.name || "未入力"}</div>
                        <div className="text-slate-400 text-[11px]">{app.email || "-"}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-indigo-600">{app.snsAccount || "-"}</div>
                        <div className="text-slate-500 text-[11px]">
                          {followerVal !== "-" ? `${Number(followerVal).toLocaleString()} 人` : "-"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate" title={String(noteVal)}>
                        {String(noteVal)}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={app.status || "pending"}
                          onChange={(e) =>
                            handleStatusChange(app.id, e.target.value as "pending" | "accepted" | "rejected")
                          }
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none ${
                            app.status === "accepted"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : app.status === "rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          <option value="pending">選考中</option>
                          <option value="accepted">採用</option>
                          <option value="rejected">不採用</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openMessageModal(app)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold px-3 py-1.5 rounded-lg text-[11px] transition inline-flex items-center gap-1"
                        >
                          ✉️ 採用通知文を編集・コピー
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 採用通知文 編集・作成モーダル */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">
                ✉️ 採用通知メッセージの編集 (`{selectedApp.name}` 様宛)
              </h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                送信メッセージの内容（自由に修正できます）:
              </label>
              <textarea
                rows={10}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                閉じる
              </button>
              <button
                onClick={handleCopyCustomMessage}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                {isCopied ? "✓ コピーしました！" : "📋 編集内容をコピー"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}