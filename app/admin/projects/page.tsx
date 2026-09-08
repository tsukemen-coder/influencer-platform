"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  platform: string;
  reward: string;
  status: "active" | "draft" | "closed"; // active: 公開, draft: 下書き, closed: 募集終了
  orientSheetUrl?: string; // 採用者向けオリエン資料URL等
  createdAt?: any;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // モーダル・フォーム用
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [reward, setReward] = useState("");
  const [status, setStatus] = useState<"active" | "draft" | "closed">("active");
  const [orientSheetUrl, setOrientSheetUrl] = useState("");

  const fetchProjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const list: Project[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Project);
      });
      setProjects(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingId(project.id);
      setTitle(project.title || "");
      setPlatform(project.platform || "Instagram");
      setReward(project.reward || "");
      setStatus(project.status || "active");
      setOrientSheetUrl(project.orientSheetUrl || "");
    } else {
      setEditingId(null);
      setTitle("");
      setPlatform("Instagram");
      setReward("");
      setStatus("active");
      setOrientSheetUrl("");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        title,
        platform,
        reward,
        status,
        orientSheetUrl,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "projects", editingId), data);
      } else {
        await addDoc(collection(db, "projects"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }

      setIsModalOpen(false);
      fetchProjects();
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました。");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-xs text-slate-500">読み込み中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">案件管理一覧</h1>
          <p className="text-xs text-slate-500">公開・非公開の切り替えやオリエン資料の設定が行えます。</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition"
        >
          ＋ 新規案件を追加
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">案件名</th>
              <th className="py-3 px-4">媒体 / 報酬</th>
              <th className="py-3 px-4">ステータス</th>
              <th className="py-3 px-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-bold text-slate-900">{p.title}</td>
                <td className="py-3.5 px-4">
                  <div>{p.platform}</div>
                  <div className="text-slate-400 text-[11px]">{p.reward}</div>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : p.status === "closed"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.status === "active" ? "公開中" : p.status === "closed" ? "募集終了" : "下書き"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <Link
                    href={`/admin/projects/${p.id}`}
                    className="text-indigo-600 hover:underline font-bold text-[11px]"
                  >
                    応募者一覧
                  </Link>
                  <button
                    onClick={() => handleOpenModal(p)}
                    className="text-slate-600 hover:underline text-[11px]"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-rose-600 hover:underline text-[11px]"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 編集・新規登録モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-800">{editingId ? "案件編集" : "新規案件追加"}</h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">案件タイトル</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">媒体</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="X (Twitter)">X (Twitter)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ステータス</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                >
                  <option value="active font-bold">公開中</option>
                  <option value="closed">募集終了</option>
                  <option value="draft">下書き</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">報酬金額・条件</label>
              <input
                type="text"
                required
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs"
                placeholder="例: 10,000円 + 商品無償提供"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                採用者限定：オリエン資料URL / 連絡先
              </label>
              <textarea
                rows={3}
                value={orientSheetUrl}
                onChange={(e) => setOrientSheetUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs"
                placeholder="例: https://docs.google.com/presentation/... （※選考通過者のみマイページに表示されます）"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-lg text-xs"
              >
                キャンセル
              </button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-xs">
                保存
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}