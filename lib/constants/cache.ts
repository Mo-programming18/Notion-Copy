export const CACHE = {
  pagePrefix: "nw:page:v1:",
  pageListKey: "nw:page-list:v1",
  commentsPrefix: "nw:comments:v1:",
  settingsKey: "nw:settings:v1",
  aiModelKey: "nw:ai-model:v1",
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: 1000 * 60 * 60,
  listCacheSeconds: 30,
} as const;

export const QUERY_KEYS = {
  pageList: (query = "") => ["pages", query] as const,
  page: (id: string) => ["page", id] as const,
  trashedPages: ["pages", "trash"] as const,
  workspaceOverview: ["workspace", "overview"] as const,
  inbox: ["workspace", "inbox"] as const,
  activity: ["workspace", "activity"] as const,
} as const;
