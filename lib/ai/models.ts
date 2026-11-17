/**
 * The only models exposed by the assistant.
 *
 * IDs verified against the official OpenRouter catalog (`/api/v1/models`) on 2026-11-17.
 * Each entry is the free variant and reports zero prompt/completion pricing.
 */
export const AI_MODELS = [
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    name: "NVIDIA Nemotron 3 Ultra (free)",
    shortName: "Nemotron 3 Ultra",
    description: "Default model for advanced reasoning, coding and complex tasks.",
  },
  {
    id: "nvidia/nemotron-3.5-super-vl:free",
    name: "NVIDIA Nemotron 3.5 Super VL (free)",
    shortName: "Nemotron 3.5 Super VL",
    description: "For image and document understanding.",
  },
  {
    id: "nvidia/nemotron-3.5-lightning:free",
    name: "NVIDIA Nemotron 3.5 Lightning (free)",
    shortName: "Nemotron 3.5 Lightning",
    description: "Fast everyday conversations.",
  },
] as const;

export type AiModelId = (typeof AI_MODELS)[number]["id"];

export const AI_MODEL_IDS = AI_MODELS.map((model) => model.id) as unknown as [
  AiModelId,
  AiModelId,
  AiModelId,
];

export const DEFAULT_AI_MODEL_ID: AiModelId = AI_MODELS[0].id;

export function isAiModelId(value: string): value is AiModelId {
  return AI_MODELS.some((model) => model.id === value);
}

export function getAiModel(id: string) {
  return AI_MODELS.find((model) => model.id === id) ?? AI_MODELS[0];
}

export const AI_SUGGESTIONS = [
  "Summarize this page",
  "Turn my notes into an action checklist",
  "What's missing from this page?",
  "Rewrite the last paragraph more clearly",
] as const;
