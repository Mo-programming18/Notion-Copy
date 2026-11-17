import { LIMITS } from "@/lib/constants";
import type { DataSource } from "@/lib/constants";
import type { PageSummary } from "@/lib/seed";
import { getTeam, type TeamConfig } from "@/lib/constants";
import { getDataSourceStatus, listPages, listTrashedPages } from "@/lib/services/page-store";

export interface WorkspaceOverview {
  totalPages: number;
  favoriteCount: number;
  trashedCount: number;
  updatedToday: number;
  lastUpdatedAt: string | null;
  recentPages: PageSummary[];
  source: DataSource;
}

export interface ActivityItem {
  id: string;
  pageId: string;
  title: string;
  icon: string;
  action: "Edited" | "Favorited" | "Deleted";
  at: string;
}

export interface InboxItem {
  id: string;
  pageId: string;
  title: string;
  icon: string;
  message: string;
  at: string;
  unread: boolean;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export async function getWorkspaceOverview(): Promise<WorkspaceOverview> {
  const [pages, trashed] = await Promise.all([listPages(), listTrashedPages()]);

  return {
    totalPages: pages.length,
    favoriteCount: pages.filter((page) => page.favorite).length,
    trashedCount: trashed.length,
    updatedToday: pages.filter((page) => new Date(page.updatedAt).getTime() >= startOfToday()).length,
    lastUpdatedAt: pages[0]?.updatedAt ?? null,
    recentPages: pages.slice(0, LIMITS.recentPages),
    source: getDataSourceStatus(),
  };
}

export async function getActivity(pageId?: string): Promise<ActivityItem[]> {
  const [pages, trashed] = await Promise.all([listPages(), listTrashedPages()]);
  const active = pageId ? pages.filter((page) => page.id === pageId) : pages;

  const items: ActivityItem[] = [
    ...active.map((page) => ({
      id: `edit-${page.id}`,
      pageId: page.id,
      title: page.title,
      icon: page.icon,
      action: "Edited" as const,
      at: page.updatedAt,
    })),
    ...trashed
      .filter((page) => !pageId || page.id === pageId)
      .map((page) => ({
        id: `delete-${page.id}`,
        pageId: page.id,
        title: page.title,
        icon: page.icon,
        action: "Deleted" as const,
        at: page.deletedAt ?? page.updatedAt,
      })),
    ...active
      .filter((page) => page.favorite)
      .map((page) => ({
        id: `favorite-${page.id}`,
        pageId: page.id,
        title: page.title,
        icon: page.icon,
        action: "Favorited" as const,
        at: page.updatedAt,
      })),
  ];

  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, pageId ? 20 : 30);
}

export async function getInboxItems(): Promise<InboxItem[]> {
  const pages = await listPages();
  const favorites = pages.filter((page) => page.favorite).slice(0, 2);
  const recent = pages.slice(0, LIMITS.inboxItems);

  const items: InboxItem[] = [
    ...favorites.map((page) => ({
      id: `mention-${page.id}`,
      pageId: page.id,
      title: page.title,
      icon: page.icon,
      message: "You were mentioned in a comment on this favorite page.",
      at: page.updatedAt,
      unread: true,
    })),
    ...recent.map((page) => ({
      id: `update-${page.id}`,
      pageId: page.id,
      title: page.title,
      icon: page.icon,
      message: "This page was updated in your workspace.",
      at: page.updatedAt,
      unread: false,
    })),
  ];

  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, LIMITS.inboxItems);
}

export interface TeamOverview {
  team: TeamConfig;
  pages: PageSummary[];
}

export async function getTeamOverview(slug: string): Promise<TeamOverview | null> {
  const team = getTeam(slug);
  if (!team) return null;

  const pages = await listPages();
  const terms = team.searchTerms.map((term) => term.toLowerCase());
  const matches = pages.filter((page) => {
    const title = page.title.toLowerCase();
    return terms.some((term) => title.includes(term));
  });

  return { team, pages: matches.length ? matches.slice(0, 24) : pages.slice(0, 12) };
}
