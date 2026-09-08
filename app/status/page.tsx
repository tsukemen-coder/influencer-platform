"use client";

import { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Application } from "@/types";
import Container from "@/components/layout/Container";
import StatusTracker from "@/components/status/StatusTracker";

export default function StatusPage() {
  const [email, setEmail] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const q = query(collection(db, "applications"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      const list: Application[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Application);
      });
      setApplications(list);
      setSearched(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">応募状況・進捗確認</h1>
            <p className="text-xs text-slate-500 mt-1">応募時のメールアドレスで照会できます。</p>
          </div>
          <Link
            href="/projects"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            ➔ 案件一覧に戻る
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 justify-center max-w-md mx-auto py-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="flex-1 border border-slate-300 rounded-xl px-4 py-2 text-xs focus:outline-indigo-500"
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition"
          >
            照会する
          </button>
        </form>

        {searched && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                該当する応募情報が見つかりませんでした。
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-500">案件ID: {app.projectId}</span>
                    <span className="text-xs font-bold text-indigo-600">応募日時: {app.appliedAt ? new Date(app.appliedAt.seconds * 1000).toLocaleDateString() : "-"}</span>
                  </div>
                  <StatusTracker status={app.status || "pending"} progressStep={app.progressStep} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Container>
  );
}