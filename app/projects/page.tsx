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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
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
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    詳細を見る
                  </button>
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

        {selectedProject && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl text-xs">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                    {selectedProject.platform}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{selectedProject.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-bold text-slate-500 block mb-0.5">報酬・条件</span>
                  <p className="font-bold text-indigo-600">{selectedProject.reward}円</p>
                </div>
                {selectedProject.details && (
                  <div>
                    <span className="font-bold text-slate-500 block mb-0.5">オリエン資料・補足情報</span>
                    <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {selectedProject.details}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  閉じる
                </button>
                <Link
                  href={`/apply?projectId=${selectedProject.id}`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                >
                  この案件に応募する
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}