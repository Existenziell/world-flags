"use client";

import { normalizeChallengeAnswer } from "@/src/lib/challenge-answer";
import type { CountryNameSuggestionsDropdownProps } from "@/src/types/world-flags";

export function CountryNameSuggestionsDropdown({
  query,
  countries,
  isOpen,
  onSelect,
  maxItems = 12,
}: CountryNameSuggestionsDropdownProps) {
  if (!isOpen) {
    return null;
  }

  const normalizedQuery = normalizeChallengeAnswer(query);
  if (normalizedQuery.length < 1) {
    return null;
  }

  const suggestions = countries
    .filter((countryName) => normalizeChallengeAnswer(countryName).startsWith(normalizedQuery))
    .slice(0, maxItems);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <ul
      role="listbox"
      aria-label="Country suggestions"
      className="absolute bottom-full left-0 z-50 mb-1 max-h-56 w-full overflow-auto rounded-md border border-zinc-300 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
    >
      {suggestions.map((countryName) => (
        <li key={countryName} role="option" aria-selected={false}>
          <button
            type="button"
            onClick={() => onSelect(countryName)}
            className="w-full rounded-sm px-2 py-1 text-left text-sm text-zinc-900 transition hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-700"
          >
            {countryName}
          </button>
        </li>
      ))}
    </ul>
  );
}
