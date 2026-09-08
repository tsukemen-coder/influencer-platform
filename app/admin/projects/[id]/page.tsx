"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { Application, SelectionStatus, ProgressStep } from "@/types";
import Container from "@/components/layout/Container";

export default function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const q = query(collection(db, "applications"), where("projectId", "==", projectId));
      const querySnapshot = await getDocs(q);
      const list: Application[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Application);
      });
      setApplications(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [projectId]);

  const handleStatusChange = async (appId: string, status: SelectionStatus) => {
    try {
      await updateDoc(doc(db, "applications", appId), { status });
      fetchApplications();
    } catch (e) {
      console.error(e);
      alert("ステータスの更新に失敗しました");
    }
  };

  const handleProgressChange = async (appId: string, progressStep: ProgressStep) => {
    try {
      await updateDoc(doc(db, "applications", appId), { progressStep });
      fetchApplications();
    } catch (e) {
      console.error(e);
      alert("進捗の更新に失敗しました");
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">応募者一覧・ステータス管理</h1>
            <p className="text-xs text-slate-500 mt-1">選考状況および制作進捗を設定・管理します。</p>
          </div>
          <Link
            href="/admin/projects"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            ➔ 案件一覧に戻る
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">読み込み中...</div>
        ) : applications.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            まだ応募がありません。
          </div>
        ) : (
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
                        onChange={(e) => handleStatusChange(app.id, e.target.value as SelectionStatus)}
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
                          onChange={(e) => handleProgressChange(app.id, e.target.value as ProgressStep)}
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
        )}
      </div>
    </Container>
  );
}