import "./setup";
import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { PrismaClient } from "@prisma/client";
import { createPage, getDataSourceStatus, getPage, listPages, updatePage } from "../lib/data";
import { persistSeedStore, seedStore } from "../lib/seed";

const prisma = new PrismaClient();

after(async () => {
  await prisma.$disconnect();
});

describe("Prisma workspace data access", () => {
  it("lists the persisted workspace pages", async () => {
    const pages = await listPages();
    assert.equal(getDataSourceStatus(), "postgres");
    assert.ok(
      pages.length >= 226,
      `expected all seeded pages from PostgreSQL, received ${pages.length}`,
    );
  });

  it("round-trips a created and updated page through Prisma", async () => {
    const created = await createPage({ title: "Prisma migration test", icon: "🧪" });

    try {
      const stored = await prisma.workspacePage.findUnique({ where: { id: created.id } });
      assert.ok(stored, "createPage did not persist the page with Prisma");
      assert.equal(stored.title, "Prisma migration test");
      assert.deepEqual(stored.blocks, created.blocks);

      const blocks = [
        { id: `${created.id}-updated`, type: "paragraph" as const, text: "Persisted by Prisma" },
      ];
      const updated = await updatePage(created.id, {
        title: "Prisma update test",
        favorite: true,
        blocks,
      });

      assert.ok(updated, "updatePage did not return the updated page");
      const reloaded = await getPage(created.id);
      assert.equal(reloaded?.title, "Prisma update test");
      assert.equal(reloaded?.favorite, true);
      assert.deepEqual(reloaded?.blocks, blocks);
    } finally {
      await prisma.workspacePage.deleteMany({ where: { id: created.id } });
      seedStore.delete(created.id);
      persistSeedStore();
    }
  });
});
