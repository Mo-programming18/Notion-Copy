import { NextResponse } from "next/server";
import { askAssistant, AssistantError, getAssistantConfigStatus } from "@/lib/ai/server";
import { getAiModel } from "@/lib/ai/models";
import { APP } from "@/lib/constants";
import { getPage } from "@/lib/data";
import { aiRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const status = getAssistantConfigStatus();
  if (!status.configured) {
    return NextResponse.json({
      reply: status.message,
      configured: false,
      modelId: status.defaultModelId,
    });
  }

  try {
    const body: unknown = await request.json();
    const parsed = aiRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const reply = await askAssistant(parsed.data);
    return NextResponse.json({
      reply,
      configured: true,
      modelId: parsed.data.modelId,
      modelName: getAiModel(parsed.data.modelId).name,
    });
  } catch (error) {
    const message =
      error instanceof AssistantError
        ? error.userMessage
        : "Something went wrong while contacting OpenRouter. Please try again.";
    return NextResponse.json({ reply: message, configured: true });
  }
}

export async function GET() {
  const page = await getPage(APP.defaultPageId);
  return NextResponse.json({
    ...getAssistantConfigStatus(),
    sampleContext: page?.blocks.map((block) => block.text).join(" ").slice(0, 500),
  });
}
