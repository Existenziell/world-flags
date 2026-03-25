import { CHALLENGE_SETUP_STORAGE_KEY } from "@/src/constants";
import type { AppMode, ChallengeRoundCountOption } from "@/src/types/world-flags";

export type ChallengeSetup = {
  mode: AppMode;
  roundTarget: ChallengeRoundCountOption;
};

export function parseChallengeSetupFromStorage(): ChallengeSetup {
  if (typeof window === "undefined") {
    return { mode: "explore", roundTarget: 20 };
  }
  const raw = window.localStorage.getItem(CHALLENGE_SETUP_STORAGE_KEY);
  if (!raw) {
    return { mode: "explore", roundTarget: 20 };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<ChallengeSetup>;
    const mode = parsed.mode ?? "explore";
    const roundTarget = parsed.roundTarget ?? 20;
    return { mode, roundTarget };
  } catch {
    return { mode: "explore", roundTarget: 20 };
  }
}
