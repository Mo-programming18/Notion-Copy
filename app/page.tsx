import { Suspense } from "react";
import { connection } from "next/server";
import { WorkspaceBootSkeleton } from "@/components/workspace/skeletons";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getDataSourceStatus, getPage, listPages } from "@/lib/data";

export const instant = false;

type HomeProps = { searchParams: Promise<{ page?: string }> };

async function Workspace({ searchParams }: HomeProps) {
  // Seed data and the page cache use Date.now(), so this content is resolved per request.
  await connection();
  const { page: requestedId } = await searchParams;
  const [pages, firstPage] = await Promise.all([listPages(), getPage("getting-started")]);
  const initialPage = (requestedId ? await getPage(requestedId) : null) ?? firstPage;

  return (
    <WorkspaceShell
      initialPages={pages}
      initialPage={initialPage}
      initialSource={getDataSourceStatus()}
    />
  );
}

export default function Home({ searchParams }: HomeProps) {
  return (
    <Suspense fallback={<WorkspaceBootSkeleton />}>
      <Workspace searchParams={searchParams} />
    </Suspense>
  );
}
