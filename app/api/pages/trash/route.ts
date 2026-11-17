import { NextResponse } from "next/server";
import { getDataSourceStatus, listTrashedPages } from "@/lib/data";

export async function GET() {
  const pages = await listTrashedPages();
  return NextResponse.json({ pages, source: getDataSourceStatus() });
}
