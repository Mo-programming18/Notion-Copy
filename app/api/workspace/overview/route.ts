import { NextResponse } from "next/server";
import { getWorkspaceOverview } from "@/lib/data";

export async function GET() {
  return NextResponse.json(await getWorkspaceOverview());
}
