"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, PanelLeftOpen, Search, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  APP,
  ASSISTANT,
  FOOTER_NAV,
  PRIMARY_NAV,
  ROUTES,
  TEAM_NAV,
  workspacePageHref,
  type DataSource,
} from "@/lib/constants";
import type { NavigationItem } from "@/lib/constants";
import type { PageSummary } from "@/lib/seed";
import { useCreatePage, usePageList } from "@/components/workspace/hooks";
import { Sidebar } from "@/components/workspace/sidebar";

const CommandMenu = dynamic(
  () => import("@/components/workspace/command-menu").then((module) => module.CommandMenu),
  { ssr: false },
);

const ALL_NAV: readonly NavigationItem[] = [...PRIMARY_NAV, ...TEAM_NAV, ...FOOTER_NAV];

type SubpageShellProps = {
  initialPages: PageSummary[];
  initialSource: DataSource;
  children: React.ReactNode;
};

export function SubpageShell({ initialPages, initialSource, children }: SubpageShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);

  const pagesQuery = usePageList(initialPages, initialSource);
  const createPage = useCreatePage();
  const pages = pagesQuery.data?.pages ?? initialPages;
  const source = pagesQuery.data?.source ?? initialSource;
  const currentLabel = ALL_NAV.find((item) => item.href === pathname)?.label ?? "Workspace";

  function selectPage(id: string) {
    router.push(workspacePageHref(id));
    setMobileNavOpen(false);
  }

  function handleCreatePage() {
    createPage.mutate("Untitled", {
      onSuccess: (created) => selectPage(created.id),
    });
  }

  const sidebar = sidebarOpen ? (
    <Sidebar
      pages={pages}
      selectedId={null}
      source={source}
      activeHref={pathname}
      onSelectPage={selectPage}
      onOpenCommand={() => setCommandOpen(true)}
      onOpenAssistant={() => router.push(ROUTES.ai)}
      onCollapse={() => setSidebarOpen(false)}
      onToggleFavorite={() => undefined}
      onCreatePage={handleCreatePage}
    />
  ) : (
    <div className="flex h-full w-11 shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar py-2">
      <Button variant="subtle" size="icon" onClick={() => setSidebarOpen(true)} aria-label="Expand sidebar">
        <PanelLeftOpen className="h-4 w-4" />
      </Button>
      {ALL_NAV.slice(0, 7).map((item) => {
        const Icon = item.icon;
        const active = item.href === pathname;
        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Button
                variant={active ? "secondary" : "subtle"}
                size="icon"
                asChild
                aria-label={item.label}
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );

  return (
    <TooltipProvider delayDuration={250}>
      <div className="flex h-dvh w-full overflow-hidden bg-white">
        <div className="hidden h-full md:flex">{sidebar}</div>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation"
            />
            <div className="relative h-full shadow-notion-200">{sidebar}</div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[45px] shrink-0 items-center gap-1 border-b border-border bg-white px-3">
            <Button
              variant="subtle"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </Button>
            {!sidebarOpen && (
              <Button
                variant="subtle"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            )}
            <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-2 text-[14px]">
              <span className="hidden shrink-0 text-muted-foreground sm:inline">{APP.name}</span>
              <span className="text-muted-foreground/50">/</span>
              <span className="truncate font-medium">{currentLabel}</span>
            </nav>
            <Button variant="subtle" size="icon" onClick={() => setCommandOpen(true)} aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="subtle" size="icon" asChild aria-label={ASSISTANT.name}>
              <Link href={ROUTES.ai}>
                <Sparkles className="h-4 w-4 text-[#9b6dff]" />
              </Link>
            </Button>
            <Button variant="subtle" size="icon" asChild aria-label="Profile">
              <Link href={ROUTES.profile}>
                <UserRound className="h-4 w-4" />
              </Link>
            </Button>
          </header>

          <main className="notion-scroll flex-1 overflow-y-auto" aria-live="polite">
            <div className="mx-auto w-full max-w-[1120px] px-6 pb-24 pt-10 sm:px-10">{children}</div>
          </main>
        </div>
      </div>

      {commandOpen && (
        <CommandMenu
          pages={pages}
          onSelect={selectPage}
          onClose={() => setCommandOpen(false)}
          onOpenAssistant={() => router.push(ROUTES.ai)}
        />
      )}
    </TooltipProvider>
  );
}
