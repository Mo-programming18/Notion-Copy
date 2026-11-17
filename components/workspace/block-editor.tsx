"use client";

import * as React from "react";
import {
  Braces,
  Check,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Info,
  Lightbulb,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Plus,
  Quote,
  Text,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BlockType, PageBlock, WorkspacePage } from "@/lib/seed";
import { cn } from "@/lib/utils";

type BlockEditorProps = {
  page: WorkspacePage;
  onSave: (patch: Partial<WorkspacePage>) => void;
};

const BLOCK_OPTIONS: {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string;
}[] = [
  { type: "paragraph", label: "Text", description: "Just start writing with plain text.", icon: Text, keywords: "text paragraph plain" },
  { type: "heading1", label: "Heading 1", description: "Big section heading.", icon: Heading1, keywords: "h1 title big heading" },
  { type: "heading2", label: "Heading 2", description: "Medium section heading.", icon: Heading2, keywords: "h2 medium heading" },
  { type: "heading3", label: "Heading 3", description: "Small section heading.", icon: Heading3, keywords: "h3 small heading" },
  { type: "todo", label: "To-do list", description: "Track tasks with a checkbox.", icon: ListTodo, keywords: "todo task checkbox check" },
  { type: "bulleted", label: "Bulleted list", description: "Create a simple bulleted list.", icon: List, keywords: "bullet list unordered" },
  { type: "numbered", label: "Numbered list", description: "Create a list with numbering.", icon: ListOrdered, keywords: "number ordered list" },
  { type: "quote", label: "Quote", description: "Capture a quote.", icon: Quote, keywords: "quote blockquote" },
  { type: "callout", label: "Callout", description: "Make writing stand out.", icon: Lightbulb, keywords: "callout info note" },
  { type: "code", label: "Code", description: "Capture a code snippet.", icon: Code2, keywords: "code snippet mono" },
  { type: "divider", label: "Divider", description: "Visually divide blocks.", icon: Minus, keywords: "divider line separator hr" },
];

const EMOJIS = ["📄", "📝", "📚", "🗺️", "🎨", "⚙️", "💡", "🚀", "✅", "🧭", "📊", "🧪", "🗂️", "📌", "🧩", "🔍", "🗓️", "🏠", "🌱", "🔥", "⭐", "🎯", "🧠", "💬"];

