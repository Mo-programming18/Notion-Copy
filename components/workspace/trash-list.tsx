"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { workspacePageHref } from "@/lib/constants";
import type { PageSummary } from "@/lib/seed";
import { formatRelativeDate } from "@/lib/utils";
import { useRestorePage } from "./hooks";

export function TrashList({ pages }: { pages: PageSummary[] }) {
  const router = useRouter();
  const restore = useRestorePage();

  if (!pages.length) {
    return (
      <EmptyState
        icon="🗑️"
        title="Trash is empty"
        description="Pages you move to trash will stay here until you restore them."
      />
    );
  }

  return (
    <div className="divide-y divide-border">
      {pages.map((page) => (
        <div key={page.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-[#f7f7f5] text-[18px]">
            {page.icon}
          </span>
          <div className="min-w-0 flex-1">
            <a
              href={workspacePageHref(page.id)}
              className="block truncate text-[14px] font-medium hover:text-[#7b4fd1] hover:underline"
            >
              {page.title}
            </a>
            <p className="text-[11px] text-muted-foreground">
              Deleted {formatRelativeDate(page.deletedAt ?? page.updatedAt)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={restore.isPending}
            onClick={() =>
              restore.mutate(page.id, {
                onSuccess: () => router.refresh(),
              })
            }
          >
            {restore.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
            Restore
          </Button>
        </div>
      ))}
    </div>
  );
}
