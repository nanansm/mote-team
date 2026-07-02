import type { TaskStatus, TypeContent } from "@/lib/task-meta";

export type Assignee = { id: string; name: string };

export type TaskRow = {
  id: string;
  title: string;
  status: TaskStatus;
  clientId: string;
  clientName: string;
  brandColor: string | null;
  parentId: string | null;
  dueDate: string | null;
  postingDate: string | null;
  typeContent: TypeContent | null;
  caption: string | null;
  linkMateri: string | null;
  linkOutput: string | null;
  linkIg: string | null;
  linkTiktok: string | null;
  mediaUrl: string | null;
  assignees: Assignee[];
};

export type ClientOption = { id: string; name: string };
export type MemberOption = { id: string; name: string };
