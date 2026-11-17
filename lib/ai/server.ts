import { z } from "zod";
import { APP, ASSISTANT } from "@/lib/constants";
import { AI_MODELS, DEFAULT_AI_MODEL_ID, getAiModel, type AiModelId } from "@/lib/ai/models";
import type { AiRequest } from "@/lib/validation";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const KEY_PLACEHOLDER = "YOUR_API_KEY_HERE";

export const OPENROUTER_CONFIG_MESSAGE =
  "OpenRouter is not configured yet. Add OPENROUTER_API_KEY=YOUR_API_KEY_HERE to .env.local, replace the placeholder with your real key, then restart the dev server. No API request was sent.";

const SYSTEM_PROMPT = `You are the inline assistant inside ${APP.name}.
You are concise, practical and warm. You help the user think, write and organize.
Format short answers with plain markdown-style bullets. Never claim to have acted on the page.
When given page context, ground your answer in it and quote sparingly.`;

const openRouterResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({ content: z.string() }),
    }),
  ),
});

export class AssistantError extends Error {
  constructor(public readonly userMessage: string) {
    super(userMessage);
    this.name = "AssistantError";
  }
}

function readApiKey(): string | null {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key || key === KEY_PLACEHOLDER) return null;
  return key;
}

export function getAssistantConfigStatus() {
  const configured = Boolean(readApiKey());
  return {
    ready: configured,
    configured,
    message: configured
      ? `Connected to OpenRouter using ${getAiModel(DEFAULT_AI_MODEL_ID).name}.`
      : OPENROUTER_CONFIG_MESSAGE,
    models: AI_MODELS,
    defaultModelId: DEFAULT_AI_MODEL_ID,
    name: ASSISTANT.name,
  };
}

function friendlyError(status: number, modelId: AiModelId): string {
  const model = getAiModel(modelId).name;
  if (status === 401 || status === 403) {
    return "Your OpenRouter API key was rejected. Check the value in .env.local and restart the dev server. No data was sent to the browser.";
  }
  if (status === 404) {
    return `${model} is not available from OpenRouter right now. Pick another model from the header and try again.`;
  }
  if (status === 429) {
    return "OpenRouter rate limit reached for this model. Wait a moment and try again, or switch to another free model.";
  }
  if (status >= 500) {
    return `OpenRouter is temporarily unavailable for ${model}. Please try again shortly.`;
  }
  return `OpenRouter rejected the request for ${model} (${status}). Try another model or check the page context.`;
}

/** Server-only. Reads OPENROUTER_API_KEY from process.env and never returns it. */
export async function askAssistant(input: AiRequest): Promise<string> {
  const apiKey = readApiKey();
  if (!apiKey) throw new AssistantError(OPENROUTER_CONFIG_MESSAGE);

  const model = getAiModel(input.modelId);
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(input.pageContext
      ? [
          {
            role: "system",
            content: `Current page: ${input.pageTitle ?? "Untitled"}\n\nPage content:\n${input.pageContext}`,
          },
        ]
      : []),
    ...input.messages,
  ];

  let response: Response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": APP.name,
      },
      body: JSON.stringify({
        model: model.id,
        messages,
        temperature: 0.4,
        max_tokens: 700,
        stream: false,
      }),
      signal: AbortSignal.timeout(45_000),
      cache: "no-store",
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[ai] OpenRouter request failed:", error instanceof Error ? error.message : error);
    }
    throw new AssistantError("Could not reach OpenRouter. Check your connection and try again.");
  }

  if (!response.ok) {
    throw new AssistantError(friendlyError(response.status, input.modelId));
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AssistantError("OpenRouter returned an unreadable response. Please try again.");
  }

  const parsed = openRouterResponseSchema.safeParse(payload);
  const reply = parsed.success ? parsed.data.choices[0]?.message.content?.trim() : "";
  if (!reply) {
    throw new AssistantError(`${model.name} returned an empty response. Try again or switch models.`);
  }

  return reply;
}
