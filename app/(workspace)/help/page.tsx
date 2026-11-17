import type { Metadata } from "next";
import Link from "next/link";
import { Keyboard } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/layout/section-card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Help & support — Acme Workspace",
  description: "Keyboard shortcuts and workspace help.",
};

const SHORTCUTS = [
  { keys: "⌘/Ctrl + K", action: "Search pages / commands" },
  { keys: "⌘/Ctrl + J", action: "Toggle AI assistant" },
  { keys: "⌘/Ctrl + \\", action: "Toggle sidebar" },
  { keys: "/", action: "Open the block menu on an empty block" },
];

export const instant = false;

export default function HelpPage() {
  return (
    <div className="notion-enter">
      <PageHeader
        eyebrow="Support"
        title="Help & support"
        description="A quick reference for getting around the workspace."
        actions={
          <Button variant="outline" asChild>
            <Link href={ROUTES.workspace}>Back to workspace</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Keyboard shortcuts" description="Move faster without leaving the keyboard.">
          <div className="divide-y divide-border">
            {SHORTCUTS.map((shortcut) => (
              <div key={shortcut.keys} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                <span className="text-[13px] text-muted-foreground">{shortcut.action}</span>
                <kbd className="inline-flex items-center gap-1 rounded border border-border bg-[#f7f7f5] px-2 py-0.5 text-[11px] font-medium">
                  <Keyboard className="h-3 w-3" /> {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Common tasks" description="Jump straight to the page you need.">
          <div className="grid gap-2">
            {[
              { label: "Find a page", href: ROUTES.search },
              { label: "Review recent changes", href: ROUTES.updates },
              { label: "Configure the AI assistant", href: ROUTES.ai },
              { label: "Restore a deleted page", href: ROUTES.trash },
              { label: "Update your profile", href: ROUTES.profile },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[6px] border border-border px-3 py-2 text-[13px] transition-colors hover:border-[#d9c7f5] hover:bg-[#faf7ff]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
