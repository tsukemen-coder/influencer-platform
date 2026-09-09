export type PlatformType = "Instagram" | "TikTok" | "YouTube";
export type ProjectPublishStatus = "draft" | "active" | "closed";

// 選考ステータス
export type SelectionStatus = "pending" | "approved" | "rejected";

// 採用後の進行ステップ
export type ProgressStep = 
  | "applied"            // 応募完了
  | "draft_preparing"    // 下書き作成中
  | "draft_submitted"    // 下書き提出済（AIチェック通過済）
  | "draft_approved"     // 下書き承認済（投稿OK）
  | "posted"             // 投稿URL提出済
  | "completed";         // 承認・報酬確定

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  snsAccount: string;
  avatarUrl?: string;
  lineUserId?: string;
}

export interface Project {
  id: string;
  title: string;
  platform: PlatformType;
  reward: string;
  status: ProjectPublishStatus;
  details?: string;
  createdAt?: any;
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

export interface AICheckResult {
  isPassed: boolean;
  score: number; // 100点満点評価
  missingHashtags: string[];
  missingMentions: string[];
  feedback: string[];
  rawAnalysis: string;
}

export interface Application {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  email: string;
  snsAccount: string;
  status: SelectionStatus;
  progressStep?: ProgressStep;
  
  // 下書き・成果物関連
  draftText?: string;
  draftImages?: string[];
  aiCheckResult?: AICheckResult;
  postUrl?: string;
  
  appliedAt: any;
  updatedAt?: any;
}