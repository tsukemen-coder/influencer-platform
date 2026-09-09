"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Application, SelectionStatus, ProgressStep } from "@/types";

interface ApplicantTableProps {
  applications: Application[];
  projectTitle: string;
  onRefresh: () => void;
}

export default function ApplicantTable({ applications, projectTitle, onRefresh }: ApplicantTableProps) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updating, setUpdating] = useState(false);

  // 選考ステータスの変更
  const handleStatusChange = async (appId: string, status: SelectionStatus) => {
    try {
      setUpdating(true);
      await updateDoc(doc(db, "applications", appId), {
        status,
        // 採択された場合は進行ステップを「下書き作成中」に進める
        progressStep: status === "approved" ? "draft_preparing" : "applied",
        updatedAt: new Date(),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("ステータスの更新に失敗しました。");
    } finally {
      setUpdating(false);
    }
  };

  // 下書きの承認（投稿許可）
  const handleApproveDraft = async (appId: string) => {
    try {
      setUpdating(true);
      await updateDoc(doc(db, "applications", appId), {
        progressStep: "draft_approved",
        updatedAt: new Date(),
      });
      alert("下書きを承認しました。インフルエンサーに投稿許可が通知されます。");
      setSelectedApp(null);
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("承認に失敗しました。");
    } finally {
      setUpdating(false);
    }
  };

  // 全工程完了処理
  const handleCompleteAll = async (appId: string) => {
    try {
      setUpdating(true);
      await updateDoc(doc(db, "applications", appId), {
        progressStep: "completed",
        updatedAt: new Date(),
      });
      alert("案件完了（報酬確定）として処理しました。");
      setSelectedApp(null);
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("更新に失敗しました。");
    } finally {
      setUpdating(false);
    }
  };

  // CSVダウンロード機能
  const handleExportCSV = () => {
    if (applications.length === 0) return;

    const headers = ["ID", "名前", "メールアドレス", "SNSアカウント", "選考ステータス", "進行フェーズ", "投稿URL", "応募日時"];
    const rows = applications.map((a) => [
      a.id,
      `"${a.name}"`,
      `"${a.email}"`,
      `"${a.snsAccount}"`,
      a.status === "approved" ? "採択" : a.status === "rejected" ? "見送り" : "選考中",
      a.progressStep || "applied",
      `"${a.postUrl || ""}"`,
      a.appliedAt?.toDate ? a.appliedAt.toDate().toLocaleString("ja-JP") : "",
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `応募者一覧_${projectTitle}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <span className="font-bold text-slate-700">全 {applications.length} 件の応募</span>
        <button
          onClick={handleExportCSV}
          disabled={applications.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
        >
          📥 応募データCSV出力
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3">応募者情報</th>
                <th className="p-3">SNSアカウント</th>
                <th className="p-3">選考ステータス</th>
                <th className="p-3">進行フェーズ / AI診断</th>
                <th className="p-3 text-right">詳細・操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    まだ応募はありません。
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{app.name}</div>
                      <div className="text-slate-400 text-[11px]">{app.email}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{app.snsAccount}</td>
                    <td className="p-3">
                      <select
                        value={app.status}
                        disabled={updating}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as SelectionStatus)}
                        className="border border-slate-200 rounded-lg p-1.5 font-bold focus:outline-indigo-500 bg-white"
                      >
                        <option value="pending">⏳ 選考中</option>
                        <option value="approved">✅ 採択</option>
                        <option value="rejected">❌ 見送り</option>
                      </select>
                    </td>
                    <td className="p-3">
                      {app.status === "approved" ? (
                        <div className="space-y-1">
                          <span className="font-bold text-indigo-600 block">
                            {app.progressStep === "applied" && "1. 選考通過"}
                            {app.progressStep === "draft_preparing" && "1. 下書き作成中"}
                            {app.progressStep === "draft_submitted" && "2. 下書き提出済"}
                            {app.progressStep === "draft_approved" && "3. 下書き承認済（投稿許可）"}
                            {app.progressStep === "posted" && "4. 投稿完了URL提出済"}
                            {app.progressStep === "completed" && "5. 全工程完了"}
                          </span>

                          {app.aiCheckResult && (
                            <span
                              className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold ${
                                app.aiCheckResult.isPassed
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              AIスコア: {app.aiCheckResult.score}点 ({app.aiCheckResult.isPassed ? "合格" : "要確認"})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1 rounded-lg transition"
                      >
                        詳細確認
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 詳細モーダル */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedApp.name} 様の応募詳細</h3>
                <p className="text-slate-400 text-[11px]">{selectedApp.snsAccount} / {selectedApp.email}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base"
              >
                ✕
              </button>
            </div>

            {/* AI判定 & 提出下書き */}
            {selectedApp.draftText ? (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900">提出された下書きキャプション</h4>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-slate-700 whitespace-pre-wrap">
                  {selectedApp.draftText}
                </div>

                {selectedApp.aiCheckResult && (
                  <div
                    className={`p-4 rounded-xl border space-y-2 ${
                      selectedApp.aiCheckResult.isPassed
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-rose-50 border-rose-200 text-rose-900"
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span>🤖 Gemini AI自動判定結果</span>
                      <span>{selectedApp.aiCheckResult.score} / 100点</span>
                    </div>
                    {selectedApp.aiCheckResult.feedback?.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-slate-700">
                        {selectedApp.aiCheckResult.feedback.map((fb, idx) => (
                          <li key={idx}>{fb}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {selectedApp.progressStep === "draft_submitted" && (
                  <button
                    onClick={() => handleApproveDraft(selectedApp.id)}
                    disabled={updating}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition"
                  >
                    下書きの内容を確認し、投稿を許可（承認）する
                  </button>
                )}
              </div>
            ) : (
              <div className="text-slate-400 text-center py-4">まだ下書きは提出されていません。</div>
            )}

            {/* 投稿完了URL */}
            {selectedApp.postUrl && (
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <h4 className="font-bold text-slate-900">提出された投稿URL</h4>
                <a
                  href={selectedApp.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 underline font-bold break-all block"
                >
                  {selectedApp.postUrl}
                </a>

                {selectedApp.progressStep === "posted" && (
                  <button
                    onClick={() => handleCompleteAll(selectedApp.id)}
                    disabled={updating}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition mt-2"
                  >
                    投稿を確認し、案件を「完了（報酬確定）」にする
                  </button>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}