"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

interface Project {
  title: string;
  projectName: string;
  media: string;
  overview: string;
  hashtags: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", snsAccount: "", followers: "", pr: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // URLのIDを元にFirestoreから案件詳細を取得
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProject(docSnap.data() as Project);
        }
      } catch (error) {
        console.error("案件詳細の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // 応募フォームの送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await addDoc(collection(db, "projects", id, "applications"), {
        ...formData,
        followers: Number(formData.followers),
        status: "未対応",
        appliedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("応募の送信に失敗しました:", error);
      alert("応募に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">案件情報を取得中...</div>;
  }

  if (!project) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">指定された案件が見つかりませんでした。</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="mb-4">
          <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-700 underline">
            ← オリエンシート一覧に戻る
          </Link>
        </div>

        <div className="flex justify-between items-center border-b border-gray-200 pb-6 mb-6">
          <h1 className="font-bold text-2xl text-gray-900">{project.title || project.projectName}</h1>
          <button
            onClick={() => { setIsModalOpen(true); setSubmitted(false); }}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shrink-0 ml-4 shadow-sm"
          >
            この案件に応募する
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <dl className="divide-y divide-gray-200 text-sm">
            <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 bg-gray-50">
              <dt className="font-medium text-gray-900">案件名</dt>
              <dd className="mt-1 text-gray-700 sm:col-span-2 sm:mt-0">{project.projectName || project.title}</dd>
            </div>
            <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-gray-900">投稿先メディア</dt>
              <dd className="mt-1 text-gray-700 sm:col-span-2 sm:mt-0 uppercase">{project.media}</dd>
            </div>
            <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 bg-gray-50">
              <dt className="font-medium text-gray-900">概要</dt>
              <dd className="mt-1 text-gray-700 sm:col-span-2 sm:mt-0 whitespace-pre-wrap">{project.overview}</dd>
            </div>
            <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-gray-900">必須ハッシュタグ</dt>
              <dd className="mt-1 text-blue-600 font-medium sm:col-span-2 sm:mt-0">{project.hashtags}</dd>
            </div>
          </dl>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">✓</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">応募が完了しました</h3>
                <p className="text-sm text-gray-600 mb-6">選考結果はSNSのダイレクトメッセージ等でご連絡いたします。</p>
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">閉じる</button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4">案件への応募</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">お名前 (氏名) *</label>
                    <input type="text" required placeholder="山田 太郎" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">SNSアカウント ID *</label>
                    <input type="text" required placeholder="@username" value={formData.snsAccount} onChange={(e) => setFormData({ ...formData, snsAccount: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">フォロワー数 (概算) *</label>
                    <input type="number" required placeholder="3000" value={formData.followers} onChange={(e) => setFormData({ ...formData, followers: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">自己PR</label>
                    <textarea rows={3} placeholder="アピールポイントがあればご記入ください" value={formData.pr} onChange={(e) => setFormData({ ...formData, pr: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="pt-2">
                    <button type="submit" disabled={submitting} className="w-full py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
                      {submitting ? "送信中..." : "送信する"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}