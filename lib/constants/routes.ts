export const ROUTES = {
  workspace: "/",
  home: "/home",
  inbox: "/inbox",
  favorites: "/favorites",
  search: "/search",
  updates: "/updates",
  trash: "/trash",
  settings: "/settings",
  help: "/help",
  ai: "/ai",
  comments: "/comments",
  profile: "/profile",
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const;

export const TEAM_ROUTES = {
  product: "/teams/product",
  engineering: "/teams/engineering",
  marketing: "/teams/marketing",
} as const;

export function workspacePageHref(pageId: string) {
  return `${ROUTES.workspace}?page=${encodeURIComponent(pageId)}`;
}

export function updatesHref(pageId?: string) {
  return pageId ? `${ROUTES.updates}?page=${encodeURIComponent(pageId)}` : ROUTES.updates;
}