const createBlock = (type: BlockType = "paragraph"): PageBlock => ({
  id: `block-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
  type,
  text: "",
});

export function BlockEditor({ page, onSave }: BlockEditorProps) {
  const [title, setTitle] = React.useState(page.title);
  const [icon, setIcon] = React.useState(page.icon);
  const [blocks, setBlocks] = React.useState<PageBlock[]>(page.blocks);
  const [saveState, setSaveState] = React.useState<"saved" | "unsaved" | "saving">("saved");
  const [iconPickerOpen, setIconPickerOpen] = React.useState(false);
  const [slash, setSlash] = React.useState<{ id: string; query: string; index: number } | null>(null);
  const textareaRefs = React.useRef<Map<string, HTMLTextAreaElement>>(new Map());
  const pendingFocusRef = React.useRef<string | null>(null);
  const lastSavedSignature = React.useRef(
    JSON.stringify({ title: page.title, icon: page.icon, blocks: page.blocks }),
  );
  const onSaveRef = React.useRef(onSave);
  React.useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  React.useEffect(() => {
    const id = pendingFocusRef.current;
    if (id) {
      textareaRefs.current.get(id)?.focus();
      pendingFocusRef.current = null;
    }
  }, [blocks]);

  React.useEffect(() => {
    const signature = JSON.stringify({ title, icon, blocks });
    if (signature === lastSavedSignature.current) return;

    setSaveState("unsaved");
    const timer = window.setTimeout(() => {
      setSaveState("saving");
      lastSavedSignature.current = signature;
      onSaveRef.current({ title, icon, blocks });
      window.setTimeout(() => setSaveState("saved"), 350);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [title, icon, blocks]);

  const filteredOptions = React.useMemo(() => {
    const query = slash?.query.toLowerCase().trim() ?? "";
    if (!query) return BLOCK_OPTIONS;
    return BLOCK_OPTIONS.filter(
      (option) =>
        option.label.toLowerCase().includes(query) || option.keywords.includes(query),
    );
  }, [slash?.query]);

  const updateBlock = React.useCallback((id: string, patch: Partial<PageBlock>) => {
    setBlocks((current) => current.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  }, []);

  function insertAfter(id: string, type: BlockType = "paragraph") {
    const next = createBlock(type);
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      return [...current.slice(0, index + 1), next, ...current.slice(index + 1)];
    });
    setSlash(null);
    pendingFocusRef.current = next.id;
  }

  function removeBlock(id: string) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      if (current.length === 1) return [createBlock()];
      const previous = current[index - 1];
      if (previous) pendingFocusRef.current = previous.id;
      return current.filter((block) => block.id !== id);
    });
  }

  function duplicateBlock(id: string) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      if (index < 0) return current;
      const copy = { ...current[index], id: createBlock().id };
      return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)];
    });
  }

  function applySlash(type: BlockType, id: string) {
    const target = blocks.find((block) => block.id === id);
    updateBlock(id, { type, text: target?.text.replace(/^\/[^\s]*/, "") ?? "" });
    setSlash(null);
    pendingFocusRef.current = id;
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>, block: PageBlock) {
    if (slash?.id === block.id) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSlash({ ...slash, index: (slash.index + 1) % Math.max(filteredOptions.length, 1) });
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSlash({ ...slash, index: (slash.index - 1 + filteredOptions.length) % Math.max(filteredOptions.length, 1) });
        return;
      }
      if (event.key === "Enter" && filteredOptions[slash.index]) {
        event.preventDefault();
        applySlash(filteredOptions[slash.index].type, block.id);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setSlash(null);
        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey && block.type !== "code") {
      event.preventDefault();
      insertAfter(block.id);
      return;
    }
    if (event.key === "Backspace" && !block.text) {
      event.preventDefault();
      removeBlock(block.id);
    }
  }

  function handleTextChange(block: PageBlock, value: string) {
    updateBlock(block.id, { text: value });
    if (value.startsWith("/")) {
      setSlash({ id: block.id, query: value.slice(1).split(" ")[0], index: 0 });
    } else if (slash?.id === block.id) {
      setSlash(null);
    }
  }

  return (
    <div className="notion-enter mx-auto w-full max-w-[900px] px-6 pb-40 pt-10 sm:px-14">
      {page.cover && (
        <div className="group/cover relative -mx-6 mb-8 h-36 overflow-hidden sm:-mx-14 sm:h-44">
          <div className={cn("notion-cover h-full w-full", `notion-cover-${page.cover}`)} />
          <div className="absolute bottom-3 right-4 flex gap-2 opacity-0 transition-opacity group-hover/cover:opacity-100">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/90 text-[12px] shadow-notion-100 backdrop-blur"
              onClick={() => onSave({ cover: ["linear", "blue", "warm", "rose"][(["linear", "blue", "warm", "rose"].indexOf(page.cover ?? "linear") + 1) % 4] })}
            >
              Change cover
            </Button>
          </div>
        </div>
      )}

      <div className="relative mb-1 inline-block">
        <button
          type="button"
          onClick={() => setIconPickerOpen((value) => !value)}
          className="flex h-16 w-16 items-center justify-center rounded-[8px] text-[58px] leading-none transition-colors hover:bg-accent"
          aria-label="Change page icon"
        >
          {icon}
        </button>
        {iconPickerOpen && (
          <div className="absolute left-0 top-[70px] z-30 w-64 rounded-[8px] border border-border bg-white p-2 shadow-notion-200">
            <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Choose an icon</p>
            <div className="grid grid-cols-8 gap-1">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setIcon(emoji);
                    setIconPickerOpen(false);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-[4px] text-[18px] hover:bg-accent"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Untitled"
        aria-label="Page title"
        className="mb-1 block w-full border-0 bg-transparent p-0 text-[40px] font-bold leading-[48px] tracking-[-0.02em] text-foreground outline-none placeholder:text-muted-foreground/40"
      />

      <div className="mb-7 flex h-5 items-center gap-1.5 text-[11px] text-muted-foreground">
        {saveState === "saved" ? (
          <>
            <Check className="h-3 w-3" />
            <span>All changes saved</span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#2383e2]" />
            <span>{saveState === "saving" ? "Saving…" : "Unsaved changes"}</span>
          </>
        )}
        <span className="mx-1 text-border">·</span>
        <Info className="h-3 w-3" />
        <span>Type / for commands</span>
      </div>

      <div className="space-y-0.5">
        {blocks.map((block, blockIndex) => {
          const number = blocks
            .slice(0, blockIndex + 1)
            .reverse()
            .filter((item) => item.type === "numbered").length;
          const isSlashOpen = slash?.id === block.id;

          return (
            <div key={block.id} className="group/block relative flex items-start">
              <div className="absolute -left-[74px] top-0 hidden items-center gap-0.5 pt-0.5 group-hover/block:flex group-focus-within/block:flex">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-6 w-5 items-center justify-center rounded-[3px] text-muted-foreground/70 hover:bg-accent"
                      aria-label="Block options"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {BLOCK_OPTIONS.map((option) => (
                      <DropdownMenuItem key={option.type} onSelect={() => applySlash(option.type, block.id)}>
                        <option.icon />
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-6 w-4 items-center justify-center rounded-[3px] text-muted-foreground/70 hover:bg-accent"
                      aria-label="Block actions"
                    >
                      <Braces className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    <DropdownMenuItem onSelect={() => duplicateBlock(block.id)}>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => insertAfter(block.id)}>Insert below</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onSelect={() => removeBlock(block.id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="min-w-0 flex-1">
                {block.type === "divider" ? (
                  <div className="group/divider py-3">
                    <hr className="border-t border-border" />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex items-start gap-2",
                      block.type === "callout" && "rounded-[4px] bg-callout-blue px-3 py-3 text-callout-blue-fg",
                      block.type === "code" && "rounded-[4px] bg-[#f7f6f3] px-4 py-3",
                      block.type === "quote" && "border-l-[3px] border-foreground py-1 pl-4",
                    )}
                  >
                    {block.type === "bulleted" && <span className="mt-[7px] w-4 shrink-0 text-center leading-6">•</span>}
                    {block.type === "numbered" && <span className="mt-[2px] w-5 shrink-0 text-right text-[15px] leading-7 text-muted-foreground">{number}.</span>}
                    {block.type === "todo" && (
                      <input
                        type="checkbox"
                        checked={Boolean(block.checked)}
                        onChange={(event) => updateBlock(block.id, { checked: event.target.checked })}
                        className="mt-[6px] h-4 w-4 shrink-0 cursor-pointer accent-[#2383e2]"
                        aria-label="Toggle task"
                      />
                    )}
                    {block.type === "callout" && <Lightbulb className="mt-1 h-4 w-4 shrink-0" />}
                    <textarea
                      ref={(element) => {
                        if (!element) {
                          textareaRefs.current.delete(block.id);
                          return;
                        }
                        textareaRefs.current.set(block.id, element);
                        element.style.height = "auto";
                        element.style.height = `${element.scrollHeight}px`;
                      }}
                      rows={1}
                      value={block.text}
                      placeholder={block.type === "paragraph" ? "Type '/' for commands" : ""}
                      onChange={(event) => handleTextChange(block, event.target.value)}
                      onKeyDown={(event) => handleKeyDown(event, block)}
                      className={cn(
                        "block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-foreground outline-none placeholder:text-muted-foreground/45",
                        block.type === "heading1" && "text-[30px] font-semibold leading-9 tracking-tight",
                        block.type === "heading2" && "text-[24px] font-semibold leading-8 tracking-tight",
                        block.type === "heading3" && "text-[20px] font-semibold leading-7",
                        (block.type === "paragraph" || block.type === "bulleted" || block.type === "numbered") && "text-[16px] leading-6",
                        block.type === "todo" && "text-[16px] leading-6",
                        block.checked && "text-muted-foreground line-through",
                        block.type === "quote" && "font-serif text-[17px] leading-7",
                        block.type === "code" && "font-mono text-[13.5px] leading-6",
                        block.type === "callout" && "text-[15px] leading-6",
                      )}
                    />
                  </div>
                )}

                {isSlashOpen && (
                  <div className="absolute left-0 top-full z-30 mt-1 w-[300px] overflow-hidden rounded-[8px] border border-border bg-white p-1.5 shadow-notion-200">
                    <p className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Basic blocks</p>
                    <div className="notion-scroll max-h-64 overflow-y-auto">
                      {filteredOptions.map((option, index) => (
                        <button
                          key={option.type}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => applySlash(option.type, block.id)}
                          onMouseEnter={() => setSlash({ ...slash, index })}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-[4px] px-2 py-1.5 text-left",
                            index === slash.index && "bg-accent",
                          )}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-border bg-white text-muted-foreground">
                            <option.icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[13px] font-medium">{option.label}</span>
                            <span className="block truncate text-[11px] text-muted-foreground">{option.description}</span>
                          </span>
                        </button>
                      ))}
                      {filteredOptions.length === 0 && (
                        <p className="px-2 py-3 text-[12px] text-muted-foreground">No matching blocks</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => insertAfter(blocks[blocks.length - 1]?.id ?? "", "paragraph")}
        className="mt-2 flex h-8 w-full items-center gap-2 rounded-[4px] px-1 text-left text-[14px] text-muted-foreground/60 transition-colors hover:bg-accent/60 hover:text-muted-foreground"
      >
        <Plus className="h-4 w-4" />
        Click to add a block
      </button>
    </div>
  );
}
