import { NextResponse } from "next/server";
import { getActivity } from "@/lib/data";

export async function GET(request: Request) {
  const pageId = new URL(request.url).searchParams.get("page") ?? undefined;
  return NextResponse.json({ items: await getActivity(pageId) });
}
