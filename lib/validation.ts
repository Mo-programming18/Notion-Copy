import { z } from "zod";
import { AI_MODEL_IDS, DEFAULT_AI_MODEL_ID } from "@/lib/ai/models";
import { LIMITS } from "@/lib/constants";

export const blockTypeSchema = z.enum([
  "paragraph",
  "heading1",
  "heading2",
  "heading3",
  "bulleted",
  "numbered",
  "todo",
  "quote",
  "code",
  "callout",
  "divider",
]);

export const blockSchema = z.object({
  id: z.string().min(1).max(80),
  type: blockTypeSchema,
  text: z.string().max(LIMITS.blockText),
  checked: z.boolean().optional(),
});

export const createPageSchema = z.object({
  title: z.string().min(1).max(LIMITS.title),
  icon: z.string().max(LIMITS.icon).optional(),
  parentId: z.string().max(80).nullable().optional(),
  blocks: z.array(blockSchema).max(LIMITS.blocks).optional(),
});

export const updatePageSchema = z.object({
  title: z.string().min(1).max(LIMITS.title).optional(),
  icon: z.string().max(LIMITS.icon).optional(),
  parentId: z.string().max(80).nullable().optional(),
  favorite: z.boolean().optional(),
  blocks: z.array(blockSchema).max(LIMITS.blocks).optional(),
});

export const listPagesQuerySchema = z.object({
  q: z.string().max(LIMITS.searchQuery).optional(),
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(LIMITS.chatMessage),
});

export const aiRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(LIMITS.chatHistory),
  pageContext: z.string().max(LIMITS.blockText).optional(),
  pageTitle: z.string().max(LIMITS.title).optional(),
  modelId: z.enum(AI_MODEL_IDS).default(DEFAULT_AI_MODEL_ID),
});

export type AiRequest = z.infer<typeof aiRequestSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
