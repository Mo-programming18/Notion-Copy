"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowUp, Check, ChevronDown, CornerDownLeft, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AI_MODELS,
  AI_SUGGESTIONS,
  DEFAULT_AI_MODEL_ID,
  getAiModel,
  isAiModelId,
  type AiModelId,
} from "@/lib/ai/models";
import { ASSISTANT, CACHE } from "@/lib/constants";
import { useLocalStorageState } from "@/lib/hooks/use-local-storage";
import type { WorkspacePage } from "@/lib/seed";
import { fetchJson } from "./hooks";

type Message = { role: "user" | "assistant"; content: string; modelName?: string };

type AssistantConfig = {
  configured: boolean;
  message: string;
  defaultModelId: AiModelId;
};

type AssistantReply = { reply: string; configured: boolean; modelName?: string };

type AIAssistantProps = {
  page: WorkspacePage | null;
  onClose: () => void;
};

function RichText({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2 text-[14px] leading-[22px] text-foreground/90">
      {lines.map((line, index) => {
        if (!line.trim()) return <div key={index} className="h-1" />;
        if (line.startsWith("> ")) {
          return (
            <blockquote key={index} className="border-l-2 border-[#9b6dff] pl-3 text-muted-foreground">
              {line.slice(2)}
            </blockquote>
          );
        }
        if (line.startsWith("• ")) {
          return (
            <p key={index} className="pl-1 text-[13.5px] text-muted-foreground">
              <span className="mr-1.5 text-[#9b6dff]">•</span>
              {line.slice(2).replace(/\*\*/g, "")}
            </p>
          );
        }
        const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
        return (
          <p key={index}>
            {parts.map((part, partIndex) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={partIndex} className="font-semibold">{part.slice(2, -2)}</strong>
              ) : (
                <React.Fragment key={partIndex}>{part}</React.Fragment>
              ),
            )}
          </p>
        );
      })}
    </div>
  );
}

