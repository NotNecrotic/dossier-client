export const WorkspaceState = {
  WELCOME: "WELCOME",
  VIDEO: "VIDEO",
  SEARCH: "SEARCH",
  TRANSCRIPT: "TRANSCRIPT",
  TIMELINE: "TIMELINE",
  SUMMARY: "SUMMARY",
  PROCESSING: "PROCESSING",
  SETUP: "SETUP",
  ERROR: "ERROR",
  DIAGNOSTICS: "DIAGNOSTICS",
  GALLERY: "GALLERY",
  BOOKMARKS: "BOOKMARKS",
  METADATA: "METADATA",
} as const;

export type WorkspaceState =
  (typeof WorkspaceState)[keyof typeof WorkspaceState];

export interface VideoItem {
  id: string;
  name: string;
  path: string;
  type: "file";
  status?: string;
}

export interface QueryKeypoint {
  fingerprint: string;
  start: number;
  end: number;
  text: string;
  reason: string;
  filePath: string;
}

export interface QueryResponse {
  answer: string;
  keypoints: QueryKeypoint[];
}
