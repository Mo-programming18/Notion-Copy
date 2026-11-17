import fs from "node:fs";
import path from "node:path";

export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulleted"
  | "numbered"
  | "todo"
  | "quote"
  | "code"
  | "callout"
  | "divider";

export interface PageBlock {
  id: string;
  type: BlockType;
  text: string;
  checked?: boolean;
}

export interface PageSummary {
  id: string;
  title: string;
  icon: string;
  parentId: string | null;
  favorite: boolean;
  cover: string | null;
  deletedAt?: string | null;
  updatedAt: string;
}

export interface WorkspacePage extends PageSummary {
  blocks: PageBlock[];
}

const b = (id: string, type: BlockType, text: string, checked?: boolean): PageBlock => ({
  id,
  type,
  text,
  ...(checked === undefined ? {} : { checked }),
});

const curated: WorkspacePage[] = [
  {
    id: "getting-started",
    title: "Getting started",
    icon: "👋",
    parentId: null,
    favorite: true,
    cover: "linear",
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    blocks: [
      b("gs-1", "callout", "Welcome to your workspace. Everything here is a block — type / on an empty line to insert anything."),
      b("gs-2", "heading1", "Make it yours"),
      b("gs-3", "paragraph", "This is a Notion-inspired workspace built with Next.js, Tailwind, Prisma and PostgreSQL. Click any page in the sidebar to open it — visited pages are cached and load instantly on your next visit."),
      b("gs-4", "heading2", "A few things to try"),
      b("gs-5", "todo", "Open the AI assistant and ask it to summarize this page", true),
      b("gs-6", "todo", "Edit this paragraph and watch it save automatically"),
      b("gs-7", "todo", "Press / in the editor to open the block menu"),
      b("gs-8", "todo", "Search the sidebar across 200+ pages"),
      b("gs-9", "quote", "Simple tools, thoughtfully put together, beat complicated ones used halfway."),
      b("gs-10", "divider", ""),
      b("gs-11", "heading2", "The basics"),
      b("gs-12", "bulleted", "Click a block to edit it in place; changes autosave after a short pause."),
      b("gs-13", "bulleted", "Use the handle on the left to drag, duplicate or turn a block into something else."),
      b("gs-14", "bulleted", "Star a page to pin it to Favorites in the sidebar."),
      b("gs-15", "code", "const workspace = await createWorkspace({ name: 'Acme', plan: 'team' });"),
    ],
  },
  {
    id: "company-wiki",
    title: "Company Wiki",
    icon: "📚",
    parentId: null,
    favorite: true,
    cover: "warm",
    updatedAt: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
    blocks: [
      b("cw-1", "callout", "The single source of truth for how we work, what we know, and where decisions live."),
      b("cw-2", "heading2", "Start here"),
      b("cw-3", "bulleted", "Mission, values and the operating principles behind them"),
      b("cw-4", "bulleted", "Team directories, meeting notes and project briefs"),
      b("cw-5", "bulleted", "Engineering handbook and product design guidelines"),
      b("cw-6", "heading2", "How we document"),
      b("cw-7", "paragraph", "Write for the reader, not for yourself. Prefer a short, concrete sentence over a clever vague one. Link to the source whenever a claim matters."),
      b("cw-8", "quote", "Documents are the interface of a great team."),
    ],
  },
  {
    id: "product-roadmap",
    title: "Product Roadmap",
    icon: "🗺️",
    parentId: null,
    favorite: true,
    cover: "blue",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    blocks: [
      b("pr-1", "heading2", "Now"),
      b("pr-2", "todo", "Ship collaborative cursors and presence", true),
      b("pr-3", "todo", "Improve search ranking for recently edited pages", false),
      b("pr-4", "heading2", "Next"),
      b("pr-5", "todo", "Offline editing with conflict-free sync", false),
      b("pr-6", "todo", "Public API for workspace automations", false),
      b("pr-7", "heading2", "Later"),
      b("pr-8", "paragraph", "Ideas that need more discovery before they earn a place on the roadmap."),
    ],
  },
  {
    id: "meeting-notes",
    title: "Meeting notes",
    icon: "🗓️",
    parentId: null,
    favorite: false,
    cover: null,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    blocks: [
      b("mn-1", "heading2", "Weekly product sync"),
      b("mn-2", "paragraph", "Attendees: Mina, Omar, Sofia, Daniel"),
      b("mn-3", "heading3", "Agenda"),
      b("mn-4", "bulleted", "Release readiness"),
      b("mn-5", "bulleted", "Customer feedback themes"),
      b("mn-6", "heading3", "Decisions"),
      b("mn-7", "paragraph", "We will move the editor migration to the next sprint and keep the current block renderer until the accessibility review is complete."),
    ],
  },
  {
    id: "design-system",
    title: "Design system",
    icon: "🎨",
    parentId: "company-wiki",
    favorite: true,
    cover: "rose",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    blocks: [
      b("ds-1", "callout", "A quiet, content-first system: warm greys, crisp typography, restrained blue accents."),
      b("ds-2", "heading2", "Type scale"),
      b("ds-3", "bulleted", "Page title — 40px / 44px, weight 700"),
      b("ds-4", "bulleted", "Heading 1 — 30px / 36px, weight 600"),
      b("ds-5", "bulleted", "Body — 16px / 24px, weight 400"),
      b("ds-6", "heading2", "Color"),
      b("ds-7", "paragraph", "Text rgba(0,0,0,0.95) · Muted rgba(55,53,47,0.65) · Blue #2383e2 · Hover #efefee · Sidebar #f7f7f5"),
    ],
  },
  {
    id: "engineering",
    title: "Engineering handbook",
    icon: "⚙️",
    parentId: "company-wiki",
    favorite: false,
    cover: null,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 74).toISOString(),
    blocks: [
      b("en-1", "heading2", "Principles"),
      b("en-2", "bulleted", "Boring technology, well understood, beats fashionable complexity."),
      b("en-3", "bulleted", "Make the change easy, then make the easy change."),
      b("en-4", "code", "npm run lint && npm run build && npm run test"),
    ],
  },
];

