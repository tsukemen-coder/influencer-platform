"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Project } from "@/types";
import { useAuth } from "@/lib/useAuth";
import Container from "@/components/layout/Container";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    const fetchProjectAndStatus = async () => {
      try {
        const docRef = doc(db, "projects", resolvedParams.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() } as Project);
        }

        if (user) {
          const q = query(
            collection(db, "applications"),
            where("projectId", "==", resolvedParams.id),
            where("userId", "==", user.uid)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            setIsApplied(true);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndStatus();
  }, [resolvedParams.id, user]);

  if (loading) {
    return (
      <Container>
        <div className="text-center py-12 text-xs text-slate-400">読み込み中...</div>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container>
        <div className="text-center py-12 text-xs text-slate-400">案件が見つかりませんでした。</div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link href="/projects" className="text-xs font-bold text-slate-500 hover:text-slate-800 transition">
            ← 案件一覧に戻る
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">{project.title} PR案件オリエンシート</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 text-xs shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="font-extrabold text-slate-900 text-sm mb-3">案件基本仕様</h2>
              <dl className="grid grid-cols-3 gap-y-3">
                <dt className="font-bold text-slate-500">投稿媒体</dt>
                <dd className="col-span-2 font-bold text-slate-800">{project.platform}</dd>

                <dt className="font-bold text-slate-500">報酬金額</dt>
                <dd className="col-span-2 font-bold text-indigo-600">{project.reward}円</dd>

                <dt className="font-bold text-slate-500">募集期間</dt>
                <dd className="col-span-2 text-slate-700">{project.recruitmentPeriod || "随時募集"}</dd>

                <dt className="font-bold text-slate-500">投稿完了期限</dt>
                <dd className="col-span-2 text-slate-700">{project.postingPeriod || "採用後に指定"}</dd>

                <dt className="font-bold text-slate-500">募集人数</dt>
                <dd className="col-span-2 text-slate-700">{project.recruitingCount || "若干名"}</dd>
              </dl>
            </div>

            {project.summary && (
              <div className="border-b border-slate-100 pb-4 space-y-1.5">
                <h3 className="font-bold text-slate-900">【概要・ブランド紹介】</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{project.summary}</p>
              </div>
            )}

            {project.requiredCuts && (
              <div className="border-b border-slate-100 pb-4 space-y-1.5">
                <h3 className="font-bold text-slate-900">【必須撮影カット・撮影シーン】</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{project.requiredCuts}</p>
              </div>
            )}

            {project.captionRules && (
              <div className="border-b border-slate-100 pb-4 space-y-1.5">
                <h3 className="font-bold text-slate-900">【キャプション記載指定内容】</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{project.captionRules}</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <span className="font-bold text-slate-900 block mb-1">【指定ハッシュタグ】</span>
                <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono text-slate-700">
                  {project.hashtags || "指定なし"}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-900 block mb-1">【指定メンション】</span>
                <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono text-slate-700">
                  {project.mention || "指定なし"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm sticky top-6">
              {project.coverImage && (
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="w-full h-48 object-cover rounded-xl border border-slate-100"
                />
              )}
              <div>
                <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded text-[10px] font-bold">
                  {project.platform}
                </span>
                <h2 className="text-base font-extrabold text-slate-900 mt-1">{project.title}</h2>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-bold">報酬</span>
                <span className="text-lg font-extrabold text-indigo-600">{project.reward}円</span>
              </div>

              {isApplied ? (
                <div className="space-y-2">
                  <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold py-2.5 rounded-xl text-center text-xs">
                    ✓ 既に応募済みです
                  </div>
                  <Link
                    href="/mypage"
                    className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-center text-xs transition"
                  >
                    マイページで選考・進捗状況を確認 ➔
                  </Link>
                </div>
              ) : (
                <Link
                  href={`/apply?projectId=${project.id}`}
                  className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-center text-xs transition shadow-sm"
                >
                  この案件に応募する
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}