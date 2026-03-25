"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CHALLENGE_HISTORY_MAX_ENTRIES, CHALLENGE_HISTORY_STORAGE_KEY } from "@/src/constants";
import type { ChallengeHistoryEntry } from "@/src/types/world-flags";

function parseHistory(value: string | null): ChallengeHistoryEntry[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((entry): entry is ChallengeHistoryEntry => {
      return (
        typeof entry === "object" &&
        entry !== null &&
        typeof entry.id === "string" &&
        typeof entry.mode === "string" &&
        typeof entry.startedAt === "string" &&
        typeof entry.completedAt === "string" &&
        typeof entry.summary === "object" &&
        Array.isArray(entry.rounds)
      );
    });
  } catch {
    return [];
  }
}

export function useChallengeHistory() {
  const [history, setHistory] = useState<ChallengeHistoryEntry[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      setHistory(parseHistory(window.localStorage.getItem(CHALLENGE_HISTORY_STORAGE_KEY)));
    });
  }, []);

  const addEntry = useCallback(
    (entry: ChallengeHistoryEntry) => {
      setHistory((current) => {
        const next = [entry, ...current].slice(0, CHALLENGE_HISTORY_MAX_ENTRIES);
        window.localStorage.setItem(CHALLENGE_HISTORY_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const api = useMemo(
    () => ({
      history,
      addEntry,
    }),
    [addEntry, history],
  );

  return api;
}
