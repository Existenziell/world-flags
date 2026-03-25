"use client";

import type { AppMode, ChallengeHistoryEntry, ChallengeRoundCountOption } from "@/src/types/world-flags";
import { getChallengeModeLabel } from "@/src/lib/challenge-mode-label";

type ModeSelectOverlayProps = {
  selectedMode: AppMode;
  selectedRoundTarget: ChallengeRoundCountOption;
  history: ChallengeHistoryEntry[];
  onModeChange: (mode: AppMode) => void;
  onRoundTargetChange: (target: ChallengeRoundCountOption) => void;
  onStart: () => void;
};

export function ModeSelectOverlay({
  selectedMode,
  selectedRoundTarget,
  history,
  onModeChange,
  onRoundTargetChange,
  onStart,
}: ModeSelectOverlayProps) {
  const recentHistory = history.slice(0, 3);
  const challengeSelected = selectedMode !== "explore";

  return (
    <aside className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-zinc-950/95 p-6 text-zinc-100 shadow-2xl">
        <h2 className="text-2xl font-semibold">Choose a mode</h2>
        <p className="mt-1 text-sm text-zinc-300">
          Explore countries freely or start a challenge run with score tracking.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onModeChange("explore")}
            className={`rounded-xl border p-4 text-left transition ${selectedMode === "explore"
              ? "border-teal-400 bg-teal-500/20"
              : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}
          >
            <h3 className="font-semibold">Explore</h3>
            <p className="mt-1 text-xs text-zinc-300">Freely explore the world map and the flags</p>
          </button>

          <button
            type="button"
            onClick={() => onModeChange("challenge1")}
            className={`rounded-xl border p-4 text-left transition ${selectedMode === "challenge1"
              ? "border-teal-400 bg-teal-500/20"
              : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}
          >
            <h3 className="font-semibold">Find the country</h3>
            <p className="mt-1 text-xs text-zinc-300">Find the country name for the given flag</p>
          </button>

          <button
            type="button"
            onClick={() => onModeChange("challenge2")}
            className={`rounded-xl border p-4 text-left transition ${selectedMode === "challenge2"
              ? "border-teal-400 bg-teal-500/20"
              : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}
          >
            <h3 className="font-semibold">Find the flag</h3>
            <p className="mt-1 text-xs text-zinc-300">Let&apos;s see if you can find the flag for the country</p>
          </button>
        </div>

        {challengeSelected ? (
          <div className="mt-5">
            <label htmlFor="round-target" className="mb-1 block text-sm font-medium">
              Number of rounds
            </label>
            <select
              id="round-target"
              value={selectedRoundTarget}
              onChange={(event) =>
                onRoundTargetChange(
                  event.target.value === "all"
                    ? "all"
                    : (Number(event.target.value) as ChallengeRoundCountOption),
                )
              }
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm"
            >
              <option value={1}>1</option>
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="all">all</option>
            </select>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onStart}
          className="mt-6 w-full rounded-lg bg-teal-500 px-4 py-2.5 font-semibold text-zinc-900 transition hover:bg-teal-400"
        >
          Start
        </button>

        {recentHistory.length ? (
          <section className="mt-6 rounded-lg border border-white/10 bg-white/5 p-3">
            <h3 className="text-sm font-semibold">Recent challenge runs</h3>
            <ul className="mt-2 space-y-1 text-xs text-zinc-300">
              {recentHistory.map((entry) => (
                <li key={entry.id}>
                  {getChallengeModeLabel(entry.mode)} - {entry.summary.score}/{entry.summary.totalRounds} points - avg
                  tries{" "}
                  {entry.summary.averageAttemptsPerRound.toFixed(2)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
