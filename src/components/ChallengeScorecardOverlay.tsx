"use client";

import { getChallengeModeLabel } from "@/src/lib/challenge-mode-label";
import type { ChallengeScorecardOverlayProps } from "@/src/types/world-flags";

export function ChallengeScorecardOverlay({
  modeLabel,
  summary,
  latestHistory,
  onPlayAgain,
  onBackToModes,
}: ChallengeScorecardOverlayProps) {
  return (
    <aside className="absolute inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-black/20 bg-white/95 p-6 text-zinc-900 shadow-2xl dark:border-white/20 dark:bg-zinc-950/95 dark:text-zinc-100">
        <h2 className="text-2xl font-semibold">{modeLabel} scorecard</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <Metric label="Points" value={`${summary.score}`} />
          <Metric label="Rounds" value={`${summary.totalCorrect}/${summary.totalRounds}`} />
          <Metric label="Accuracy" value={`${Math.round((summary.totalCorrect / summary.totalRounds) * 100)}%`} />
          <Metric label="Total tries" value={`${summary.totalAttempts}`} />
          <Metric label="Avg tries/flag" value={summary.averageAttemptsPerRound.toFixed(2)} />
          <Metric
            label="Best pace"
            value={`${Math.max(0, summary.totalRounds - (summary.totalAttempts - summary.totalRounds))} first-try`}
          />
        </div>

        {summary.hardestRounds.length > 3 ? (
          <section className="mt-5">
            <h3 className="text-sm font-semibold">Hardest flags</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
              {summary.hardestRounds.slice(0, 5).map((round) => (
                <li key={round.iso2}>
                  {round.countryName}: {round.attempts} tries
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {latestHistory.length ? (
          <section className="mt-5">
            <h3 className="text-sm font-semibold">Recent runs</h3>
            <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
              {latestHistory.slice(0, 5).map((entry) => (
                <li key={entry.id}>
                  {getChallengeModeLabel(entry.mode)} - {entry.summary.score}/{entry.summary.totalRounds} points -
                  avg tries{" "}
                  {entry.summary.averageAttemptsPerRound.toFixed(2)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 rounded-md bg-teal-500 px-4 py-2 font-semibold text-zinc-900 transition hover:bg-teal-400"
          >
            Play again
          </button>
          <button
            type="button"
            onClick={onBackToModes}
            className="flex-1 rounded-md border border-black/20 px-4 py-2 font-semibold dark:border-white/20"
          >
            Back to modes
          </button>
        </div>
      </div>
    </aside>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-md border border-black/10 bg-black/[0.03] p-3 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-xs text-zinc-600 dark:text-zinc-300">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
