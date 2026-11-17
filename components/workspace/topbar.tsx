"use client";

import * as React from "react";
import {
  ChevronRight,
  Clock3,
  Ellipsis,
  Menu,
  MessageSquare,
  PanelLeftOpen,
  Share2,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PageSummary, WorkspacePage } from "@/lib/seed";
import { cn, formatRelativeDate } from "@/lib/utils";

type TopbarProps = {
  page: WorkspacePage | null;
  pages: PageSummary[];
  sidebarCollapsed: boolean;
  onExpandSidebar: () => void;
  onOpenMobileNav: () => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
  onOpenAssistant: () => void;
  onOpenComments: () => void;
  onOpenHistory: () => void;
  onDuplicatePage: () => void;
  onMoveTo: () => void;
  onMoveToTrash: () => void;
  onCopyLink: () => void;
};

export function Topbar({
  page,
  pages,
  sidebarCollapsed,
  onExpandSidebar,
  onOpenMobileNav,
  onToggleFavorite,
  onOpenAssistant,
  onOpenComments,
  onOpenHistory,
  onDuplicatePage,
  onMoveTo,
  onMoveToTrash,
  onCopyLink,
}: TopbarProps) {
  const parent = page?.parentId ? pages.find((item) => item.id === page.parentId) : undefined;

  return (
    <header className="flex h-[45px] shrink-0 items-center gap-1 border-b border-border bg-white px-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="subtle"
            size="icon"
            className="md:hidden"
            onClick={onOpenMobileNav}
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Open navigation</TooltipContent>
      </Tooltip>
      {sidebarCollapsed && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="subtle" size="icon" onClick={onExpandSidebar} aria-label="Expand sidebar">
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Expand sidebar</TooltipContent>
        </Tooltip>
      )}

      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-0.5 text-[14px]">
        <span className="hidden shrink-0 truncate px-1.5 py-1 text-muted-foreground sm:inline">Acme workspace</span>
        {parent && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <span className="hidden max-w-40 shrink-0 truncate px-1.5 py-1 text-muted-foreground md:inline">
              {parent.title}
            </span>
          </>
        )}
        <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground/60", !parent && "hidden sm:block")} />
        <span className="flex min-w-0 items-center gap-1.5 rounded-[4px] px-1.5 py-1 font-medium hover:bg-accent">
          <span className="text-[15px] leading-none">{page?.icon ?? "📄"}</span>
          <span className="truncate">{page?.title ?? "Untitled"}</span>
        </span>
      </nav>

      <div className="flex shrink-0 items-center gap-0.5">
        {page && (
          <span className="mr-2 hidden text-[12px] text-muted-foreground lg:inline">
            Edited {formatRelativeDate(page.updatedAt)}
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="hidden text-[13px] text-muted-foreground sm:inline-flex"
          onClick={onOpenComments}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Comments</span>
        </Button>
        <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground" onClick={onCopyLink}>
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Share</span>
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="subtle" size="icon" aria-label="Page history" onClick={onOpenHistory}>
              <Clock3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Page history</TooltipContent>
        </Tooltip>
        {page && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="subtle"
                size="icon"
                aria-label={page.favorite ? "Remove from favorites" : "Add to favorites"}
                onClick={() => onToggleFavorite(page.id, !page.favorite)}
              >
                <Star className={cn("h-4 w-4", page.favorite && "fill-current text-[#d9a441]")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{page.favorite ? "Remove favorite" : "Add to favorites"}</TooltipContent>
          </Tooltip>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="subtle" size="icon" aria-label="More page options">
              <Ellipsis className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onSelect={onCopyLink}>Copy link</DropdownMenuItem>
            <DropdownMenuItem onSelect={onDuplicatePage}>Duplicate page</DropdownMenuItem>
            <DropdownMenuItem onSelect={onMoveTo}>Move to…</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onSelect={onMoveToTrash}>
              Move to trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          className="ml-1 gap-1.5 border-[#e5d9f7] bg-[#faf7ff] px-2.5 text-[#7b4fd1] hover:bg-[#f2ebff]"
          onClick={onOpenAssistant}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ask AI</span>
        </Button>
      </div>
    </header>
  );
}
