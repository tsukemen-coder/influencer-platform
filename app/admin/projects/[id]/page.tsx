"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { Application, SelectionStatus, ProgressStatus } from "@/types";
import Container from "@/components/layout/Container";
import ApplicantTable from "@/components/admin/ApplicantTable";

export default function AdminProjectApplicantsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const q = query(collection(db, "applications"), where("projectId", "==", projectId));
      const querySnapshot = await getDocs(q);
      const list: Application[] = [];
      querySnapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Application);
      });
      setApplications(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [projectId]);

  // 受注ステータス変更
  const handleSelectionStatusChange = async (appId: string, status: SelectionStatus) => {
    try {
      await updateDoc(doc(db, "applications", appId), { selectionStatus: status });
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, selectionStatus: status } : app))
      );
    } catch (e) {
      alert("更新に失敗しました");
    }
  };

  // 進捗ステータス変更
  const handleProgressStatusChange = async (appId: string, status: ProgressStatus) => {
    try {
      await updateDoc(doc(db, "applications", appId), { progressStatus: status });
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, progressStatus: status } : app))
      );
    } catch (e) {
      alert("更新に失敗しました");
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">応募者一覧・ステータス管理</h1>
          <p className="text-xs text-slate-500">ブランド確認結果および制作進捗を設定・管理します。</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">読み込み中...</div>
        ) : (
          <ApplicantTable
            applications={applications}
            onSelectionStatusChange={handleSelectionStatusChange}
            onProgressStatusChange={handleProgressStatusChange}
          />
        )}
      </div>
    </Container>
  );
}