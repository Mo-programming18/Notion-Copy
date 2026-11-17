-- AlterTable
ALTER TABLE "workspace_page" ADD COLUMN "deleted_at" TIMESTAMPTZ;

-- CreateIndex
CREATE INDEX "workspace_page_deleted_at_idx" ON "workspace_page"("deleted_at");
