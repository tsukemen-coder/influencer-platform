"use client";

import { useState } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Application, AICheckResult } from "@/types";

interface ApplicationStatusTrackerProps {
  application: Application;
  onRefresh: () => void;
}

export default function ApplicationStatusTracker({ application, onRefresh }: ApplicationStatusTrackerProps) {
  const [draftText, setDraftText] = useState(application.draftText || "");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(application.draftMediaUrls || []);
  const [uploading, setUploading] = useState(false);
  const [aiChecking, setAiChecking] = useState(false);
  const [postUrlInput, setPostUrlInput] = useState(application.postUrl || "");

  // ファイル選択ハンドラー
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);

      // ローカルプレビュー生成
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  // AIチェック & 提出処理
  const handleSubmitDraft = async () => {
    if (!draftText.trim()) {
      alert("キャプションを入力してください。");
      return;
    }

    try {
      setUploading(true);
      setAiChecking(true);

      // 1. AIチェックの実行
      const aiRes = await fetch("/api/check-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: application.projectId,
          draftText,
        }),
      });
      const aiData = await aiRes.json();
      const aiResult: AICheckResult = aiData.result || { score: 100, isPassed: true, feedback: [] };

      // 2. 新規追加されたファイルの Firebase Storage アップロード
      const uploadedMediaUrls: string[] = [...(application.draftMediaUrls || [])];

      for (const file of selectedFiles) {
        const storageRef = ref(storage, `drafts/${application.id}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        uploadedMediaUrls.push(downloadUrl);
      }

      // 3. Firestoreのアップデート
      await updateDoc(doc(db, "applications", application.id), {
        draftText,
        draftMediaUrls: uploadedMediaUrls,
        aiCheckResult: aiResult,
        progressStep: "draft_submitted",
        updatedAt: new Date(),
      });

      alert("下書き（キャプション・メディア）を提出しました！");
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("提出に失敗しました。もう一度お試しください。");
    } finally {
      setUploading(false);
      setAiChecking(false);
    }
  };

  // 投稿完了URL提出処理
  const handleSubmitPostUrl = async () => {
    if (!postUrlInput.trim()) return;
    try {
      setUploading(true);
      await updateDoc(doc(db, "applications", application.id), {
        postUrl: postUrlInput,
        progressStep: "posted",
        updatedAt: new Date(),
      });
      alert("投稿URLを報告しました！");
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("報告に失敗しました。");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 text-xs">
      {/* 進捗ステータスバー */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-slate-400 font-bold block text-[10px]">現在のステータス</span>
          <span className="text-sm font-extrabold text-indigo-600">
            {application.progressStep === "applied" && "選考中"}
            {application.progressStep === "draft_preparing" && "下書き作成・提出待ち"}
            {application.progressStep === "draft_submitted" && "下書き確認中（管理者承認待ち）"}
            {application.progressStep === "draft_approved" && "下書き承認済み（SNS投稿を行ってください）"}
            {application.progressStep === "posted" && "投稿完了報告済み"}
            {application.progressStep === "completed" && "全行程完了"}
          </span>
        </div>
      </div>

      {/* 下書き提出エリア（採択後 / 下書き修正時） */}
      {(application.progressStep === "draft_preparing" || application.progressStep === "draft_submitted") && (
        <div className="space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm">下書き提出（キャプション ＆ メディア）</h4>

          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">① 投稿キャプション文章</label>
            <textarea
              rows={5}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="投稿予定の本文を入力（AIがハッシュタグ等を自動判定します）"
              className="w-full border border-slate-200 rounded-xl p-3 focus:outline-indigo-500 font-mono"
            />
          </div>

          <div className="space-y-2">
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

          <button
            onClick={handleSubmitDraft}
            disabled={uploading || aiChecking}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-sm disabled:bg-slate-300"
          >
            {aiChecking ? "🤖 AI診断 ＆ メディア送信中..." : "AIチェックを通して下書きを提出する"}
          </button>
        </div>
      )}

      {/* 投稿URL報告エリア（下書き承認後） */}
      {application.progressStep === "draft_approved" && (
        <div className="space-y-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
          <h4 className="font-bold text-emerald-900">🎉 下書きが承認されました！SNSに投稿して報告してください</h4>
          <input
            type="url"
            value={postUrlInput}
            onChange={(e) => setPostUrlInput(e.target.value)}
            placeholder="https://www.instagram.com/p/..."
            className="w-full border border-slate-200 rounded-xl p-2.5 bg-white"
          />
          <button
            onClick={handleSubmitPostUrl}
            disabled={uploading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition"
          >
            投稿報告を完了する
          </button>
        </div>
      )}
    </div>
  );
}