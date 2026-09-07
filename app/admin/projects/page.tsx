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
  applicantCount?: number;
}

export default function AdminProjectListPage() {
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded font-bold">管理者用</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">案件・応募管理一覧</h1>
          </div>
          <Link
            href="/admin/projects/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 inline-block"
          >
            + 新規案件を作成
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">読み込み中...</div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">登録されている案件がありません。「新規案件を作成」から登録してください。</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
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
                        href={`/admin/projects/${project.id}`}
                        className="inline-block bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 text-xs font-medium"
                      >
                        応募状況・詳細
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