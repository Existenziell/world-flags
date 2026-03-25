"use client";

import { useState } from "react";
import { CountryNameSuggestionsDropdown } from "@/src/components/CountryNameSuggestionsDropdown";
import type { ChallengeTypeInputBarProps } from "@/src/types/world-flags";

export function ChallengeTypeInputBar({
  value,
  countrySuggestions,
  roundLabel,
  attemptCount,
  isCorrect,
  isIncorrect,
  onChange,
  onSelectSuggestion,
  onSubmit,
  onSkip,
}: ChallengeTypeInputBarProps) {
  const [isSuggestionDismissed, setIsSuggestionDismissed] = useState(false);

  return (
    <form
      className={`absolute bottom-4 left-1/2 z-40 w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border bg-white/90 p-3 shadow-xl backdrop-blur dark:bg-zinc-900/90 ${isIncorrect
        ? "border-2 border-red-500"
        : "border-black/20 dark:border-white/20"
        }`}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p className="mb-2 text-sm">{roundLabel}</p>
      <label htmlFor="country-name-input" className="mb-2 block text-sm font-medium">
        Enter the country name
      </label>
      <div className="flex items-start gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            id="country-name-input"
            type="text"
            value={value}
            onChange={(event) => {
              setIsSuggestionDismissed(false);
              onChange(event.target.value);
            }}
            className={`min-w-0 w-full rounded-md border px-3 py-2 text-sm outline-none transition ${isCorrect
              ? "border-emerald-500 bg-emerald-500/10"
              : isIncorrect
                ? "border-red-500 bg-red-500/10"
                : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800"
              }`}
            placeholder="Type country name..."
            autoComplete="off"
          />
          <CountryNameSuggestionsDropdown
            query={value}
            countries={countrySuggestions}
            isOpen={value.trim().length >= 1 && !isSuggestionDismissed}
            onSelect={(countryName) => {
              onSelectSuggestion(countryName);
              setIsSuggestionDismissed(true);
            }}
          />
        </div>
        <div className="flex flex-col items-start gap-1">
          <button
            type="submit"
            className="rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-teal-400"
          >
            Check
          </button>
        </div>
      </div>
      <div className="mt-2 mr-6 flex items-center justify-between gap-2">
        <p className="text-xs text-zinc-600 dark:text-zinc-300">Tries this flag: {attemptCount}</p>
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-medium text-teal-700 underline underline-offset-2 transition hover:text-teal-600 dark:text-teal-300 dark:hover:text-teal-200"
        >
          Skip
        </button>
      </div>
    </form>
  );
}
