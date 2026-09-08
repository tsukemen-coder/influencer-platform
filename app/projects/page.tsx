"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  platform: string;
  reward: string;
  status: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        // 公開中 (status == 'active') の案件のみ取得
        const q = query(collection(db, "projects"), where("status", "==", "active"));
        const querySnapshot = await getDocs(q);
        const list: Project[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjects(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (loading) return <div className="p-8 text-center text-xs text-slate-500">案件を読み込み中...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">募集中の案件一覧</h1>
          <p className="text-xs text-slate-500">気になる案件を選んでご応募ください。</p>
        </div>
        <Link
          href="/status"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 transition"
        >
          🔍 応募状況を確認する
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white p-12 text-center text-xs text-slate-400 rounded-xl border">
          現在募集中の案件はありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{p.platform}</span>
                <h2 className="text-base font-bold text-slate-800 mt-2">{p.title}</h2>
                <div className="text-xs text-slate-500 mt-1">報酬: <span className="font-bold text-slate-700">{p.reward}</span></div>
              </div>

              <Link
                href={`/apply?projectId=${p.id}`}
                className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg transition"
              >
                この案件に応募する ➔
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}