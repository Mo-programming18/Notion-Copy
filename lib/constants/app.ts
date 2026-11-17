export const APP = {
  name: "Acme Workspace",
  shortName: "Acme",
  monogram: "N",
  description: "A Notion-inspired workspace built with Next.js, Tailwind CSS, Prisma and PostgreSQL.",
  defaultPageId: "getting-started",
} as const;

export const DATA_SOURCE_LABELS = {
  postgres: "PostgreSQL",
  seed: "seed fallback",
} as const;

export type DataSource = keyof typeof DATA_SOURCE_LABELS;

export const ASSISTANT = {
  name: "Workspace assistant",
  shortName: "Assistant",
  mode: "OpenRouter",
  disclaimer: "Answers come from the selected free OpenRouter model. Review important content before sharing it.",
} as const;
