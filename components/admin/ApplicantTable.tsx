"use client";

import { Application, SelectionStatus, ProgressStatus } from "@/types";

interface Props {
  applications: Application[];
  onSelectionStatusChange: (appId: string, status: SelectionStatus) => void;
  onProgressStatusChange: (appId: string, status: ProgressStatus) => void;
}

export default function ApplicantTable({
  applications,
  onSelectionStatusChange,
  onProgressStatusChange,
}: Props) {
  if (applications.length === 0) {
    return <div className="p-12 text-center text-slate-400 text-sm">まだ応募がありません。</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-xs text-slate-600">
        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
          <tr>
            <th className="py-3.5 px-4">応募者名 / SNS</th>
            <th className="py-3.5 px-4">受注ステータス</th>
            <th className="py-3.5 px-4">案件進捗ステータス</th>
            <th className="py-3.5 px-4">連絡先</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-slate-50/80 transition">
              <td className="py-3.5 px-4">
                <div className="font-bold text-slate-900 text-sm">{app.name}</div>
                <div className="text-indigo-600 text-xs font-medium">{app.snsAccount} ({app.followerCount}人)</div>
              </td>
              
              {/* 1. 受注ステータス */}
              <td className="py-3.5 px-4">
                <select
                  value={app.selectionStatus || "brand_review"}
                  onChange={(e) => onSelectionStatusChange(app.id, e.target.value as SelectionStatus)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none bg-white shadow-xs cursor-pointer"
                >
                  <option value="brand_review">⏳ ブランド確認中</option>
                  <option value="accepted">🎉 案件確定</option>
                  <option value="rejected">❌ お見送り</option>
                </select>
              </td>

              {/* 2. 進捗ステータス (案件確定のユーザーのみ変更可能) */}
              <td className="py-3.5 px-4">
                {app.selectionStatus === "accepted" ? (
                  <select
                    value={app.progressStatus || "drafting"}
                    onChange={(e) => onProgressStatusChange(app.id, e.target.value as ProgressStatus)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-emerald-50 text-emerald-800 border-emerald-200 focus:outline-none cursor-pointer"
                  >
                    <option value="drafting">📝 下書き作成中</option>
                    <option value="reviewing">🔍 確認中</option>
                    <option value="waiting_post">⏳ 投稿待ち</option>
                    <option value="posted">🚀 投稿済み</option>
                    <option value="completed">✅ 完了</option>
                  </select>
                ) : (
                  <span className="text-slate-400 text-[11px] font-medium">- (確定後に設定可能)</span>
                )}
              </td>

              <td className="py-3.5 px-4 text-slate-500 text-xs">
                {app.email}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}