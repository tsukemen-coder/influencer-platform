"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Project } from "@/types";
import Container from "@/components/layout/Container";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, "projects"), where("status", "==", "active"));
        const querySnapshot = await getDocs(q);
        const list: Project[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjects(list);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">募集中の案件一覧</h1>
            <p className="text-xs text-slate-500 mt-1">気になる案件を選んでご応募ください。</p>
          </div>
          <Link
            href="/status"
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            🔍 応募状況を確認する
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">読み込み中...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">現在募集中の案件はありません。</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-bold">
                    {project.platform}
                  </span>
                  <h2 className="font-extrabold text-slate-900 text-base">{project.title}</h2>
                  <div className="text-xs text-slate-500">
                    報酬: <span className="font-bold text-indigo-600">{project.reward}円</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition text-center"
                  >
                    詳細を見る
                  </Link>
                  <Link
                    href={`/apply?projectId=${project.id}`}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition text-center"
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