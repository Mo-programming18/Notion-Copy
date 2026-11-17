import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { ArrowRight, Clock3, FileText, Star, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PageLinkCard } from "@/components/layout/page-link-card";
import { SectionCard } from "@/components/layout/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DATA_SOURCE_LABELS, ROUTES } from "@/lib/constants";
import { getWorkspaceOverview } from "@/lib/data";
import { formatRelativeDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Home — Acme Workspace",
  description: "Your workspace overview, recent pages and quick links.",
};

const STAT_ICONS = [FileText, Star, Clock3, Trash2] as const;

export const instant = false;

export default async function HomePage() {
  await connection();
  const overview = await getWorkspaceOverview();

  const stats = [
    { label: "Pages", value: overview.totalPages },
    { label: "Favorites", value: overview.favoriteCount },
    { label: "Updated today", value: overview.updatedToday },
    { label: "In trash", value: overview.trashedCount },
  ];

  const quickLinks = [
    { label: "Open inbox", href: ROUTES.inbox },
    { label: "Browse favorites", href: ROUTES.favorites },
    { label: "View updates", href: ROUTES.updates },
    { label: "Search pages", href: ROUTES.search },
    { label: "Workspace AI", href: ROUTES.ai },
    { label: "Workspace settings", href: ROUTES.settings },
  ];

  return (
    <div className="notion-enter">
      <PageHeader
        eyebrow="Overview"
        title="Good to see you"
        description="Everything in your workspace, distilled into one place. Jump back into a recent page or pick up where your team left off."
        actions={
          <>
            <Badge variant={overview.source === "postgres" ? "green" : "neutral"}>
              {DATA_SOURCE_LABELS[overview.source]}
            </Badge>
            <Button variant="blue" asChild>
              <Link href={ROUTES.workspace}>
                Open workspace <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = STAT_ICONS[index];
          return (
            <div key={stat.label} className="rounded-[10px] border border-border bg-white p-4 shadow-notion-100">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[12px] font-medium text-muted-foreground">{stat.label}</span>
                <Icon className="h-4 w-4 text-muted-foreground/60" />
              </div>
              <p className="text-[28px] font-bold leading-8 tracking-[-0.02em]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <SectionCard
          title="Recently edited"
          description={
            overview.lastUpdatedAt ? `Last change ${formatRelativeDate(overview.lastUpdatedAt)}` : "No changes yet"
          }
          action={
            <Button variant="link" size="sm" asChild>
              <Link href={ROUTES.updates}>View all</Link>
            </Button>
          }
        >
          {overview.recentPages.length ? (
            <div className="space-y-2">
              {overview.recentPages.map((page) => (
                <PageLinkCard key={page.id} page={page} />
              ))}
            </div>
          ) : (
            <EmptyState icon="📄" title="No pages yet" description="Create a page from the workspace to get started." />
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Quick links" description="Go anywhere in one click.">
            <div className="grid gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-[6px] border border-border px-3 py-2 text-[13px] transition-colors hover:border-[#d9c7f5] hover:bg-[#faf7ff]"
                >
                  {link.label}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                </Link>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Need a hand?" description="Shortcuts and account help are always nearby.">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={ROUTES.help}>Help & support</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={ROUTES.profile}>Your profile</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={ROUTES.trash}>Open trash</Link>
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
