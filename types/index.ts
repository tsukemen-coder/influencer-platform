// 受注ステータス（ブランド側の確認状況）
export type SelectionStatus = "brand_review" | "accepted" | "rejected";

// 進捗ステータス（案件確定後の作業ステップ）
export type ProgressStatus = "drafting" | "reviewing" | "waiting_post" | "posted" | "completed";

// 案件自体の公開ステータス
export type ProjectPublishStatus = "active" | "draft" | "closed";

// 案件の型定義
export interface Project {
  id: string;
  title: string;
  platform: string;
  reward: string;
  status: ProjectPublishStatus;
  orientSheetUrl?: string;
  createdAt?: any;
}

// 応募データの型定義
export interface Application {
  id: string;
  projectId: string;
  projectTitle?: string;
  name: string;
  email: string;
  snsAccount: string;
  followerCount: string;
  note?: string;
  selectionStatus: SelectionStatus; // ブランド確認中 / 案件確定 / お見送り
  progressStatus?: ProgressStatus;  // 下書き作成中 / 確認中 / 投稿待ち / 投稿済み / 完了
  createdAt?: any;
}