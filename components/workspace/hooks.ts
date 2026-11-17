"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CACHE, QUERY_KEYS } from "@/lib/constants";
import type { PageBlock, PageSummary, WorkspacePage } from "@/lib/seed";
import type { CreatePageInput } from "@/lib/validation";

export const queryKeys = QUERY_KEYS;

function readLocal<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or disabled - the in-memory React Query cache still works */
  }
}

function removeLocal(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* storage disabled */
  }
}

export function readCachedPage(id: string) {
  return readLocal<WorkspacePage>(`${CACHE.pagePrefix}${id}`);
}

export function writeCachedPage(page: WorkspacePage) {
  writeLocal(`${CACHE.pagePrefix}${page.id}`, page);
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return (await response.json()) as T;
}

type PagesResponse = { pages: PageSummary[]; source: "postgres" | "seed" };
type CreatePagePayload = CreatePageInput & { blocks?: PageBlock[] };

export function usePageList(
  initialPages?: PageSummary[],
  initialSource: "postgres" | "seed" = "seed",
) {
  return useQuery({
    queryKey: QUERY_KEYS.pageList(""),
    queryFn: async () => {
      const data = await fetchJson<PagesResponse>("/api/pages");
      writeLocal(CACHE.pageListKey, data.pages);
      return data;
    },
    initialData: initialPages
      ? ({ pages: initialPages, source: initialSource } satisfies PagesResponse)
      : undefined,
    placeholderData: () => {
      const cached = readLocal<PageSummary[]>(CACHE.pageListKey);
      return cached ? { pages: cached, source: "seed" as const } : undefined;
    },
  });
}

export function usePage(id: string | null, initialPage?: WorkspacePage | null) {
  return useQuery({
    queryKey: QUERY_KEYS.page(id ?? "none"),
    enabled: Boolean(id),
    queryFn: async () => {
      const cached = id ? readCachedPage(id) : null;
      if (cached) return cached;
      const data = await fetchJson<{ page: WorkspacePage }>(
        `/api/pages/${encodeURIComponent(id ?? "")}`,
      );
      writeCachedPage(data.page);
      return data.page;
    },
    initialData: initialPage ?? undefined,
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<WorkspacePage> }) => {
      const data = await fetchJson<{ page: WorkspacePage }>(`/api/pages/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      return data.page;
    },
    onSuccess: (page) => {
      queryClient.setQueryData(QUERY_KEYS.page(page.id), page);
      writeCachedPage(page);
      queryClient.setQueriesData<PagesResponse>({ queryKey: ["pages"] }, (old) =>
        old
          ? {
              ...old,
              pages: old.pages.map((item) =>
                item.id === page.id
                  ? {
                      ...item,
                      title: page.title,
                      icon: page.icon,
                      favorite: page.favorite,
                      parentId: page.parentId,
                      updatedAt: page.updatedAt,
                    }
                  : item,
              ),
            }
          : old,
      );
      const cachedList = readLocal<PageSummary[]>(CACHE.pageListKey);
      if (cachedList) {
        writeLocal(
          CACHE.pageListKey,
          cachedList.map((item) =>
            item.id === page.id
              ? {
                  ...item,
                  title: page.title,
                  icon: page.icon,
                  favorite: page.favorite,
                  parentId: page.parentId,
                  updatedAt: page.updatedAt,
                }
              : item,
          ),
        );
      }
    },
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: string | CreatePagePayload) => {
      const payload: CreatePagePayload =
        typeof input === "string" ? { title: input, icon: "📄" } : input;
      const data = await fetchJson<{ page: WorkspacePage }>("/api/pages", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return data.page;
    },
    onSuccess: (page) => {
      queryClient.setQueriesData<PagesResponse>({ queryKey: ["pages"] }, (old) =>
        old
          ? {
              ...old,
              pages: [
                {
                  id: page.id,
                  title: page.title,
                  icon: page.icon,
                  parentId: page.parentId,
                  favorite: page.favorite,
                  cover: page.cover,
                  updatedAt: page.updatedAt,
                },
                ...old.pages,
              ],
            }
          : old,
      );
      writeCachedPage(page);
    },
  });
}

export function useTrashPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const data = await fetchJson<{ page: WorkspacePage }>(`/api/pages/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      return data.page;
    },
    onSuccess: (page) => {
      removeLocal(`${CACHE.pagePrefix}${page.id}`);
      queryClient.removeQueries({ queryKey: QUERY_KEYS.page(page.id) });
      queryClient.setQueriesData<PagesResponse>({ queryKey: ["pages"] }, (old) =>
        old ? { ...old, pages: old.pages.filter((item) => item.id !== page.id) } : old,
      );
      const cachedList = readLocal<PageSummary[]>(CACHE.pageListKey);
      if (cachedList) {
        writeLocal(
          CACHE.pageListKey,
          cachedList.filter((item) => item.id !== page.id),
        );
      }
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trashedPages });
    },
  });
}

export function useRestorePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const data = await fetchJson<{ page: WorkspacePage }>(
        `/api/pages/${encodeURIComponent(id)}/restore`,
        { method: "POST" },
      );
      return data.page;
    },
    onSuccess: (page) => {
      writeCachedPage(page);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pageList("") });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trashedPages });
    },
  });
}

export function useDebouncedValue<T>(value: T, delay = 220) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
