"use client";

import * as React from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { CACHE, workspacePageHref } from "@/lib/constants";
import { useLocalStorageState } from "@/lib/hooks/use-local-storage";
import type { PageSummary } from "@/lib/seed";
import { formatRelativeDate } from "@/lib/utils";

type Comment = { id: string; pageId: string; author: string; text: string; createdAt: string };

const EMPTY_COMMENTS: Record<string, Comment[]> = {};

export function CommentsClient({
  pages,
  initialPageId,
}: {
  pages: PageSummary[];
  initialPageId?: string;
}) {
  const [pageId, setPageId] = React.useState(
    initialPageId && pages.some((page) => page.id === initialPageId)
      ? initialPageId
      : pages[0]?.id ?? "",
  );
  const [author, setAuthor] = React.useState("You");
  const [text, setText] = React.useState("");
  const [comments, setComments, hydrated] = useLocalStorageState<Record<string, Comment[]>>(
    `${CACHE.commentsPrefix}all`,
    EMPTY_COMMENTS,
  );

  const pageComments = comments[pageId] ?? [];
  const selectedPage = pages.find((page) => page.id === pageId);

  function addComment(event: React.FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value || !pageId) return;
    const comment: Comment = {
      id: `comment-${Date.now().toString(36)}`,
      pageId,
      author: author.trim() || "You",
      text: value,
      createdAt: new Date().toISOString(),
    };
    setComments((current) => ({
      ...current,
      [pageId]: [comment, ...(current[pageId] ?? [])],
    }));
    setText("");
  }

  if (!pages.length) {
    return <EmptyState icon="💬" title="No pages yet" description="Create a page before leaving a comment." />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="rounded-[10px] border border-border bg-white p-2 shadow-notion-100">
        <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Pages</p>
        <div className="notion-scroll max-h-[520px] space-y-0.5 overflow-y-auto">
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => setPageId(page.id)}
              className={`flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-left text-[13px] hover:bg-accent ${
                page.id === pageId ? "bg-sidebar-active font-medium" : ""
              }`}
            >
              <span className="text-[15px] leading-none">{page.icon}</span>
              <span className="min-w-0 flex-1 truncate">{page.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        {selectedPage && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-[8px] border border-border bg-white px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-[18px]">{selectedPage.icon}</span>
              <span className="truncate text-[14px] font-medium">{selectedPage.title}</span>
            </div>
            <Button variant="link" size="sm" asChild>
              <Link href={workspacePageHref(selectedPage.id)}>Open page</Link>
            </Button>
          </div>
        )}

        <form onSubmit={addComment} className="mb-5 rounded-[10px] border border-border bg-white p-4 shadow-notion-100">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row">
            <Input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Your name"
              aria-label="Your name"
              className="sm:max-w-48"
            />
          </div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            placeholder="Leave a comment…"
            aria-label="Comment text"
            className="w-full resize-none rounded-[6px] border border-border bg-white p-3 text-[14px] outline-none focus:border-[#b9a1e8]"
          />
          <div className="mt-3 flex justify-end">
            <Button type="submit" variant="blue" size="sm" disabled={!text.trim()}>
              Post comment
            </Button>
          </div>
        </form>

        {hydrated && pageComments.length ? (
          <div className="space-y-3">
            {pageComments.map((comment) => (
              <article key={comment.id} className="rounded-[8px] border border-border bg-white p-4 shadow-notion-100">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-[13px] font-semibold">{comment.author}</span>
                  <span className="text-[11px] text-muted-foreground">{formatRelativeDate(comment.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap text-[14px] leading-6">{comment.text}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<MessageSquare className="h-8 w-8 text-muted-foreground" />}
            title={hydrated ? "No comments yet" : "Loading comments…"}
            description="Comments are stored locally for this browser."
          />
        )}
      </div>
    </div>
  );
}
