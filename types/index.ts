export type PlatformType = "Instagram" | "TikTok" | "YouTube";
export type ProjectPublishStatus = "draft" | "active" | "closed";

// 既存コンポーネントで参照されている型エイリアスを定義
export type SelectionStatus = "pending" | "approved" | "rejected";
export type ProgressStep = "drafting" | "submitted" | "completed";

export interface Project {
  id: string;
  title: string;
  platform: PlatformType;
  reward: string;
  status: ProjectPublishStatus;
  details?: string;
  createdAt?: any;
  // オリエンシート用オプショナルフィールド
  coverImage?: string;
  recruitmentPeriod?: string;
  postingPeriod?: string;
  summary?: string;
  requiredCuts?: string;
  captionRules?: string;
  hashtags?: string;
  mention?: string;
  recruitingCount?: string;
}

export interface Application {
  id: string;
  projectId: string;
  name: string;
  email: string;
  snsAccount: string;
  status: SelectionStatus;
  progressStep?: ProgressStep;
  postUrl?: string;
  appliedAt: any;
}