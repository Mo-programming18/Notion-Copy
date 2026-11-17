export interface TeamConfig {
  slug: "product" | "engineering" | "marketing";
  name: string;
  description: string;
  monogram: string;
  color: string;
  searchTerms: readonly string[];
}

export const TEAMS: readonly TeamConfig[] = [
  {
    slug: "product",
    name: "Product",
    description: "Roadmaps, research, specs and customer-facing product decisions.",
    monogram: "P",
    color: "bg-[#8f7ee7]",
    searchTerms: ["roadmap", "research", "spec", "pricing", "onboarding"],
  },
  {
    slug: "engineering",
    name: "Engineering",
    description: "System design, implementation notes, reliability and technical reviews.",
    monogram: "E",
    color: "bg-[#4d9de0]",
    searchTerms: ["engineering", "block model", "performance", "data export", "integrations"],
  },
  {
    slug: "marketing",
    name: "Marketing",
    description: "Launch planning, positioning, customer stories and campaign analysis.",
    monogram: "M",
    color: "bg-[#e0a34d]",
    searchTerms: ["brief", "interview", "report", "analysis", "customer health"],
  },
] as const;

export function getTeam(slug: string): TeamConfig | undefined {
  return TEAMS.find((team) => team.slug === slug);
}
