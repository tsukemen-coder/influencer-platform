"use client";

import { Application } from "@/types";

interface Props {
  applications: Application[];
}

export default function ApplicationStatusTracker({ applications }: Props) {
  if (applications.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
        該当する応募履歴は見つかりませんでした。
      </div>
    );
  }

  const getSelectionBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">🎉 案件確定</span>;
      case "rejected":
        return <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full text-xs">お見送り</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs">⏳ ブランド確認中</span>;
    }
  };

  const progressSteps = [
    { key: "drafting", label: "1. 下書き作成中" },
    { key: "reviewing", label: "2. 確認中" },
    { key: "waiting_post", label: "3. 投稿待ち" },
    { key: "posted", label: "4. 投稿済み" },
  ];

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">応募案件</span>
              <h3 className="font-bold text-slate-900 text-base">{app.projectTitle || "案件情報"}</h3>
            </div>
            <div>{getSelectionBadge(app.selectionStatus)}</div>
          </div>

          {/* 案件確定時のみ、現在の作業ステップを表示 */}
          {app.selectionStatus === "accepted" && (
            <div className="bg-slate-50 p-4 rounded-xl space-y-2">
              <div className="text-xs font-bold text-slate-700 mb-2">現在の進行ステータス:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                {progressSteps.map((step) => {
                  const isCurrent = app.progressStatus === step.key;
                  return (
                    <div
                      key={step.key}
                      className={`py-2 px-2 rounded-lg text-xs font-bold transition ${
                        isCurrent
                          ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200"
                          : "bg-white text-slate-400 border border-slate-200"
                      }`}
                    >
                      {step.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}