"use client";

import * as React from "react";

const SERVER_SNAPSHOT: unique symbol = Symbol("local-storage-server");
const memoryStore = new Map<string, string>();
const listeners = new Set<() => void>();

type Snapshot = string | null | typeof SERVER_SNAPSHOT;

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(key: string) {
  return (listener: () => void) => {
    if (typeof window === "undefined") return () => undefined;

    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      if (event.key && event.key === key) memoryStore.delete(key);
      listener();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };
}

function readSnapshot(key: string): Snapshot {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) return raw;
  } catch {
    /* storage disabled - use the in-memory fallback */
  }
  return memoryStore.get(key) ?? null;
}

function parseSnapshot<T>(
  snapshot: Snapshot,
  initialValue: T,
  deserialize?: (raw: string) => T,
): T {
  if (snapshot === null || typeof snapshot === "symbol") return initialValue;
  try {
    return deserialize ? deserialize(snapshot) : (JSON.parse(snapshot) as T);
  } catch {
    return initialValue;
  }
}

/**
 * State mirrored to localStorage without calling setState from an effect.
 * Server rendering and hydration always use `initialValue`; the stored value
 * is applied after hydration via useSyncExternalStore.
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  options: { deserialize?: (raw: string) => T } = {},
) {
  const { deserialize } = options;
  const subscribeToKey = React.useMemo(() => subscribe(key), [key]);
  const snapshot = React.useSyncExternalStore(
    subscribeToKey,
    () => readSnapshot(key),
    (): typeof SERVER_SNAPSHOT => SERVER_SNAPSHOT,
  );
  const value = React.useMemo(
    () => parseSnapshot(snapshot, initialValue, deserialize),
    [deserialize, initialValue, snapshot],
  );

  const setValue = React.useCallback(
    (next: React.SetStateAction<T>) => {
      if (typeof window === "undefined") return;
      const previous = parseSnapshot(snapshot, initialValue, deserialize);
      const resolved =
        typeof next === "function" ? (next as (current: T) => T)(previous) : next;
      const serialized = JSON.stringify(resolved);
      memoryStore.set(key, serialized);
      try {
        window.localStorage.setItem(key, serialized);
      } catch {
        /* storage disabled - the in-memory fallback still works */
      }
      notify();
    },
    [deserialize, initialValue, key, snapshot],
  );

  return [value, setValue, snapshot !== SERVER_SNAPSHOT] as const;
}
