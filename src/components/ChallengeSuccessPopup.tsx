"use client";

import Image from "next/image";
import type { ChallengeSuccessPopupProps } from "@/src/types/world-flags";

export function ChallengeSuccessPopup({
  score,
  completedRounds,
  totalRounds,
  attemptsForRound,
  selectedFlagPath,
  selectedFlagName,
}: ChallengeSuccessPopupProps) {
  return (
    <div className="absolute left-1/2 top-6 z-50 -translate-x-1/2 rounded-xl border border-emerald-400 bg-emerald-700/95 px-5 py-3 text-center shadow-2xl ring-1 ring-emerald-200/50 backdrop-blur dark:border-emerald-300 dark:bg-emerald-500/95 dark:ring-emerald-950/30">
      <p className="text-base font-bold tracking-wide text-white">Correct!</p>
      <p className="mt-1 text-sm font-medium text-emerald-50 dark:text-white">
        Score {score} | Round {completedRounds}/{totalRounds} | Tries {attemptsForRound}
      </p>
      {selectedFlagPath ? (
        <div className="mt-2 flex justify-center">
          <Image
            src={selectedFlagPath}
            alt={`Selected flag${selectedFlagName ? `: ${selectedFlagName}` : ""}`}
            width={72}
            height={48}
            className="h-auto w-[72px] rounded border border-white/40 shadow-md"
          />
        </div>
      ) : null}
    </div>
  );
}
