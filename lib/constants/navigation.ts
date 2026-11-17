import {
  Bot,
  CircleHelp,
  Clock3,
  Home,
  Inbox,
  Search,
  Settings,
  Sparkles,
  Star,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ROUTES, TEAM_ROUTES } from "@/lib/constants/routes";
import { TEAMS } from "@/lib/constants/teams";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const PRIMARY_NAV: readonly NavigationItem[] = [
  { label: "Home", href: ROUTES.home, icon: Home },
  { label: "Inbox", href: ROUTES.inbox, icon: Inbox, badge: "3" },
  { label: "Favorites", href: ROUTES.favorites, icon: Star },
  { label: "Search", href: ROUTES.search, icon: Search },
] as const;

export const WORKSPACE_TOOLS: readonly NavigationItem[] = [
  { label: "Ask workspace AI", href: ROUTES.ai, icon: Sparkles },
  { label: "Comments", href: ROUTES.comments, icon: Bot },
] as const;

export const TEAM_NAV: readonly NavigationItem[] = TEAMS.map((team) => ({
  label: team.name,
  href: TEAM_ROUTES[team.slug],
  icon: Users,
}));

export const FOOTER_NAV: readonly NavigationItem[] = [
  { label: "Updates", href: ROUTES.updates, icon: Clock3 },
  { label: "Trash", href: ROUTES.trash, icon: Trash2 },
  { label: "Help & support", href: ROUTES.help, icon: CircleHelp },
  { label: "Settings & members", href: ROUTES.settings, icon: Settings },
] as const;
