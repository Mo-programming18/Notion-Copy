"use client";

import * as React from "react";
import { ArrowRight, FileText, Search, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PageSummary } from "@/lib/seed";
import { cn } from "@/lib/utils";

type CommandMenuProps = {
  pages: PageSummary[];
  onSelect: (id: string) => void;
  onClose: () => void;
  onOpenAssistant: () => void;
};

export function CommandMenu({ pages, onSelect, onClose, onOpenAssistant }: CommandMenuProps) {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);

  const results = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    const source = term
      ? pages.filter((page) => page.title.toLowerCase().includes(term))
      : pages.slice(0, 12);
    return source.slice(0, 12);
  }, [pages, query]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="top-[22%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Search pages</DialogTitle>
          <DialogDescription>Find a page or ask the AI assistant.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((value) => Math.min(value + 1, results.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((value) => Math.max(value - 1, 0));
              } else if (event.key === "Enter" && results[active]) {
                event.preventDefault();
                onSelect(results[active].id);
                onClose();
              }
            }}
            placeholder="Search pages or type a command…"
            className="w-full border-0 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/70"
          />
          <kbd className="rounded-[3px] border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
        </div>

        <div className="notion-scroll max-h-[380px] overflow-y-auto p-2">
          <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {query ? `Results (${results.length})` : "Recently visited"}
          </p>
          {results.map((page, index) => (
            <button
              key={page.id}
              type="button"
              onMouseEnter={() => setActive(index)}
              onClick={() => {
                onSelect(page.id);
                onClose();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[4px] px-2 py-2 text-left",
                index === active && "bg-accent",
              )}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-border bg-white text-[16px]">
                {page.icon}
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px]">{page.title}</span>
              {index === active && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          ))}
          {results.length === 0 && (
            <div className="px-3 py-8 text-center text-[13px] text-muted-foreground">
              No pages found for “{query}”
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              onOpenAssistant();
              onClose();
            }}
            className="mt-1 flex w-full items-center gap-2.5 rounded-[4px] px-2 py-2 text-left text-[14px] hover:bg-accent"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#f2ebff] text-[#7b4fd1]">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            Ask the workspace assistant
          </button>
          {!query && (
            <p className="flex items-center gap-1.5 px-2 pt-2 text-[11px] text-muted-foreground">
              <FileText className="h-3 w-3" /> {pages.length} pages indexed
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
