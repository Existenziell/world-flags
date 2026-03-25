"use client";

import type { MapStyleOption, MapProjection, ThemeOption } from "@/src/types/map-settings";
import { MAP_STYLE_OPTIONS, PROJECTION_OPTIONS, THEME_OPTIONS } from "@/src/constants";
import type { SettingsOverlayProps } from "@/src/types/settings-overlay";

export function SettingsOverlay({ settings, onChange, onClose, hideMapStyle = false }: SettingsOverlayProps) {
  return (
    <aside className="absolute right-4 top-16 z-50 max-h-[calc(100vh-5rem)] w-80 overflow-y-auto rounded-xl border border-black/10 bg-white/95 p-4 text-zinc-900 shadow-2xl backdrop-blur dark:border-white/15 dark:bg-zinc-900/95 dark:text-zinc-100">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Settings</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-zinc-500 transition hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Close settings overlay"
        >
          ✕
        </button>
      </div>

      <label className="mb-1 block text-sm font-medium">Projection</label>
      <select
        value={settings.projection}
        onChange={(event) =>
          onChange({ ...settings, projection: event.target.value as MapProjection })
        }
        className="mb-3 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      >
        {PROJECTION_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {!hideMapStyle ? (
        <>
          <label className="mb-1 block text-sm font-medium">Map style</label>
          <select
            value={settings.mapStyle}
            onChange={(event) =>
              onChange({ ...settings, mapStyle: event.target.value as MapStyleOption })
            }
            className="mb-3 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            {MAP_STYLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </>
      ) : null}

      <label className="mb-1 block text-sm font-medium">Theme</label>
      <div className="grid grid-cols-2 gap-2">
        {THEME_OPTIONS.map((option) => {
          const isActive = settings.theme === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange({ ...settings, theme: option as ThemeOption })}
              className={`rounded border px-2 py-1.5 text-sm capitalize transition ${
                isActive
                  ? "border-teal-500 bg-teal-500/15 text-teal-700 dark:text-teal-300"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

    </aside>
  );
}
