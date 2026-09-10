"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Application, SelectionStatus } from "@/types";

interface ApplicantTableProps {
  applications: Application[];
  projectTitle: string;
  onRefresh: () => void;
}

export default function ApplicantTable({ applications, projectTitle, onRefresh }: ApplicantTableProps) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [userHistory, setUserHistory] = useState<Application[] | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (appId: string, status: SelectionStatus) => {
    try {
      setUpdating(true);
      await updateDoc(doc(db, "applications", appId), {
        status,
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

  const handleApproveDraft = async (appId: string) => {
    try {
      setUpdating(true);
      await updateDoc(doc(db, "applications", appId), {
        progressStep: "draft_approved",
        updatedAt: new Date(),
      });
      alert("下書き（キャプション・メディア）を承認しました。");
      setSelectedApp(null);
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("承認に失敗しました。");
    } finally {
      setUpdating(false);
    }
  };

  const handleFetchUserHistory = async (userId: string, name: string) => {
    try {
      setSelectedUserName(name);
      const q = query(collection(db, "applications"), where("userId", "==", userId));
      const snap = await getDocs(q);
      const list: Application[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Application));
      setUserHistory(list);
    } catch (e) {
      console.error(e);
      alert("ユーザー履歴の取得に失敗しました。");
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th className="p-3">応募者名（クリックで全受託案件を表示）</th>
              <th className="p-3">SNSアカウント</th>
              <th className="p-3">選考ステータス</th>
              <th className="p-3">進行フェーズ</th>
              <th className="p-3 text-right">提出物確認</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50/50 transition">
                <td className="p-3">
                  <button
                    onClick={() => handleFetchUserHistory(app.userId, app.name)}
                    className="font-bold text-indigo-600 hover:underline text-left"
                  >
                    {app.name}
                  </button>
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
                <td className="p-3 font-bold text-slate-700">{app.progressStep || "applied"}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1 rounded-lg transition"
                  >
                    詳細・提出物
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 提出物（下書きテキスト・メディア・投稿URL）確認モーダル */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
            <h3 className="text-base font-extrabold text-slate-900">{selectedApp.name} 様の個別確認ページ</h3>
            
            {selectedApp.draftText && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">提出下書きテキスト</h4>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono whitespace-pre-wrap">
                  {selectedApp.draftText}
                </div>
              </div>
            )}

            {selectedApp.draftMediaUrls && selectedApp.draftMediaUrls.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">提出画像 / 動画プレビュー</h4>
                <div className="grid grid-cols-3 gap-2">
                  {selectedApp.draftMediaUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="block border rounded-lg overflow-hidden bg-slate-100">
                      <img src={url} alt={`submission-${i}`} className="w-full h-24 object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selectedApp.progressStep === "draft_submitted" && (
              <button
                onClick={() => handleApproveDraft(selectedApp.id)}
                disabled={updating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition"
              >
                下書き（テキスト・メディア）を承認する
              </button>
            )}

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedApp(null)} className="px-4 py-2 border rounded-xl font-bold text-slate-600">
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ユーザー別全案件受託履歴モーダル */}
      {userHistory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">{selectedUserName} 様の受託案件一覧</h3>
              <button onClick={() => setUserHistory(null)} className="text-slate-400 font-bold">✕</button>
            </div>
            <div className="space-y-3">
              {userHistory.map((item) => (
                <div key={item.id} className="p-3 border rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900">{item.projectTitle || item.projectId}</div>
                    <div className="text-[11px] text-slate-400">フェーズ: {item.progressStep}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    item.status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                  }`}>
                    {item.status === "approved" ? "採択" : item.status === "rejected" ? "見送り" : "選考中"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}