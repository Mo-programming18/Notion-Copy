import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { PageLinkCard } from "@/components/layout/page-link-card";
import { SectionCard } from "@/components/layout/section-card";
import { Button } from "@/components/ui/button";
import { ROUTES, TEAMS } from "@/lib/constants";
import { getTeamOverview } from "@/lib/data";

export function generateStaticParams() {
  return TEAMS.map((team) => ({ slug: team.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = TEAMS.find((item) => item.slug === slug);
  return {
    title: team ? `${team.name} — Acme Workspace` : "Team — Acme Workspace",
    description: team?.description ?? "Teamspace pages.",
  };
}

export const instant = false;

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const overview = await getTeamOverview(slug);
  if (!overview) notFound();

  return (
    <div className="notion-enter">
      <PageHeader
        eyebrow="Teamspace"
        title={overview.team.name}
        description={overview.team.description}
        actions={
          <Button variant="outline" asChild>
            <Link href={ROUTES.workspace}>Open workspace</Link>
          </Button>
        }
      />

      <SectionCard title="Related pages" description={`${overview.pages.length} pages matched for ${overview.team.name}`}>
        <div className="grid gap-2 lg:grid-cols-2">
          {overview.pages.map((page) => (
            <PageLinkCard key={page.id} page={page} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
