import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/layout/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { workspacePageHref } from "@/lib/constants";
import { getActivity } from "@/lib/data";
import { formatRelativeDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Updates — Acme Workspace",
  description: "Recent changes across workspace pages.",
};

type UpdatesPageProps = { searchParams: Promise<{ page?: string }> };

const ACTION_TONES = {
  Edited: "blue",
  Favorited: "purple",
  Deleted: "neutral",
} as const;

export const instant = false;

export default async function UpdatesPage({ searchParams }: UpdatesPageProps) {
  await connection();
  const { page: pageId } = await searchParams;
  const items = await getActivity(pageId);

  return (
    <div className="notion-enter">
      <PageHeader
        eyebrow="Activity"
        title={pageId ? "Page history" : "Updates"}
        description={
          pageId
            ? "A focused history for the selected page. Use the sidebar to switch pages."
            : "Every recent edit, favorite and deletion in one chronological stream."
        }
        actions={<Badge variant="neutral">{items.length} events</Badge>}
      />

      <SectionCard title="Timeline" description="Newest first">
        {items.length ? (
          <ol className="relative space-y-0 border-l border-border pl-5">
            {items.map((item) => (
              <li key={item.id} className="relative py-3 first:pt-0 last:pb-0">
                <span className="absolute -left-[25px] top-4 flex h-2 w-2 rounded-full bg-[#2383e2]" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[18px] leading-none">{item.icon}</span>
                  <Link
                    href={workspacePageHref(item.pageId)}
                    className="text-[14px] font-medium hover:text-[#7b4fd1] hover:underline"
                  >
                    {item.title}
                  </Link>
                  <Badge variant={ACTION_TONES[item.action]}>{item.action}</Badge>
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    {formatRelativeDate(item.at)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState icon="🕘" title="No activity yet" description="Changes to pages will appear here." />
        )}
      </SectionCard>
    </div>
  );
}
