import type { Metadata } from "next";
import Link from "next/link";
import { Bell, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/layout/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Settings — Acme Workspace",
  description: "Workspace and account settings.",
};

type SettingsPageProps = { searchParams: Promise<{ tab?: string }> };

const TABS = [
  { id: "general", label: "General", href: ROUTES.settings },
  { id: "members", label: "Members", href: `${ROUTES.settings}?tab=members` },
  { id: "ai", label: "AI", href: `${ROUTES.settings}?tab=ai` },
] as const;

export const instant = false;

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { tab } = await searchParams;
  const active = TABS.some((item) => item.id === tab) ? tab! : "general";

  return (
    <div className="notion-enter">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Manage workspace details, members and assistant access."
        actions={
          <Button variant="outline" asChild>
            <Link href={ROUTES.profile}>Your profile</Link>
          </Button>
        }
      />

      <nav className="mb-6 flex gap-1 border-b border-border" aria-label="Settings sections">
        {TABS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "border-b-2 px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground",
              active === item.id && "border-[#2383e2] text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {active === "general" && (
        <SectionCard title="Workspace details" description="Basic information for this workspace.">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[12px] text-muted-foreground">Name</dt>
              <dd className="mt-1 text-[14px] font-medium">{APP.name}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-muted-foreground">Monogram</dt>
              <dd className="mt-1 text-[14px] font-medium">{APP.monogram}</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-center gap-2 rounded-[6px] bg-[#f7f7f5] px-3 py-2.5 text-[12px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4" /> Authentication is handled by Better Auth with PostgreSQL.
          </div>
        </SectionCard>
      )}

      {active === "members" && (
        <SectionCard title="Members" description="Invite people to collaborate in this workspace.">
          <div className="flex items-center gap-3 rounded-[8px] border border-border px-3 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2ebff] text-[#7b4fd1]">
              <Users className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">Invite by email</p>
              <p className="text-[12px] text-muted-foreground">Workspace invitations are managed through your account provider.</p>
            </div>
            <Badge variant="neutral">Coming soon</Badge>
          </div>
        </SectionCard>
      )}

      {active === "ai" && (
        <SectionCard title="Assistant access" description="OpenRouter is configured through a server-side environment variable.">
          <div className="flex items-center gap-3 rounded-[8px] border border-border px-3 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e7f3ff] text-[#1f6fbf]">
              <Bell className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">Three free models enabled</p>
              <p className="text-[12px] text-muted-foreground">Nemotron 3 Ultra, 3.5 Super VL and 3.5 Lightning.</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.ai}>Manage models</Link>
            </Button>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
