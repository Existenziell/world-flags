import { renderHook } from "@testing-library/react";
import { act } from "react";
import { CHALLENGE_HISTORY_STORAGE_KEY } from "@/src/constants";
import { useChallengeHistory } from "@/src/hooks/useChallengeHistory";
import type { ChallengeHistoryEntry } from "@/src/types/world-flags";

function buildEntry(id: string): ChallengeHistoryEntry {
  return {
    id,
    mode: "challenge1",
    roundTarget: 10,
    startedAt: "2026-01-01T00:00:00.000Z",
    completedAt: "2026-01-01T00:10:00.000Z",
    summary: {
      totalRounds: 10,
      totalCorrect: 10,
      score: 10,
      totalAttempts: 12,
      averageAttemptsPerRound: 1.2,
      hardestRounds: [],
    },
    rounds: [],
  };
}

describe("useChallengeHistory", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("queueMicrotask", (callback: () => void) => {
      callback();
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds entries and persists them", () => {
    const { result } = renderHook(() => useChallengeHistory());

    act(() => {
      result.current.addEntry(buildEntry("1"));
    });

    expect(result.current.history).toHaveLength(1);
    const stored = window.localStorage.getItem(CHALLENGE_HISTORY_STORAGE_KEY);
    expect(stored).toContain('"id":"1"');
  });
});
