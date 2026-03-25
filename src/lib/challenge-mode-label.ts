import type { ChallengeHistoryEntry } from "@/src/types/world-flags";

export function getChallengeModeLabel(mode: ChallengeHistoryEntry["mode"]): string {
  return mode === "challenge1" ? "Find the country" : "Find the flag";
}
