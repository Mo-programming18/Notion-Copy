"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { FilePlus2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROUTES, updatesHref, workspacePageHref } from "@/lib/constants";
import type { PageSummary, WorkspacePage } from "@/lib/seed";
import { BlockEditor } from "./block-editor";
import {
  useCreatePage,
  usePage,
  usePageList,
  useTrashPage,
  useUpdatePage,
} from "./hooks";
import { MovePageDialog } from "./move-page-dialog";
import { AssistantSkeleton, PageSkeleton } from "./skeletons";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

/** Heavy, rarely-opened panels are loaded only when first requested. */
const AIAssistant = dynamic(() => import("./ai-assistant").then((module) => module.AIAssistant), {
  ssr: false,
  loading: () => <AssistantSkeleton />,
});

const CommandMenu = dynamic(() => import("./command-menu").then((module) => module.CommandMenu), {
  ssr: false,
});

type WorkspaceShellProps = {
  initialPages: PageSummary[];
  initialPage: WorkspacePage | null;
  initialSource: "postgres" | "seed";
};

export function WorkspaceShell({ initialPages, initialPage, initialSource }: WorkspaceShellProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(initialPage?.id ?? initialPages[0]?.id ?? null);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [assistantOpen, setAssistantOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [moveOpen, setMoveOpen] = React.useState(false);
  const router = useRouter();

  const pagesQuery = usePageList(initialPages, initialSource);
  const pageQuery = usePage(
    selectedId,
    selectedId === initialPage?.id ? initialPage : undefined,
  );
  const updatePage = useUpdatePage();
  const createPage = useCreatePage();
  const trashPage = useTrashPage();

  const pages = pagesQuery.data?.pages ?? initialPages;
  const source = pagesQuery.data?.source ?? "seed";
  const page = pageQuery.data ?? null;

  const writePageToUrl = React.useCallback((id: string | null) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("page", id);
    else url.searchParams.delete("page");
    window.history.replaceState(null, "", url);
  }, []);

  const selectPage = React.useCallback(
    (id: string) => {
      setSelectedId(id);
      writePageToUrl(id);
    },
    [writePageToUrl],
  );

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const modifier = event.metaKey || event.ctrlKey;
      if (!modifier) return;
      if (event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      } else if (event.key.toLowerCase() === "j") {
        event.preventDefault();
        setAssistantOpen((value) => !value);
      } else if (event.key === "\\") {
        event.preventDefault();
        setSidebarOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSave(patch: Partial<WorkspacePage>) {
    if (!selectedId) return;
    updatePage.mutate({ id: selectedId, patch });
  }

  function handleToggleFavorite(id: string, favorite: boolean) {
    updatePage.mutate({ id, patch: { favorite } });
  }

  function handleCreatePage() {
    createPage.mutate("Untitled", {
      onSuccess: (created) => selectPage(created.id),
    });
  }

  function handleCopyLink() {
    if (!selectedId || typeof window === "undefined") return;
    void navigator.clipboard?.writeText(
      new URL(workspacePageHref(selectedId), window.location.origin).toString(),
    );
  }

  function handleOpenComments() {
    if (!selectedId) return;
    router.push(`${ROUTES.comments}?page=${encodeURIComponent(selectedId)}`);
  }

  function handleOpenHistory() {
    router.push(updatesHref(selectedId ?? undefined));
  }

  function handleDuplicatePage() {
    if (!page) return;
    createPage.mutate(
      {
        title: `${page.title} (copy)`,
        icon: page.icon,
        parentId: page.parentId,
        blocks: page.blocks,
      },
      { onSuccess: (created) => selectPage(created.id) },
    );
  }

  function handleMovePage(parentId: string | null) {
    if (!selectedId) return;
    updatePage.mutate(
      { id: selectedId, patch: { parentId } },
      { onSuccess: () => setMoveOpen(false) },
    );
  }

  function handleMoveToTrash() {
    if (!selectedId) return;
    trashPage.mutate(selectedId, {
      onSuccess: (trashed) => {
        const nextPage = pages.find((item) => item.id !== trashed.id);
        if (nextPage) {
          selectPage(nextPage.id);
        } else {
          setSelectedId(null);
          writePageToUrl(null);
        }
      },
    });
  }

  const isCreating = createPage.isPending;

  const sidebar = sidebarOpen ? (
    <Sidebar
      pages={pages}
      selectedId={selectedId}
      source={source}
      onSelectPage={(id) => {
        selectPage(id);
        setMobileNavOpen(false);
      }}
      onOpenCommand={() => setCommandOpen(true)}
      onOpenAssistant={() => setAssistantOpen(true)}
      onCollapse={() => setSidebarOpen(false)}
      onToggleFavorite={handleToggleFavorite}
      onCreatePage={handleCreatePage}
    />
  ) : (
    <div className="flex h-full w-11 shrink-0 flex-col items-center gap-2 border-r border-border bg-sidebar py-2">
      <Button variant="subtle" size="icon" onClick={() => setSidebarOpen(true)} aria-label="Expand sidebar">
        <SidebarSkeletonToggle />
      </Button>
      <Button variant="subtle" size="icon" onClick={() => setCommandOpen(true)} aria-label="Search">
        <FilePlus2 className="h-4 w-4" />
      </Button>
      <Button variant="subtle" size="icon" onClick={() => setAssistantOpen(true)} aria-label="Ask AI">
        <Sparkles className="h-4 w-4" />
      </Button>
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
          <Topbar
            page={page}
            pages={pages}
            sidebarCollapsed={!sidebarOpen}
            onExpandSidebar={() => setSidebarOpen(true)}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            onToggleFavorite={handleToggleFavorite}
            onOpenAssistant={() => setAssistantOpen(true)}
            onOpenComments={handleOpenComments}
            onOpenHistory={handleOpenHistory}
            onDuplicatePage={handleDuplicatePage}
            onMoveTo={() => setMoveOpen(true)}
            onMoveToTrash={handleMoveToTrash}
            onCopyLink={handleCopyLink}
          />
          <main className="notion-scroll flex-1 overflow-y-auto" aria-live="polite">
            {isCreating || pageQuery.isPending ? (
              <PageSkeleton />
            ) : page ? (
              <BlockEditor key={page.id} page={page} onSave={handleSave} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="text-5xl">📄</div>
                <h1 className="text-[22px] font-bold">This page doesn&apos;t exist</h1>
                <p className="text-sm text-muted-foreground">Choose another page from the sidebar.</p>
                <Button variant="blue" onClick={handleCreatePage}>Create a page</Button>
              </div>
            )}
          </main>
        </div>

        {assistantOpen && (
          <div className="fixed inset-y-0 right-0 z-30 w-full max-w-[360px] shadow-notion-200 md:static md:z-auto md:w-[360px] md:shadow-none">
            <AIAssistant page={page} onClose={() => setAssistantOpen(false)} />
          </div>
        )}
      </div>

      {commandOpen && (
        <CommandMenu
          pages={pages}
          onSelect={selectPage}
          onClose={() => setCommandOpen(false)}
          onOpenAssistant={() => setAssistantOpen(true)}
        />
      )}

      {moveOpen && (
        <MovePageDialog
          open
          pages={pages}
          currentPageId={selectedId}
          onClose={() => setMoveOpen(false)}
          onMove={handleMovePage}
        />
      )}
    </TooltipProvider>
  );
}

function SidebarSkeletonToggle() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </svg>
  );
}
