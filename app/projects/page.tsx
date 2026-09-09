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
            <p className="text-xs text-slate-500 mt-1">案件を選択してオリエンシート（詳細・条件）をご確認ください。</p>
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
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 px-2.5 py-1 rounded-md text-[10px] font-bold transition">
                    {project.platform}
                  </span>
                  <h2 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition">
                    {project.title}
                  </h2>
                  <div className="text-xs text-slate-500">
                    報酬: <span className="font-bold text-indigo-600">{project.reward}円</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="w-full bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 font-bold py-2.5 rounded-xl text-xs transition text-center">
                    詳細・要件を見る ➔
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}