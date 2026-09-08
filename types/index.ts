export type ProjectPublishStatus = "draft" | "active" | "closed";

export interface Project {
  id: string;
  title: string;
  platform: string;
  reward: string;
  status: ProjectPublishStatus;
  details?: string;
  createdAt?: any;
}

export type SelectionStatus = "pending" | "approved" | "rejected";
export type ProgressStep = "drafting" | "reviewing" | "scheduled" | "completed";

export interface Application {
  id: string;
  projectId: string;
  name: string;
  email: string;
  snsAccount?: string;
  status?: SelectionStatus;
  progressStep?: ProgressStep;
  appliedAt?: any;
}