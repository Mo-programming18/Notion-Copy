import type { Metadata } from "next";
import { connection } from "next/server";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/layout/section-card";
import { Badge } from "@/components/ui/badge";
import { listTrashedPages } from "@/lib/data";
import { TrashList } from "@/components/workspace/trash-list";

export const metadata: Metadata = {
  title: "Trash — Acme Workspace",
  description: "Restore pages you moved out of the workspace.",
};

export const instant = false;

export default async function TrashPage() {
  await connection();
  const pages = await listTrashedPages();

  return (
    <div className="notion-enter">
      <PageHeader
        eyebrow="Recovery"
        title="Trash"
        description="Deleted pages are kept here so they can be restored. Nothing is permanently erased from this view."
        actions={<Badge variant="neutral">{pages.length} items</Badge>}
      />

      <SectionCard title="Recently deleted" description="Restore a page to return it to the sidebar.">
        <TrashList pages={pages} />
      </SectionCard>
    </div>
  );
}
