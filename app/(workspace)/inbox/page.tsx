import type { Metadata } from "next";
import { connection } from "next/server";
import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/layout/section-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { workspacePageHref } from "@/lib/constants";
import { getInboxItems } from "@/lib/data";
import { formatRelativeDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Inbox — Acme Workspace",
  description: "Mentions and page updates from across your workspace.",
};

export const instant = false;

export default async function InboxPage() {
  await connection();
  const items = await getInboxItems();
  const unread = items.filter((item) => item.unread).length;

  return (
    <div className="notion-enter">
      <PageHeader
        eyebrow="Workspace"
        title="Inbox"
        description="A running list of mentions and recent page activity. Open any item to jump back into the conversation."
        actions={<Badge variant={unread ? "blue" : "neutral"}>{unread} unread</Badge>}
      />

      <SectionCard title="All updates" description={`${items.length} items from your workspace`}>
        {items.length ? (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <a
                key={item.id}
                href={workspacePageHref(item.pageId)}
                className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-[#f7f7f5] text-[18px]">
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-medium">{item.title}</span>
                    {item.unread && <Badge variant="blue">New</Badge>}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-5 text-muted-foreground">
                    {item.message}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatRelativeDate(item.at)}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Inbox className="h-8 w-8 text-muted-foreground" />}
            title="You're all caught up"
            description="New mentions and page updates will appear here."
          />
        )}
      </SectionCard>
    </div>
  );
}
