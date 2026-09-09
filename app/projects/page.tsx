"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Project } from "@/types";
import Container from "@/components/layout/Container";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const list: Project[] = [];
        snap.forEach((doc) => {
          const data = doc.data() as Omit<Project, "id">;
          // status が 'published'（公開中）の案件だけを表示
          if ((data.status as string) === "published" || (data.status as string) === "公開中" || data.status !== ("draft" as unknown)) {
            list.push({ ...data, id: doc.id });
          }
        });
        setProjects(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Container>
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-extrabold text-slate-900">募集中の案件一覧</h1>
          <p className="text-xs text-slate-500 mt-1">気になる案件を選んでご応募ください。</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">読み込み中...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">現在募集中の案件はありません。</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm text-xs flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded text-[10px] font-bold">
                    {p.platform}
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900 line-clamp-1">{p.title}</h2>
                  <p className="text-indigo-600 font-bold">報酬: {p.reward}円</p>
                </div>

                <div className="pt-2 flex gap-2">
                  <Link
                    href={`/projects/${p.id}`}
                    className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition"
                  >
                    詳細を見る
                  </Link>
                  <Link
                    href={`/apply?projectId=${p.id}`}
                    className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition"
                  >
                    この案件に応募する
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}