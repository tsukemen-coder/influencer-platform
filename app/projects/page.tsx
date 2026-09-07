"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

interface Project {
  id: string;
  title: string;
  projectName: string;
  media: string;
  status: string;
  recruitmentPeriod: string;
}

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const projectList: Project[] = [];
        querySnapshot.forEach((doc) => {
          projectList.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjects(projectList);
      } catch (error) {
        console.error("案件の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">募集中のPR案件一覧</h1>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">案件情報を取得中...</div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">現在募集中の案件はありません。</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">ステータス</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">メディア</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">案件名</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">募集期間</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {project.status || "募集中"}
                      </span>
                    </td>
                    <td className="px-6 py-4 uppercase font-semibold text-xs text-gray-500">
                      {project.media}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {project.projectName || project.title}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {project.recruitmentPeriod}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/projects/${project.id}`}
                        className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-xs font-bold"
                      >
                        詳細を見る
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}