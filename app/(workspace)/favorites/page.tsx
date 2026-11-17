import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PageLinkCard } from "@/components/layout/page-link-card";
import { SectionCard } from "@/components/layout/section-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/lib/constants";
import { listPages } from "@/lib/data";

export const metadata: Metadata = {
  title: "Favorites — Acme Workspace",
  description: "Pages you starred for quick access.",
};

export const instant = false;

export default async function FavoritesPage() {
  await connection();
  const favorites = (await listPages()).filter((page) => page.favorite);

  return (
    <div className="notion-enter">
      <PageHeader
        eyebrow="Pinned"
        title="Favorites"
        description="Your most important pages, pinned in one place. Star any page in the editor to add it here."
        actions={
          <Button variant="outline" asChild>
            <Link href={ROUTES.workspace}>Browse all pages</Link>
          </Button>
        }
      />

      <SectionCard title="Starred pages" description={`${favorites.length} favorites`}>
        {favorites.length ? (
          <div className="grid gap-2 lg:grid-cols-2">
            {favorites.map((page) => (
              <PageLinkCard key={page.id} page={page} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Star className="h-8 w-8 text-muted-foreground" />}
            title="No favorites yet"
            description="Open the workspace and star a page to pin it here."
            action={
              <Button variant="blue" asChild>
                <Link href={ROUTES.workspace}>Open workspace</Link>
              </Button>
            }
          />
        )}
      </SectionCard>
    </div>
  );
}
