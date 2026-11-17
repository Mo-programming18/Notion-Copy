import { SubpageShell } from "@/components/layout/subpage-shell";
import { getDataSourceStatus, listPages } from "@/lib/data";

// The shared shell reads live page data from PostgreSQL, so navigation into this
// group is allowed to block instead of requiring a static shell for every subpage.
export const instant = false;

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pages = await listPages();

  return (
    <SubpageShell initialPages={pages} initialSource={getDataSourceStatus()}>
      {children}
    </SubpageShell>
  );
}
