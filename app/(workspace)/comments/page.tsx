import type { Metadata } from "next";
import { connection } from "next/server";
import { PageHeader } from "@/components/layout/page-header";
import { CommentsClient } from "@/components/workspace/comments-client";
import { listPages } from "@/lib/data";

export const metadata: Metadata = {
  title: "Comments — Acme Workspace",
  description: "Comments on workspace pages.",
};

type CommentsPageProps = { searchParams: Promise<{ page?: string }> };

export const instant = false;

export default async function CommentsPage({ searchParams }: CommentsPageProps) {
  await connection();
  const [pages, params] = await Promise.all([listPages(), searchParams]);
  const pageId = typeof params.page === "string" ? params.page : undefined;

  return (
    <div className="notion-enter">
      <PageHeader
        eyebrow="Collaboration"
        title="Comments"
        description="Pick a page and leave a note. Comments stay in this browser for quick, private context."
      />
      <CommentsClient pages={pages} initialPageId={pageId} />
    </div>
  );
}
