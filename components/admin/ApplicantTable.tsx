"use client";

import { Application, SelectionStatus, ProgressStep } from "@/types";

interface ApplicantTableProps {
  applications: Application[];
  onStatusChange: (appId: string, status: SelectionStatus) => void;
  onProgressChange: (appId: string, progressStep: ProgressStep) => void;
}

export default function ApplicantTable({
  applications,
  onStatusChange,
  onProgressChange,
}: ApplicantTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-left text-xs text-slate-600">
        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
          <tr>
            <th className="py-3.5 px-6">応募者名 / メール</th>
            <th className="py-3.5 px-6">SNSアカウント</th>
            <th className="py-3.5 px-6">選考ステータス</th>
            <th className="py-3.5 px-6">制作進捗ステータス</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-slate-50/80 transition">
              <td className="py-4 px-6">
                <div className="font-bold text-slate-900">{app.name}</div>
                <div className="text-slate-400 text-[11px]">{app.email}</div>
              </td>
              <td className="py-4 px-6 font-semibold text-slate-700">
                {app.snsAccount || "-"}
              </td>
              <td className="py-4 px-6">
                <select
                  value={app.status || "pending"}
                  onChange={(e) => onStatusChange(app.id, e.target.value as SelectionStatus)}
                  className="border border-slate-300 rounded-lg p-1.5 font-bold text-xs focus:outline-indigo-500"
                >
                  <option value="pending">ブランド確認中</option>
                  <option value="approved">案件確定</option>
                  <option value="rejected">お見送り</option>
                </select>
              </td>
              <td className="py-4 px-6">
                {app.status === "approved" ? (
                  <select
                    value={app.progressStep || "drafting"}
                    onChange={(e) => onProgressChange(app.id, e.target.value as ProgressStep)}
                    className="border border-slate-300 rounded-lg p-1.5 font-bold text-xs focus:outline-indigo-500 bg-indigo-50 text-indigo-900"
                  >
                    <option value="drafting">1. 下書き作成中</option>
                    <option value="reviewing">2. 確認中</option>
                    <option value="scheduled">3. 投稿待ち</option>
                    <option value="completed">4. 投稿済み</option>
                  </select>
                ) : (
                  <span className="text-slate-400 text-[11px]">確定後に選択可能</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}