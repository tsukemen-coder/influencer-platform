"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Project, Application } from "@/types";
import Container from "@/components/layout/Container";
import ApplicantTable from "@/components/admin/ApplicantTable";

export default function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjectAndApps = async () => {
    try {
      // 案件情報取得
      const docRef = doc(db, "projects", resolvedParams.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProject({ id: docSnap.id, ...docSnap.data() } as Project);
      }

      // 応募者一覧取得
      const q = query(collection(db, "applications"), where("projectId", "==", resolvedParams.id));
      const appSnap = await getDocs(q);
      const list: Application[] = [];
      appSnap.forEach((d) => {
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
    fetchProjectAndApps();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <Container>
        <div className="text-center py-12 text-xs text-slate-400">読み込み中...</div>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container>
        <div className="text-center py-12 text-xs text-slate-400">案件が見つかりませんでした。</div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-5">
          <div>
            <Link href="/admin/projects" className="text-xs font-bold text-slate-500 hover:text-slate-800 transition">
              ← 管理一覧に戻る
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{project.title}（管理画面）</h1>
          </div>
          <Link
            href={`/projects/${project.id}`}
            target="_blank"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition"
          >
            ↗ 公開オリエンシートを確認
          </Link>
        </div>

        <ApplicantTable
          applications={applications}
          projectTitle={project.title}
          onRefresh={fetchProjectAndApps}
        />
      </div>
    </Container>
  );
}