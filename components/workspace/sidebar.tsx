"use client";

import * as React from "react";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  FileText,
  LogIn,
  LogOut,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  UserPlus,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  APP,
  ASSISTANT,
  DATA_SOURCE_LABELS,
  FOOTER_NAV,
  PRIMARY_NAV,
  ROUTES,
  TEAM_NAV,
} from "@/lib/constants";
import type { NavigationItem } from "@/lib/constants";
import { signOut, useSession } from "@/lib/auth-client";
import { avatarForIdentity } from "@/lib/avatar";
import type { PageSummary } from "@/lib/seed";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "./hooks";

type SidebarProps = {
  pages: PageSummary[];
  selectedId: string | null;
  source: "postgres" | "seed";
  activeHref?: string;
  onSelectPage: (id: string) => void;
  onOpenCommand: () => void;
  onOpenAssistant: () => void;
  onCollapse: () => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
  onCreatePage: () => void;
};

function SectionLabel({
  label,
  open,
  onToggle,
  onAdd,
}: {
  label: string;
  open: boolean;
  onToggle?: () => void;
  onAdd?: () => void;
}) {
  return (
    <div className="group/section mt-4 flex h-7 items-center gap-1 rounded-[4px] pl-1 pr-1 text-[12px] font-semibold text-muted-foreground">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-5 w-5 items-center justify-center rounded hover:bg-sidebar-hover"
        aria-label={open ? `Collapse ${label}` : `Expand ${label}`}
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      <button type="button" onClick={onToggle} className="flex-1 text-left hover:text-foreground">
        {label}
      </button>
      {onAdd && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onAdd}
              className="flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity hover:bg-sidebar-hover group-hover/section:opacity-100 focus:opacity-100"
              aria-label={`Add page to ${label}`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Add a page</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function NavLink({
  item,
  activeHref,
  onNavigate,
}: {
  item: NavigationItem;
  activeHref?: string;
  onNavigate?: () => void;
}) {
  const Icon: LucideIcon = item.icon;
  const active = activeHref === item.href;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex h-8 w-full items-center gap-2 rounded-[4px] px-2 text-[14px] transition-colors hover:bg-sidebar-hover",
        active && "bg-sidebar-active font-medium",
      )}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge && (
        <span className="ml-auto rounded-full bg-[#2383e2] px-1.5 text-[10px] font-semibold leading-4 text-white">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function UserFooter() {
  const session = useSession();
  const user = session.data?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-left transition-colors hover:bg-sidebar-hover"
        >
          {user ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image || avatarForIdentity(user.email ?? user.name)}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 shrink-0 rounded-full border border-border bg-white object-cover"
            />
          ) : (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-[#f7f7f5] text-muted-foreground">
              <UserRound className="h-3.5 w-3.5" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-sidebar-foreground">
              {user?.name ?? "Guest"}
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">
              {user?.email ?? "Free plan"}
            </span>
          </span>
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-60">
        <DropdownMenuLabel>{user?.email ?? "Guest workspace"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROUTES.profile}>
            <UserRound /> Profile & avatar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTES.settings}>
            <Settings /> Settings & members
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem onSelect={() => void signOut()}>
            <LogOut /> Sign out
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.signIn}>
                <LogIn /> Sign in
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.signUp}>
                <UserPlus /> Create account
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Sidebar({
  pages,
  selectedId,
  source,
  activeHref,
  onSelectPage,
  onOpenCommand,
  onOpenAssistant,
  onCollapse,
  onToggleFavorite,
  onCreatePage,
}: SidebarProps) {
  const [search, setSearch] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [privateOpen, setPrivateOpen] = React.useState(true);
  const [teamOpen, setTeamOpen] = React.useState(true);
  const debouncedSearch = useDebouncedValue(search, 160);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return term ? pages.filter((page) => page.title.toLowerCase().includes(term)) : pages;
  }, [pages, debouncedSearch]);

  const favorites = React.useMemo(() => pages.filter((page) => page.favorite).slice(0, 7), [pages]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual intentionally returns stable imperative helpers.
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 30,
    overscan: 12,
  });

  React.useEffect(() => {
    virtualizer.measure();
  }, [filtered.length, virtualizer]);

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-[45px] shrink-0 items-center gap-1 px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-[4px] px-1.5 py-1 text-left transition-colors hover:bg-sidebar-hover"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] bg-[#37352f] text-[13px] font-semibold text-white">
                {APP.monogram}
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{APP.name}</span>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>{APP.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={ROUTES.settings}>
                <Settings /> Settings & members
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`${ROUTES.settings}?tab=members`}>
                <Users /> Invite people
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.ai}>
                <Sparkles /> AI features
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="subtle" size="icon" onClick={onCollapse} aria-label="Collapse sidebar">
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Collapse sidebar</TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-0.5 px-2 pb-1">
        <div className="flex h-8 w-full items-center gap-2 rounded-[4px] px-2 text-[14px] text-sidebar-foreground transition-colors hover:bg-sidebar-hover">
          <button
            type="button"
            onClick={() => setSearchOpen((value) => !value)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <span>Search</span>
          </button>
          <button
            type="button"
            onClick={onOpenCommand}
            className="rounded-[3px] border border-border bg-white px-1 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground"
          >
            ⌘K
          </button>
        </div>
        {searchOpen && (
          <Input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter pages…"
            className="mb-1 h-7 border-transparent bg-white/80 text-[13px] shadow-none"
          />
        )}
        <button
          type="button"
          onClick={onOpenAssistant}
          className="flex h-8 w-full items-center gap-2 rounded-[4px] px-2 text-[14px] text-sidebar-foreground transition-colors hover:bg-sidebar-hover"
        >
          <Sparkles className="h-4 w-4 text-[#9b6dff]" />
          <span className="flex-1 text-left">Ask {ASSISTANT.shortName}</span>
        </button>
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} activeHref={activeHref} />
        ))}
      </div>

      {favorites.length > 0 && (
        <div className="px-2">
          <SectionLabel label="Favorites" open onToggle={() => undefined} />
          {favorites.map((page) => (
            <div key={`fav-${page.id}`} className="group/item flex h-[30px] items-center">
              <button
                type="button"
                onClick={() => onSelectPage(page.id)}
                className={cn(
                  "flex h-full min-w-0 flex-1 items-center gap-2 rounded-[4px] px-2 text-left text-[14px] transition-colors hover:bg-sidebar-hover",
                  selectedId === page.id && "bg-sidebar-active font-medium",
                )}
              >
                <span className="w-4 shrink-0 text-center text-[14px] leading-none">{page.icon}</span>
                <span className="truncate">{page.title}</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleFavorite(page.id, false)}
                className="mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 hover:bg-sidebar-hover group-hover/item:opacity-100"
                aria-label={`Remove ${page.title} from favorites`}
              >
                <Star className="h-3.5 w-3.5 fill-current text-[#d9a441]" />
              </button>
            </div>
          ))}
          <Link
            href={ROUTES.favorites}
            className="flex h-7 items-center rounded-[4px] px-2 text-[12px] text-muted-foreground hover:bg-sidebar-hover hover:text-foreground"
          >
            See all favorites
          </Link>
        </div>
      )}

      <div className="mt-1 flex min-h-0 flex-1 flex-col px-2">
        <SectionLabel
          label={debouncedSearch ? `Results (${filtered.length})` : "Private"}
          open={privateOpen}
          onToggle={() => setPrivateOpen((value) => !value)}
          onAdd={onCreatePage}
        />
        {privateOpen && (
          <div ref={scrollRef} className="notion-scroll min-h-0 flex-1 overflow-y-auto">
            <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const page = filtered[virtualRow.index];
                if (!page) return null;
                return (
                  <div
                    key={page.id}
                    className="group/item absolute left-0 top-0 flex w-full items-center"
                    style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectPage(page.id)}
                      className={cn(
                        "flex h-full min-w-0 flex-1 items-center gap-2 rounded-[4px] pr-1 text-left text-[14px] transition-colors hover:bg-sidebar-hover",
                        page.parentId ? "pl-5" : "pl-2",
                        selectedId === page.id && "bg-sidebar-active font-medium",
                      )}
                    >
                      <span className="w-4 shrink-0 text-center text-[14px] leading-none">{page.icon}</span>
                      <span className="truncate">{page.title}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(page.id, !page.favorite)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 hover:bg-sidebar-hover group-hover/item:opacity-100 focus:opacity-100"
                      aria-label={page.favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star className={cn("h-3.5 w-3.5", page.favorite && "fill-current text-[#d9a441]")} />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="mr-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 hover:bg-sidebar-hover group-hover/item:opacity-100 focus:opacity-100"
                          aria-label={`More options for ${page.title}`}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem onSelect={() => onSelectPage(page.id)}>
                          <FileText /> Open page
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`${ROUTES.comments}?page=${encodeURIComponent(page.id)}`}>
                            <Users /> Comments
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onToggleFavorite(page.id, !page.favorite)}>
                          <Star /> {page.favorite ? "Remove favorite" : "Add to favorites"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <div className="px-3 py-6 text-center text-[13px] text-muted-foreground">
                No pages match “{debouncedSearch}”
              </div>
            )}
          </div>
        )}

        <SectionLabel label="Teamspaces" open={teamOpen} onToggle={() => setTeamOpen((value) => !value)} />
        {teamOpen && (
          <div className="space-y-0.5 pb-2">
            {TEAM_NAV.map((item) => (
              <NavLink key={item.href} item={item} activeHref={activeHref} />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border px-2 py-2">
        {FOOTER_NAV.map((item) => (
          <NavLink key={item.href} item={item} activeHref={activeHref} />
        ))}
        <div className="mt-1 border-t border-border pt-1">
          <UserFooter />
        </div>
        <p className="px-2 pt-1 text-[10px] text-muted-foreground/70">
          Data source: {DATA_SOURCE_LABELS[source]}
        </p>
      </div>
    </aside>
  );
}