const prefixes = [
  "Research", "Brief", "Retro", "Spec", "Interview", "Analysis", "Plan", "Dashboard",
  "Playbook", "Report", "Experiment", "Workflow", "Checklist", "Timeline", "Notes", "Review",
];
const subjects = [
  "onboarding", "search relevance", "mobile editor", "pricing", "customer health",
  "block model", "notifications", "design tokens", "data export", "collaboration",
  "accessibility", "performance", "billing", "integrations", "support playbook",
];
const icons = ["📄", "📝", "🧭", "📊", "🧪", "🗂️", "💡", "✅", "📌", "🧩"];

export const seedStore = new Map<string, WorkspacePage>();

for (const page of curated) seedStore.set(page.id, page);

for (let i = 0; i < 220; i += 1) {
  const id = `page-${i + 1}`;
  const prefix = prefixes[i % prefixes.length];
  const subject = subjects[(i * 7) % subjects.length];
  const parent = curated[i % curated.length];
  const title = `${prefix}: ${subject} ${String(i + 1).padStart(3, "0")}`;
  seedStore.set(id, {
    id,
    title,
    icon: icons[i % icons.length],
    parentId: i % 3 === 0 ? parent.id : null,
    favorite: false,
    cover: null,
    updatedAt: new Date(Date.now() - i * 1000 * 60 * 47).toISOString(),
    blocks: [
      b(`${id}-1`, "callout", "Auto-generated seed page used to demonstrate virtualization and lazy loading."),
      b(`${id}-2`, "heading2", title),
      b(`${id}-3`, "paragraph", "This page lives in the seed dataset. Connect PostgreSQL and run npm run db:push to persist real workspace content instead."),
      b(`${id}-4`, "bulleted", "Parent: " + parent.title),
      b(`${id}-5`, "bulleted", "Created as part of the 220-page demo corpus."),
    ],
  });
}

export function toSummary(page: WorkspacePage): PageSummary {
  return {
    id: page.id,
    title: page.title,
    icon: page.icon,
    parentId: page.parentId,
    favorite: page.favorite,
    cover: page.cover,
    deletedAt: page.deletedAt ?? null,
    updatedAt: page.updatedAt,
  };
}

/**
 * Local fallback persistence. Route bundles in Next.js dev do not necessarily share
 * module state, so mutations are mirrored to a small JSON file.
 */
const DATA_FILE = path.join(process.cwd(), ".data", "pages.json");

export function reloadPersistedSeed() {
  try {
    if (!fs.existsSync(DATA_FILE)) return;
    const saved = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as WorkspacePage[];
    for (const page of saved) seedStore.set(page.id, page);
  } catch {
    /* ignore a corrupt fallback file and use the built-in seed */
  }
}

export function persistSeedStore() {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify([...seedStore.values()], null, 2));
  } catch {
    /* read-only filesystem: in-memory state still works for this process */
  }
}

reloadPersistedSeed();

export function getSeedPage(id: string): WorkspacePage | undefined {
  return seedStore.get(id);
}
