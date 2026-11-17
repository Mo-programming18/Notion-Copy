import { Prisma, type WorkspacePage as PrismaWorkspacePage } from "@prisma/client";
import { LIMITS } from "@/lib/constants";
import { db, isDatabaseConfigured } from "@/lib/db";
import {
  getSeedPage,
  persistSeedStore,
  reloadPersistedSeed,
  seedStore,
  toSummary,
  type PageBlock,
  type PageSummary,
  type WorkspacePage,
} from "@/lib/seed";
import type { CreatePageInput, UpdatePageInput } from "@/lib/validation";

let databaseHealthy = isDatabaseConfigured;

function toBlocks(value: Prisma.JsonValue): PageBlock[] {
  if (!Array.isArray(value)) return [];
  return value as unknown as PageBlock[];
}

function toJson(blocks: PageBlock[]): Prisma.InputJsonValue {
  return blocks.map(({ id, type, text, checked }) => ({
    id,
    type,
    text,
    ...(checked === undefined ? {} : { checked }),
  })) as unknown as Prisma.InputJsonValue;
}

function toPage(row: PrismaWorkspacePage): WorkspacePage {
  return {
    id: row.id,
    title: row.title,
    icon: row.icon,
    parentId: row.parentId,
    favorite: row.favorite,
    cover: row.cover,
    deletedAt: row.deletedAt?.toISOString() ?? null,
    blocks: toBlocks(row.blocks),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function disableDatabase(error: unknown) {
  databaseHealthy = false;
  if (process.env.NODE_ENV !== "production") {
    console.warn("[data] PostgreSQL unavailable, using seed dataset:", error instanceof Error ? error.message : error);
  }
}

export function getDataSourceStatus() {
  return databaseHealthy ? "postgres" : "seed";
}

export async function listPages(query?: string): Promise<PageSummary[]> {
  const term = query?.trim();

  if (databaseHealthy) {
    try {
      const rows = await db.workspacePage.findMany({
        where: {
          deletedAt: null,
          ...(term
            ? {
                OR: [
                  { title: { contains: term, mode: "insensitive" } },
                  { icon: { contains: term, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: [{ favorite: "desc" }, { updatedAt: "desc" }],
        take: LIMITS.pageList,
      });
      return rows.map((row) => toSummary(toPage(row)));
    } catch (error) {
      disableDatabase(error);
    }
  }

  reloadPersistedSeed();
  const pages = [...seedStore.values()].filter((page) => !page.deletedAt);
  const filtered = term
    ? pages.filter(
        (page) =>
          page.title.toLowerCase().includes(term.toLowerCase()) ||
          page.icon.includes(term) ||
          page.blocks.some((block) => block.text.toLowerCase().includes(term.toLowerCase())),
      )
    : pages;
  return filtered
    .sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.updatedAt.localeCompare(a.updatedAt))
    .map(toSummary);
}

export async function listTrashedPages(): Promise<PageSummary[]> {
  if (databaseHealthy) {
    try {
      const rows = await db.workspacePage.findMany({
        where: { deletedAt: { not: null } },
        orderBy: { deletedAt: "desc" },
        take: LIMITS.pageList,
      });
      return rows.map((row) => toSummary(toPage(row)));
    } catch (error) {
      disableDatabase(error);
    }
  }

  reloadPersistedSeed();
  return [...seedStore.values()]
    .filter((page) => Boolean(page.deletedAt))
    .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? ""))
    .map(toSummary);
}

export async function getPage(id: string): Promise<WorkspacePage | null> {
  let page: WorkspacePage | null = null;

  if (databaseHealthy) {
    try {
      const row = await db.workspacePage.findUnique({ where: { id } });
      if (row) page = toPage(row);
    } catch (error) {
      disableDatabase(error);
    }
  }

  if (!page) {
    reloadPersistedSeed();
    const seedPage = getSeedPage(id);
    if (seedPage) page = { ...seedPage, blocks: [...seedPage.blocks] };
  }

  return page;
}

export async function createPage(input: CreatePageInput): Promise<WorkspacePage> {
  const id = `page-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const page: WorkspacePage = {
    id,
    title: input.title,
    icon: input.icon ?? "📄",
    parentId: input.parentId ?? null,
    favorite: false,
    cover: null,
    deletedAt: null,
    updatedAt: new Date().toISOString(),
    blocks: input.blocks?.length
      ? input.blocks
      : [
          { id: `${id}-h`, type: "heading2", text: input.title },
          { id: `${id}-p`, type: "paragraph", text: "" },
        ],
  };

  seedStore.set(id, page);
  persistSeedStore();

  if (databaseHealthy) {
    try {
      await db.workspacePage.create({
        data: {
          id: page.id,
          title: page.title,
          icon: page.icon,
          parentId: page.parentId,
          favorite: page.favorite,
          blocks: toJson(page.blocks),
          updatedAt: new Date(page.updatedAt),
        },
      });
    } catch (error) {
      disableDatabase(error);
    }
  }

  return page;
}

export async function updatePage(id: string, input: UpdatePageInput): Promise<WorkspacePage | null> {
  const current = await getPage(id);
  if (!current) return null;

  const updated: WorkspacePage = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  const seedPage = seedStore.get(id);
  if (seedPage) {
    seedPage.title = updated.title;
    seedPage.icon = updated.icon;
    seedPage.parentId = updated.parentId;
    seedPage.favorite = updated.favorite;
    seedPage.blocks = updated.blocks;
    seedPage.updatedAt = updated.updatedAt;
    persistSeedStore();
  }

  if (databaseHealthy) {
    try {
      const updatedAt = new Date(updated.updatedAt);
      await db.workspacePage.upsert({
        where: { id: updated.id },
        create: {
          id: updated.id,
          title: updated.title,
          icon: updated.icon,
          parentId: updated.parentId,
          favorite: updated.favorite,
          blocks: toJson(updated.blocks),
          cover: updated.cover,
          updatedAt,
        },
        update: {
          title: updated.title,
          icon: updated.icon,
          parentId: updated.parentId,
          favorite: updated.favorite,
          blocks: toJson(updated.blocks),
          updatedAt,
        },
      });
    } catch (error) {
      disableDatabase(error);
    }
  }

  return updated;
}

export async function trashPage(id: string): Promise<WorkspacePage | null> {
  const current = await getPage(id);
  if (!current) return null;

  const deletedAt = new Date().toISOString();
  const updated = { ...current, deletedAt };

  const seedPage = seedStore.get(id);
  if (seedPage) {
    seedPage.deletedAt = deletedAt;
    persistSeedStore();
  }

  if (databaseHealthy) {
    try {
      await db.workspacePage.update({
        where: { id },
        data: { deletedAt: new Date(deletedAt) },
      });
    } catch (error) {
      disableDatabase(error);
    }
  }

  return updated;
}

export async function restorePage(id: string): Promise<WorkspacePage | null> {
  const current = await getPage(id);
  if (!current) return null;

  const updated = { ...current, deletedAt: null };

  const seedPage = seedStore.get(id);
  if (seedPage) {
    seedPage.deletedAt = null;
    persistSeedStore();
  }

  if (databaseHealthy) {
    try {
      await db.workspacePage.update({ where: { id }, data: { deletedAt: null } });
    } catch (error) {
      disableDatabase(error);
    }
  }

  return updated;
}

export async function deletePagePermanently(id: string): Promise<boolean> {
  const current = await getPage(id);
  if (!current) return false;

  seedStore.delete(id);
  persistSeedStore();

  if (databaseHealthy) {
    try {
      await db.workspacePage.delete({ where: { id } });
    } catch (error) {
      disableDatabase(error);
    }
  }

  return true;
}

/** Used once when bootstrapping a fresh PostgreSQL database. */
export async function seedDatabase() {
  const pages = [...seedStore.values()];
  if (!databaseHealthy) return { inserted: 0, skipped: pages.length };

  let inserted = 0;
  try {
    for (const page of pages) {
      const result = await db.workspacePage.createMany({
        data: [
          {
            id: page.id,
            title: page.title,
            icon: page.icon,
            parentId: page.parentId,
            favorite: page.favorite,
            cover: page.cover,
            blocks: toJson(page.blocks),
            updatedAt: new Date(page.updatedAt),
          },
        ],
        skipDuplicates: true,
      });
      inserted += result.count;
    }
  } catch (error) {
    disableDatabase(error);
  }
  return { inserted, skipped: pages.length - inserted };
}
