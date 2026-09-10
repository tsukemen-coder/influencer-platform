export type SelectionStatus = "pending" | "approved" | "rejected";

export type ProgressStep =
  | "applied"
  | "draft_preparing"
  | "draft_submitted"
  | "draft_approved"
  | "posted"
  | "completed";

export type ProjectPublishStatus = "draft" | "published" | "closed" | "active" | string;

export interface AICheckResult {
  score: number;
  isPassed: boolean;
  feedback: string[];
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  snsAccount: string;
  avatarUrl?: string;
}

export interface Application {
  id: string;
  projectId: string;
  projectTitle?: string;
  userId: string;
  name: string;
  email: string;
  snsAccount: string;
  status: SelectionStatus;
  progressStep: ProgressStep;
  draftText?: string;
  draftMediaUrls?: string[];
  aiCheckResult?: AICheckResult;
  postUrl?: string;
  appliedAt: any;
  updatedAt?: any;
}

export interface Project {
  id: string;
  title: string;
  platform: "Instagram" | "TikTok" | "YouTube" | string;
  reward: number | string;
  status: ProjectPublishStatus;
  description?: string;
  summary?: string;
  postingPeriod?: string;
  recruitmentPeriod?: string;
  capacity?: number | string;
  recruitingCount?: number | string;
  requiredCuts?: string;
  captionRules?: string;
  hashtags?: string;
  mention?: string;
  coverImage?: string;
  requirements?: string;
  isPublic?: boolean;
  createdAt?: any;
  updatedAt?: any;
}