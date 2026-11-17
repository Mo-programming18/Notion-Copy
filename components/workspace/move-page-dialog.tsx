"use client";

import * as React from "react";
import { Check, FolderInput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PageSummary } from "@/lib/seed";
import { cn } from "@/lib/utils";

export function MovePageDialog({
  open,
  pages,
  currentPageId,
  onClose,
  onMove,
}: {
  open: boolean;
  pages: PageSummary[];
  currentPageId: string | null;
  onClose: () => void;
  onMove: (parentId: string | null) => void;
}) {
  const [parentId, setParentId] = React.useState<string | null>(null);

  const candidates = pages.filter((page) => page.id !== currentPageId).slice(0, 40);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Move page</DialogTitle>
          <DialogDescription>Choose a parent page, or keep it at the top level.</DialogDescription>
        </DialogHeader>

        <div className="notion-scroll max-h-72 space-y-1 overflow-y-auto rounded-[6px] border border-border p-2">
          <button
            type="button"
            onClick={() => setParentId(null)}
            className={cn(
              "flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-left text-[13px] hover:bg-accent",
              parentId === null && "bg-sidebar-active font-medium",
            )}
          >
            <FolderInput className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">No parent (top level)</span>
            {parentId === null && <Check className="h-3.5 w-3.5 text-[#7b4fd1]" />}
          </button>
          {candidates.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => setParentId(page.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-left text-[13px] hover:bg-accent",
                parentId === page.id && "bg-sidebar-active font-medium",
              )}
            >
              <span className="text-[15px] leading-none">{page.icon}</span>
              <span className="min-w-0 flex-1 truncate">{page.title}</span>
              {parentId === page.id && <Check className="h-3.5 w-3.5 text-[#7b4fd1]" />}
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="blue" size="sm" onClick={() => onMove(parentId)}>
            Move here
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
