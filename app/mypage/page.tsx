"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/lib/useAuth";
import { Application, Project, AICheckResult } from "@/types";
import Container from "@/components/layout/Container";

interface JoinedApp extends Application {
  project?: Project;
}

function MyPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // URLパラメータからのトークン取得

  const [apps, setApps] = useState<JoinedApp[]>([]);
  const [loading, setLoading] = useState(true);

  // 下書きモーダル用
  const [selectedApp, setSelectedApp] = useState<JoinedApp | null>(null);
  const [draftText, setDraftText] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [aiResult, setAiResult] = useState<AICheckResult | null>(null);

  // メディア添付用（追加）
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchUserApplications = async () => {
    try {
      setLoading(true);
      let q;

      // ログイン中なら Auth UID、それ以外でトークンがあればトークンでデータ取得（端末またぎ対応）
      if (user?.uid) {
        q = query(collection(db, "applications"), where("userId", "==", user.uid));
      } else if (token) {
        q = query(collection(db, "applications"), where("token", "==", token));
      } else {
        setApps([]);
        setLoading(false);
        return;
      }

      const snap = await getDocs(q);
      const list: JoinedApp[] = [];

      for (const d of snap.docs) {
        const appData = { id: d.id, ...d.data() } as Application;
        let projectData: Project | undefined = undefined;

        if (appData.projectId) {
          const pSnap = await getDoc(doc(db, "projects", appData.projectId));
          if (pSnap.exists()) {
            projectData = { id: pSnap.id, ...pSnap.data() } as Project;
          }
        }
        list.push({ ...appData, project: projectData });
      }

      setApps(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserApplications();
  }, [user, token]);

  // 画像・動画ファイル選択処理（追加）
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  // AIチェックの実行
  const handleAICheck = async () => {
    if (!draftText.trim() || !selectedApp?.project) return;
    setChecking(true);
    setAiResult(null);

    try {
      const res = await fetch("/api/check-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftText,
          project: selectedApp.project,
        }),
      });

      const data = await res.json();
      setAiResult(data.result || data);
    } catch (e) {
      console.error(e);
      alert("AI診断中にエラーが発生しました。");
    } finally {
      setChecking(false);
    }
  };

  // 下書き保存 ＆ 画像・動画アップロード処理（拡張）
  const handleSaveDraft = async () => {
    if (!selectedApp || !aiResult) return;
    try {
      setUploading(true);

      // Firebase Storageへ新規ファイルを保存
      const uploadedMediaUrls: string[] = [...(selectedApp.draftMediaUrls || [])];
      for (const file of selectedFiles) {
        const storageRef = ref(storage, `drafts/${selectedApp.id}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        uploadedMediaUrls.push(downloadUrl);
      }

      await updateDoc(doc(db, "applications", selectedApp.id), {
        draftText,
        draftMediaUrls: uploadedMediaUrls, // 追加した画像・動画URLを更新
        aiCheckResult: aiResult,
        progressStep: "draft_submitted",
        updatedAt: new Date(),
      });

      alert("下書き（文章・画像データ）とAI診断結果を提出しました！");
      setSelectedApp(null);
      setSelectedFiles([]);
      setPreviewUrls([]);
      await fetchUserApplications();
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました。");
    } finally {
      setUploading(false);
    }
  };

  // 成果物URL（投稿URL）の提出
  const handleSubmitPostUrl = async (appId: string) => {
    if (!postUrl) return;
    try {
      await updateDoc(doc(db, "applications", appId), {
        postUrl,
        progressStep: "posted",
        updatedAt: new Date(),
      });
      alert("投稿完了URLを提出しました！");
      setPostUrl("");
      await fetchUserApplications();
    } catch (e) {
      console.error(e);
      alert("提出に失敗しました。");
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">マイページ（応募・進捗管理）</h1>
            <p className="text-xs text-slate-500 mt-1">ご自身の選考結果や下書きの提出状況を確認・管理できます。</p>
          </div>
          {user && (
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
              <span className="font-bold text-slate-700">{user.displayName}</span>
              <span className="text-slate-400">({user.snsAccount})</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">読み込み中...</div>
        ) : apps.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-xs text-slate-400">該当する応募情報が見つかりません。</p>
            <Link
              href="/projects"
              className="inline-block bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
            >
              募集中の案件を探す ➔
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded text-[10px] font-bold">
                      {app.project?.platform || "SNS"}
                    </span>
                    <h2 className="text-base font-extrabold text-slate-900 mt-1">
                      {app.project?.title || "案件情報"}
                    </h2>
                    <p className="text-indigo-600 font-bold mt-0.5">報酬: {app.project?.reward}円</p>
                  </div>

                  {/* 選考ステータス表示 */}
                  <div>
                    {app.status === "pending" && (
                      <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-[11px]">
                        選考中
                      </span>
                    )}
                    {app.status === "approved" && (
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-[11px]">
                        採択（採用）
                      </span>
                    )}
                    {app.status === "rejected" && (
                      <span className="bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full text-[11px]">
                        見送り
                      </span>
                    )}
                  </div>
                </div>

                {/* 採択済みの場合の進行フェーズ */}
                {app.status === "approved" && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">現在の進捗フェーズ:</span>
                      <span className="font-bold text-indigo-600">
                        {app.progressStep === "applied" && "1. 選考通過（下書き準備）"}
                        {app.progressStep === "draft_submitted" && "2. 下書きAIチェック完了・提出済"}
                        {app.progressStep === "draft_approved" && "3. 下書き承認済（投稿OK）"}
                        {app.progressStep === "posted" && "4. 投稿完了URL提出済（確認中）"}
                        {app.progressStep === "completed" && "5. 全工程完了（報酬確定）"}
                      </span>
                    </div>

                    {/* アクションボタン */}
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setDraftText(app.draftText || "");
                          setAiResult(app.aiCheckResult || null);
                          setPreviewUrls(app.draftMediaUrls || []);
                          setSelectedFiles([]);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition"
                      >
                        🤖 AI下書き自動チェック＆提出
                      </button>

                      {app.progressStep === "draft_approved" && (
                        <div className="flex gap-2 items-center flex-1">
                          <input
                            type="text"
                            placeholder="https://www.instagram.com/p/..."
                            value={postUrl}
                            onChange={(e) => setPostUrl(e.target.value)}
                            className="border border-slate-300 rounded-lg p-2 flex-1 focus:outline-indigo-500"
                          />
                          <button
                            onClick={() => handleSubmitPostUrl(app.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition whitespace-nowrap"
                          >
                            投稿完了URLを提出
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* AIチェック＆下書きモーダル */}
        {selectedApp && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 shadow-xl text-xs">
              <h2 className="text-base font-bold text-slate-900">
                AI下書き事前チェック（{selectedApp.project?.title}）
              </h2>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <p className="font-bold text-slate-700">【必須ハッシュタグ】 {selectedApp.project?.hashtags}</p>
                <p className="font-bold text-slate-700">【必須メンション】 {selectedApp.project?.mention}</p>
              </div>

              {/* キャプション入力 */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">① 投稿用キャプション・下書き本文</label>
                <textarea
                  rows={6}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="ここに投稿用のテキストを入力してください..."
                  className="w-full border border-slate-300 rounded-lg p-3 focus:outline-indigo-500 font-mono"
                />
              </div>

              {/* 画像・動画添付（追加部分） */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="font-bold text-slate-700 block">② 投稿予定の画像・動画を添付</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="block w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                />

                {/* プレビュー表示 */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={handleAICheck}
                  disabled={checking || !draftText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {checking ? "AIが診断中..." : "🤖 AIで要件モレ・誤りをチェック"}
                </button>
              </div>

              {/* AI結果表示 */}
              {aiResult && (
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    aiResult.isPassed
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  <div className="flex justify-between items-center font-bold">
                    <span>診断判定: {aiResult.isPassed ? "合格 (提出可能)" : "要改善"}</span>
                    <span>スコア: {aiResult.score} / 100点</span>
                  </div>

                  {aiResult.feedback?.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {aiResult.feedback.map((fb, idx) => (
                        <li key={idx}>{fb}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  閉じる
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={!aiResult || uploading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition disabled:opacity-50"
                >
                  {uploading ? "送信中..." : "下書きを管理者に提出"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}

export default function MyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">読み込み中...</div>}>
      <MyPageContent />
    </Suspense>
  );
}