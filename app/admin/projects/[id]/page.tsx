"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, updateDoc, query, orderBy } from "firebase/firestore";

interface Project {
  projectName: string;
  media: string;
  hashtags: string;
  overview: string;
}

interface Application {
  id: string;
  name: string;
  snsAccount: string;
  followers: number;
  status: string;
  appliedAt?: any;
}

export default function AdminProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjectAndApps = async () => {
    if (!id) return;
    try {
      // 案件データ取得
      const projectDoc = await getDoc(doc(db, "projects", id));
      if (projectDoc.exists()) {
        setProject(projectDoc.data() as Project);
      }

      // 応募者データ一覧を取得
      const appsQuery = query(collection(db, "projects", id, "applications"), orderBy("appliedAt", "desc"));
      const appsSnapshot = await getDocs(appsQuery);
      const appsList: Application[] = [];
      appsSnapshot.forEach((doc) => {
        appsList.push({ id: doc.id, ...doc.data() } as Application);
      });
      setApplications(appsList);
    } catch (error) {
      console.error("データの取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndApps();
  }, [id]);

  // ステータス更新処理
  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const appRef = doc(db, "projects", id, "applications", appId);
      await updateDoc(appRef, { status: newStatus });
      setApplications((prev) =>
        prev.map((item) => (item.id === appId ? { ...item, status: newStatus } : item))
      );
    } catch (error) {
      console.error("ステータスの変更に失敗しました:", error);
      alert("更新に失敗しました");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-sm text-gray-500">データを読み込み中...</div>;
  }

  if (!project) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-sm text-gray-500">案件が見つかりませんでした。</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <Link href="/admin/projects" className="text-sm text-gray-500 hover:text-gray-700 underline">
            ← 管理者一覧に戻る
          </Link>
        </div>

        {/* サマリー */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b pb-4">
            <div>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">管理者専用</span>
              <h1 className="text-xl font-bold text-gray-900 mt-1">{project.projectName}</h1>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 p-3 rounded-lg border">
              <p className="text-xs text-gray-500">総応募数</p>
              <p className="text-xl font-bold text-gray-900">{applications.length} 名</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <p className="text-xs text-yellow-700">未対応</p>
              <p className="text-xl font-bold text-yellow-800">
                {applications.filter((a) => a.status === "未対応").length} 名
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <p className="text-xs text-green-700">採用確定</p>
              <p className="text-xl font-bold text-green-800">
                {applications.filter((a) => a.status === "採用").length} 名
              </p>
            </div>
          </div>
        </div>

        {/* 応募者リスト */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">応募者管理リスト</h2>
          {applications.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">まだ応募はありません。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">お名前</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">SNS ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">フォロワー数</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">ステータス変更</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">{app.name}</td>
                      <td className="px-4 py-3 text-indigo-600 font-medium">{app.snsAccount}</td>
                      <td className="px-4 py-3 text-gray-700">{app.followers?.toLocaleString()}人</td>
                      <td className="px-4 py-3">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                            app.status === "採用"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : app.status === "不採用"
                              ? "bg-gray-100 text-gray-600 border-gray-200"
                              : "bg-yellow-100 text-yellow-800 border-yellow-200"
                          }`}
                        >
                          <option value="未対応">未対応</option>
                          <option value="検討中">検討中</option>
                          <option value="採用">採用</option>
                          <option value="不採用">不採用</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 案件詳細確認 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-md font-bold text-gray-900 mb-4 border-b pb-2">オリエンシート内容確認</h2>
          <dl className="divide-y divide-gray-200 text-sm">
            <div className="py-3 grid grid-cols-3">
              <dt className="text-gray-500">投稿先メディア</dt>
              <dd className="col-span-2 font-medium text-gray-900 uppercase">{project.media}</dd>
            </div>
            <div className="py-3 grid grid-cols-3">
              <dt className="text-gray-500">必須ハッシュタグ</dt>
              <dd className="col-span-2 text-indigo-600 font-medium">{project.hashtags}</dd>
            </div>
            <div className="py-3 grid grid-cols-3">
              <dt className="text-gray-500">概要</dt>
              <dd className="col-span-2 text-gray-700 whitespace-pre-wrap">{project.overview}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}