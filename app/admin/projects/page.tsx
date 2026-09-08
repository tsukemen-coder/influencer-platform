"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Project } from "@/types";
import Container from "@/components/layout/Container";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
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
            <h1 className="text-2xl font-extrabold text-slate-900">案件管理一覧</h1>
            <p className="text-xs text-slate-500 mt-1">公開・非公開の切り替えや応募者の選考・進捗管理が行えます。</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm">
            ＋ 新規案件を追加
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">読み込み中...</div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">案件名</th>
                  <th className="py-3.5 px-6">媒体 / 報酬</th>
                  <th className="py-3.5 px-6">ステータス</th>
                  <th className="py-3.5 px-6 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">{project.title}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-700">{project.platform}</div>
                      <div className="text-slate-400 text-[11px]">{project.reward}円</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md text-[11px]">
                        {project.status === "active" ? "公開中" : "下書き"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-3">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-bold"
                      >
                        応募者一覧 ➔
                      </Link>
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