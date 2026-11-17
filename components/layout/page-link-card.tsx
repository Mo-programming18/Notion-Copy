import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { workspacePageHref } from "@/lib/constants";
import type { PageSummary } from "@/lib/seed";
import { formatRelativeDate } from "@/lib/utils";

export function PageLinkCard({ page }: { page: PageSummary }) {
  return (
    <Link
      href={workspacePageHref(page.id)}
      className="group flex min-w-0 items-center gap-3 rounded-[8px] border border-border bg-white px-3 py-2.5 transition-colors hover:border-[#d9c7f5] hover:bg-[#faf7ff]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-[#f7f7f5] text-[18px]">
        {page.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium group-hover:text-[#7b4fd1]">
          {page.title}
        </span>
        <span className="block truncate text-[11px] text-muted-foreground">
          Edited {formatRelativeDate(page.updatedAt)}
          {page.parentId ? " · Subpage" : ""}
        </span>
      </span>
      {page.favorite && <span className="text-[13px] text-[#d9a441]" aria-label="Favorite">★</span>}
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 group-hover:text-[#7b4fd1]" />
    </Link>
  );
}
