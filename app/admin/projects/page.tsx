"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { Project, ProjectPublishStatus } from "@/types";
import Container from "@/components/layout/Container";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<"Instagram" | "TikTok" | "YouTube">("Instagram");
  const [reward, setReward] = useState("");
  const [status, setStatus] = useState<ProjectPublishStatus>("active");
  const [coverImage, setCoverImage] = useState("");
  const [recruitmentPeriod, setRecruitmentPeriod] = useState("");
  const [postingPeriod, setPostingPeriod] = useState("");
  const [summary, setSummary] = useState("");
  const [requiredCuts, setRequiredCuts] = useState("");
  const [captionRules, setCaptionRules] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [mention, setMention] = useState("");

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

  useEffect(() => {
    fetchProjects();
  }, []);

  const resetForm = () => {
    setTitle("");
    setPlatform("Instagram");
    setReward("");
    setStatus("active");
    setCoverImage("");
    setRecruitmentPeriod("");
    setPostingPeriod("");
    setSummary("");
    setRequiredCuts("");
    setCaptionRules("");
    setHashtags("");
    setMention("");
  };

  const handleEditOpen = (project: Project) => {
    setEditingProject(project);
    setTitle(project.title || "");
    setPlatform(project.platform || "Instagram");
    setReward(project.reward || "");
    setStatus(project.status || "draft");
    setCoverImage(project.coverImage || "");
    setRecruitmentPeriod(project.recruitmentPeriod || "");
    setPostingPeriod(project.postingPeriod || "");
    setSummary(project.summary || "");
    setRequiredCuts(project.requiredCuts || "");
    setCaptionRules(project.captionRules || "");
    setHashtags(project.hashtags || "");
    setMention(project.mention || "");
  };

  const handleSave = async () => {
    const data = {
      title,
      platform,
      reward,
      status,
      coverImage,
      recruitmentPeriod,
      postingPeriod,
      summary,
      requiredCuts,
      captionRules,
      hashtags,
      mention,
      createdAt: new Date(),
    };

    try {
      if (editingProject) {
        await updateDoc(doc(db, "projects", editingProject.id), data);
      } else {
        await addDoc(collection(db, "projects"), data);
      }
      setEditingProject(null);
      setIsCreateModalOpen(false);
      resetForm();
      await fetchProjects();
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      await fetchProjects();
    } catch (e) {
      console.error(e);
      alert("削除に失敗しました");
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">案件管理一覧</h1>
            <p className="text-xs text-slate-500 mt-1">案件の作成・編集およびオリエン資料の登録を行えます。</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
          >
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
                  <th className="py-3.5 px-6">公開状態</th>
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
                      <span
                        className={`font-bold px-2.5 py-1 rounded-md text-[11px] ${
                          project.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : project.status === "closed"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {project.status === "active" ? "公開中" : project.status === "closed" ? "終了" : "下書き"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-3">
                      <button
                        onClick={() => handleEditOpen(project)}
                        className="text-slate-600 hover:text-slate-900 font-bold"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-rose-500 hover:text-rose-700 font-bold"
                      >
                        削除
                      </button>
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

        {(editingProject || isCreateModalOpen) && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-slate-900">
                {isCreateModalOpen ? "新規案件追加" : "案件・オリエン情報編集"}
              </h2>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">案件タイトル</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">カバー画像URL</label>
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">媒体</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as "Instagram" | "TikTok" | "YouTube")}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="YouTube">YouTube</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">報酬金額</label>
                    <input
                      type="text"
                      value={reward}
                      onChange={(e) => setReward(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">公開ステータス</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProjectPublishStatus)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
                    >
                      <option value="active">公開中</option>
                      <option value="draft">下書き</option>
                      <option value="closed">終了</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">募集期間</label>
                    <input
                      type="text"
                      value={recruitmentPeriod}
                      onChange={(e) => setRecruitmentPeriod(e.target.value)}
                      placeholder="例: 2026-09-01 〜 2026-09-10"
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">投稿期限</label>
                    <input
                      type="text"
                      value={postingPeriod}
                      onChange={(e) => setPostingPeriod(e.target.value)}
                      placeholder="例: 2026-09-20 まで"
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">【概要・ブランド紹介】</label>
                  <textarea
                    rows={2}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">【必須撮影カット・撮影シーン】</label>
                  <textarea
                    rows={2}
                    value={requiredCuts}
                    onChange={(e) => setRequiredCuts(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">【キャプション記載内容】</label>
                  <textarea
                    rows={2}
                    value={captionRules}
                    onChange={(e) => setCaptionRules(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">【ハッシュタグ】</label>
                    <input
                      type="text"
                      value={hashtags}
                      onChange={(e) => setHashtags(e.target.value)}
                      placeholder="#PR #商品名"
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">【メンション】</label>
                    <input
                      type="text"
                      value={mention}
                      onChange={(e) => setMention(e.target.value)}
                      placeholder="@account_name"
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setIsCreateModalOpen(false);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                >
                  保存する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}