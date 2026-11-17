import { NextResponse } from "next/server";
import { createPage, getDataSourceStatus, listPages } from "@/lib/data";
import { createPageSchema, listPagesQuerySchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const parsed = createPageSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid page", issues: parsed.error.flatten() }, { status: 400 });
    }
    const page = await createPage(parsed.data);
    return NextResponse.json({ page }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = listPagesQuerySchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const pages = await listPages(parsed.data.q);
  return NextResponse.json(
    { pages, source: getDataSourceStatus() },
    { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=300" } },
  );
}