export function AIAssistant({ page, onClose }: AIAssistantProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [storedModelId, setStoredModelId] = useLocalStorageState<string>(
    CACHE.aiModelKey,
    DEFAULT_AI_MODEL_ID,
    { deserialize: (raw) => raw.replace(/^"|"$/g, "") },
  );
  const modelId: AiModelId = isAiModelId(storedModelId) ? storedModelId : DEFAULT_AI_MODEL_ID;
  const [config, setConfig] = React.useState<AssistantConfig | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let active = true;
    fetchJson<AssistantConfig>("/api/ai")
      .then((data) => {
        if (active) setConfig(data);
      })
      .catch(() => {
        if (active) {
          setConfig({
            configured: false,
            defaultModelId: DEFAULT_AI_MODEL_ID,
            message: "Could not load OpenRouter configuration. Check the dev server and try again.",
          });
        }
      });
    return () => {
      active = false;
    };
    // Configuration is loaded once when the assistant panel mounts.
  }, []);

  const assistant = useMutation({
    mutationFn: async (prompt: string) => {
      const context = page?.blocks.map((block) => `${block.type}: ${block.text}`).join("\n") ?? "";
      return fetchJson<AssistantReply>("/api/ai", {
        method: "POST",
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: prompt }],
          pageContext: context,
          pageTitle: page?.title,
          modelId,
        }),
      });
    },
    onSuccess: (data) => {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply, modelName: data.modelName },
      ]);
      if (!data.configured && config) setConfig({ ...config, configured: false });
    },
  });

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, assistant.isPending]);

  const configured = Boolean(config?.configured);
  const configurationMessage =
    config?.message ?? "Checking OpenRouter configuration…";
  const selectedModel = getAiModel(modelId);

  function send(prompt: string) {
    const value = prompt.trim();
    if (!value || assistant.isPending || !configured) return;
    setMessages((current) => [...current, { role: "user", content: value }]);
    setInput("");
    assistant.mutate(value);
  }

  return (
    <aside className="flex h-full w-[360px] shrink-0 flex-col border-l border-border bg-white" aria-label={`${ASSISTANT.name} assistant`}>
      <div className="flex h-[45px] shrink-0 items-center gap-2 border-b border-border px-4">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] bg-[#f2ebff] text-[#7b4fd1]">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <span className="shrink-0 text-[14px] font-semibold">{ASSISTANT.name}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center justify-end gap-1 rounded-[4px] px-1.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Select AI model"
            >
              <span className="truncate">{selectedModel.shortName}</span>
              <ChevronDown className="h-3 w-3 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>AI model · 3 free models</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {AI_MODELS.map((model) => (
              <DropdownMenuItem key={model.id} onSelect={() => setStoredModelId(model.id)}>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{model.shortName}</span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
                    {model.description}
                  </span>
                </span>
                {model.id === modelId && <Check className="ml-2 h-3.5 w-3.5 shrink-0 text-[#7b4fd1]" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="subtle" size="icon" onClick={onClose} aria-label="Close assistant">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="notion-scroll flex-1 overflow-y-auto px-4 py-5">
        {messages.length === 0 ? (
          <div className="notion-enter">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#f2ebff] text-[#7b4fd1]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="mb-1 text-[22px] font-bold leading-7 tracking-[-0.02em]">What can I help with?</h2>
            <p className="mb-4 text-[13px] leading-5 text-muted-foreground">
              Ask about <span className="font-medium text-foreground">{page?.title ?? "this page"}</span> using{" "}
              <span className="font-medium text-foreground">{selectedModel.shortName}</span>.
            </p>
            {!configured && (
              <p
                role="status"
                className="mb-5 rounded-[6px] border border-[#f0d9a8] bg-[#fff9e8] px-3 py-2.5 text-[12px] leading-5 text-[#7a5b12]"
              >
                {configurationMessage}
              </p>
            )}
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Try asking</p>
            <div className="space-y-2">
              {AI_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={!configured}
                  onClick={() => send(suggestion)}
                  className="flex w-full items-center justify-between rounded-[6px] border border-border bg-white px-3 py-2.5 text-left text-[13px] transition-colors hover:border-[#d9c7f5] hover:bg-[#faf7ff] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {suggestion}
                  <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground/60" />
                </button>
              ))}
            </div>
            <p className="mt-7 rounded-[6px] bg-[#f7f7f5] px-3 py-2.5 text-[11.5px] leading-4 text-muted-foreground">
              {ASSISTANT.disclaimer}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((message, index) => (
              <div key={index} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[88%] rounded-[10px] bg-[#f1f1ef] px-3 py-2 text-[14px] leading-[22px]"
                      : "w-full"
                  }
                >
                  {message.role === "assistant" && (
                    <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#7b4fd1]">
                      <Sparkles className="h-3 w-3" /> {ASSISTANT.name}
                      {message.modelName && (
                        <span className="font-normal text-muted-foreground">· {message.modelName}</span>
                      )}
                    </div>
                  )}
                  {message.role === "user" ? message.content : <RichText content={message.content} />}
                </div>
              </div>
            ))}
            {assistant.isPending && (
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking with {selectedModel.shortName}…
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border p-3">
        {!configured && (
          <p className="mb-2 rounded-[6px] bg-[#fff9e8] px-2.5 py-2 text-[11px] leading-4 text-[#7a5b12]">
            {configurationMessage}
          </p>
        )}
        <div className="rounded-[8px] border border-border bg-white p-2 shadow-notion-100 focus-within:border-[#b9a1e8]">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send(input);
              }
            }}
            rows={2}
            disabled={!configured}
            placeholder={configured ? "Ask anything about this page…" : "Add your OpenRouter key to start chatting…"}
            className="w-full resize-none border-0 bg-transparent p-1 text-[14px] leading-5 outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed"
          />
          <div className="flex items-center justify-between pt-1">
            <span className="pl-1 text-[10px] text-muted-foreground/70">
              {configured ? "Enter to send · Shift+Enter for a new line" : "Configuration required"}
            </span>
            <Button
              variant="blue"
              size="icon"
              className="h-6 w-6"
              disabled={!configured || !input.trim() || assistant.isPending}
              onClick={() => send(input)}
              aria-label="Send message"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
