"use client";

import { Application } from "@/types";

interface ApplicationStatusTrackerProps {
  applications: Application[];
}

export default function ApplicationStatusTracker({ applications }: ApplicationStatusTrackerProps) {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">案件確定</span>;
      case "rejected":
        return <span className="bg-rose-100 text-rose-800 font-bold px-3 py-1 rounded-full text-xs">お見送り</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs">ブランド確認中</span>;
    }
  };

  const getProgressLabel = (step?: string) => {
    switch (step) {
      case "reviewing":
        return "2. 確認中";
      case "scheduled":
        return "3. 投稿待ち";
      case "completed":
        return "4. 投稿済み";
      default:
        return "1. 下書き作成中";
    }
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-slate-400">
        該当する応募情報が見つかりませんでした。
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {applications.map((app) => (
        <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-500">案件ID: {app.projectId}</span>
            {getStatusBadge(app.status)}
          </div>

          {app.status === "approved" && (
            <div className="bg-indigo-50/50 p-4 rounded-xl space-y-2 border border-indigo-100">
              <div className="text-xs font-bold text-indigo-900">現在の制作進捗</div>
              <div className="text-sm font-extrabold text-indigo-600">
                {getProgressLabel(app.progressStep)}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}