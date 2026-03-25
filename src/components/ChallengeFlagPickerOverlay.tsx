"use client";

import Image from "next/image";
import type { ChallengeFlagPickerOverlayProps } from "@/src/types/world-flags";

export function ChallengeFlagPickerOverlay({
  countryName,
  options,
  selectedWrongIso2,
  selectedCorrectIso2,
  onPick,
  onClose,
}: ChallengeFlagPickerOverlayProps) {
  return (
    <aside className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-2xl border border-black/20 bg-white/95 p-5 text-zinc-900 shadow-2xl dark:border-white/20 dark:bg-zinc-950/95 dark:text-zinc-100">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Select flag for: {countryName}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-black/20 px-2 py-1 text-sm dark:border-white/20"
            aria-label="Close flag picker"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {options.map((option) => {
            const isWrong = selectedWrongIso2.includes(option.iso2);
            const isCorrect = selectedCorrectIso2 === option.iso2;
            return (
              <button
                key={option.iso2}
                type="button"
                onClick={() => onPick(option)}
                className={`rounded-md border p-1 transition ${
                  isCorrect
                    ? "border-emerald-500 bg-emerald-500/10"
                    : isWrong
                      ? "border-red-500 bg-red-500/10"
                      : "border-black/20 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/5"
                }`}
              >
                <Image
                  src={option.flagPath}
                  alt={`${option.name} flag`}
                  width={640}
                  height={400}
                  className="h-auto w-full rounded-sm object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
