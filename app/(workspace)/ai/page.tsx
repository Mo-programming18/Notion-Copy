import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/layout/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AI_MODELS } from "@/lib/ai/models";
import { getAssistantConfigStatus } from "@/lib/ai/server";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "AI features — Acme Workspace",
  description: "Choose one of three free OpenRouter models for the workspace assistant.",
};

// This page reads the OpenRouter key status at request time on the server.
export const instant = false;

export default async function AiPage() {
  await connection();
  const status = getAssistantConfigStatus();

  return (
    <div className="notion-enter">
      <PageHeader
        eyebrow="Assistant"
        title="AI features"
        description="The workspace assistant uses OpenRouter with three curated free models. Choose a model from the assistant header; your selection is remembered between conversations."
        actions={
          <>
            <Badge variant={status.configured ? "green" : "neutral"}>
              {status.configured ? "OpenRouter connected" : "Setup required"}
            </Badge>
            <Button variant="blue" asChild>
              <Link href={ROUTES.workspace}>
                Open assistant <Sparkles className="h-4 w-4" />
              </Link>
            </Button>
          </>
        }
      />

      <SectionCard title="Available models" description="Only these three free models can be used by the assistant.">
        <div className="grid gap-3 md:grid-cols-3">
          {AI_MODELS.map((model, index) => (
            <div key={model.id} className="rounded-[8px] border border-border p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[14px] font-semibold leading-5">{model.name}</span>
                {index === 0 && <Badge variant="purple">Default</Badge>}
              </div>
              <p className="text-[12px] leading-5 text-muted-foreground">{model.description}</p>
              <p className="mt-3 truncate font-mono text-[10px] text-muted-foreground/70" title={model.id}>
                {model.id}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard className="mt-6" title="Configuration" description="The API key never leaves the server.">
        <div className="rounded-[8px] bg-[#f7f7f5] px-4 py-3 text-[13px] leading-6 text-muted-foreground">
          {status.message}
        </div>
        {!status.configured && (
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-[13px] leading-6 text-muted-foreground">
            <li>Open <code className="rounded bg-[#f1f1ef] px-1 py-0.5">.env.local</code> in the project root.</li>
            <li>Replace <code className="rounded bg-[#f1f1ef] px-1 py-0.5">YOUR_API_KEY_HERE</code> with your OpenRouter key.</li>
            <li>Restart <code className="rounded bg-[#f1f1ef] px-1 py-0.5">npm run dev</code>.</li>
          </ol>
        )}
        <p className="mt-4 flex items-center gap-1.5 text-[12px] text-[#0f7a3d]">
          <Check className="h-3.5 w-3.5" /> Paid models are not available in the assistant dropdown or API allowlist.
        </p>
      </SectionCard>
    </div>
  );
}
