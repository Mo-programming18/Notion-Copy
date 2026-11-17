import type { Metadata } from "next";
import { connection } from "next/server";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PageLinkCard } from "@/components/layout/page-link-card";
import { SectionCard } from "@/components/layout/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { listPages } from "@/lib/data";

export const metadata: Metadata = {
  title: "Search — Acme Workspace",
  description: "Find pages across your workspace.",
};

type SearchPageProps = { searchParams: Promise<{ q?: string }> };

export const instant = false;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  await connection();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 120) : "";
  const pages = await listPages(query);

  return (
    <div className="notion-enter">
      <PageHeader
        eyebrow="Discover"
        title="Search"
        description="Search page titles and icons across the entire workspace. Results update on each request."
      />

      <form action="/search" method="get" className="mb-6 flex items-center gap-2 rounded-[8px] border border-border bg-white px-3 py-2 shadow-notion-100 focus-within:border-[#b9a1e8]">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          name="q"
          defaultValue={query}
          autoFocus
          placeholder="Search pages…"
          className="w-full border-0 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground/70"
        />
        <button
          type="submit"
          className="shrink-0 rounded-[4px] bg-[#2383e2] px-3 py-1 text-[12px] font-medium text-white hover:bg-[#1a72c4]"
        >
          Search
        </button>
      </form>

      <SectionCard
        title={query ? `Results for “${query}”` : "All pages"}
        description={`${pages.length} pages found`}
      >
        {pages.length ? (
          <div className="grid gap-2 lg:grid-cols-2">
            {pages.map((page) => (
              <PageLinkCard key={page.id} page={page} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🔎"
            title="Nothing found"
            description={query ? `No pages match “${query}”. Try a different term.` : "Add a page to get started."}
          />
        )}
      </SectionCard>
    </div>
  );
}
