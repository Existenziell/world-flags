"use client";

import { useId, useMemo, useState } from "react";
import type { MapProjection, MapStyleOption, ThemeOption } from "@/src/types/map-settings";
import type { CountryFilterTriState, WasColonizedFilter } from "@/src/types/country-filters";
import { DEFAULT_COUNTRY_FILTERS, MAP_STYLE_OPTIONS, PROJECTION_OPTIONS, THEME_OPTIONS } from "@/src/constants";
import { countryFiltersAreDefault } from "@/src/lib/country-filters";
import { allCountries } from "@/src/lib/country-lookup";
import { sortAspectRatioLabels } from "@/src/lib/sort-aspect-ratio-labels";
import type { SettingsOverlayProps } from "@/src/types/settings-overlay";

const filterRadioClass =
  "h-3.5 w-3.5 shrink-0 cursor-pointer border-zinc-400 accent-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-zinc-500 dark:accent-teal-400";

const filterCheckboxClass =
  "h-3.5 w-3.5 shrink-0 cursor-pointer rounded border border-zinc-400 accent-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-zinc-500 dark:accent-teal-400";

function FilterRadioGroup<T extends string>({
  groupName,
  legend,
  value,
  options,
  onChange,
  disabled,
  orientation = "horizontal",
}: {
  groupName: string;
  legend: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (next: T) => void;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">{legend}</legend>
      <div
        className={
          orientation === "horizontal"
            ? "flex flex-wrap gap-x-3 gap-y-1.5"
            : "flex max-h-32 flex-col gap-1.5 overflow-y-auto pr-0.5"
        }
      >
        {options.map((opt) => (
          <label
            key={String(opt.value)}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-200"
          >
            <input
              type="radio"
              name={groupName}
              className={filterRadioClass}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              disabled={disabled}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function TriStateRadios({
  label,
  groupName,
  value,
  onChange,
  disabled,
}: {
  label: string;
  groupName: string;
  value: CountryFilterTriState;
  onChange: (next: CountryFilterTriState) => void;
  disabled?: boolean;
}) {
  return (
    <FilterRadioGroup
      groupName={groupName}
      legend={label}
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={[
        { value: "any", label: "Any" },
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ]}
    />
  );
}

export function SettingsOverlay({
  settings,
  onChange,
  onClose,
  hideMapStyle = false,
  showCountryFilters = false,
  exploreMarkerCount = null,
}: SettingsOverlayProps) {
  const filterFieldId = useId();
  const [groupsOpen, setGroupsOpen] = useState(true);
  const [geoOpen, setGeoOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);

  const { continentOptions, regionOptions, subregionOptions, aspectRatioOptions } = useMemo(() => {
    const continents = new Set<string>();
    const regions = new Set<string>();
    const subregions = new Set<string>();
    const ratios = new Set<string>();
    for (const country of allCountries) {
      for (const ct of country.continents) {
        continents.add(ct);
      }
      if (country.region) {
        regions.add(country.region);
      }
      if (country.subregion) {
        subregions.add(country.subregion);
      }
      if (country.flag?.aspectRatio) {
        ratios.add(country.flag.aspectRatio);
      }
    }
    return {
      continentOptions: [...continents].sort((a, b) => a.localeCompare(b)),
      regionOptions: [...regions].sort((a, b) => a.localeCompare(b)),
      subregionOptions: [...subregions].sort((a, b) => a.localeCompare(b)),
      aspectRatioOptions: sortAspectRatioLabels([...ratios]),
    };
  }, []);

  const cf = settings.countryFilters;
  const filtersAreDefault = countryFiltersAreDefault(cf);

  const patchFilters = (partial: Partial<typeof cf>) => {
    onChange({
      ...settings,
      countryFilters: { ...cf, ...partial },
    });
  };

  const toggleContinent = (name: string) => {
    const next = new Set(cf.continents);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    patchFilters({ continents: [...next] });
  };

  const toggleAspectRatio = (ratio: string) => {
    const next = new Set(cf.flagAspectRatios);
    if (next.has(ratio)) {
      next.delete(ratio);
    } else {
      next.add(ratio);
    }
    patchFilters({ flagAspectRatios: [...next] });
  };

  return (
    <aside className="absolute right-4 top-4 z-50 w-80 max-h-[calc(100vh-2rem)] overflow-hidden rounded-xl border border-black/10 bg-white/95 text-zinc-900 shadow-2xl backdrop-blur dark:border-white/15 dark:bg-zinc-900/95 dark:text-zinc-100">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-0 top-0 z-10 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/30 bg-white/95 p-0 text-lg leading-none text-zinc-700 shadow-lg transition hover:scale-105 dark:border-white/30 dark:bg-zinc-900/95 dark:text-zinc-200 dark:hover:text-zinc-50"
        aria-label="Close settings overlay"
      >
        ✕
      </button>
      <div className="max-h-[calc(100vh-2rem)] overflow-y-auto px-4 pb-4 pt-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Settings</h2>
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
        <div className="mb-4 grid grid-cols-2 gap-2">
          {THEME_OPTIONS.map((option) => {
            const isActive = settings.theme === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange({ ...settings, theme: option as ThemeOption })}
                className={`rounded border px-2 py-1.5 text-sm capitalize transition ${isActive
                  ? "border-teal-500 bg-teal-500/15 text-teal-700 dark:text-teal-300"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                  }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {showCountryFilters ? (
          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
            <div className="mb-4 flex items-start justify-between gap-2">
              <h3
                className="text-lg font-semibold"
                aria-label={
                  exploreMarkerCount !== null && exploreMarkerCount !== undefined
                    ? `Filters (${exploreMarkerCount})`
                    : "Filters"
                }
              >
                <span className="text-zinc-900 dark:text-zinc-100">Filters</span>
                {exploreMarkerCount !== null && exploreMarkerCount !== undefined ? (
                  <span className="font-normal text-xs text-zinc-500 dark:text-zinc-400">
                    {" "}
                    ({exploreMarkerCount} countries)
                  </span>
                ) : null}
              </h3>
              <button
                type="button"
                disabled={filtersAreDefault}
                onClick={() =>
                  onChange({
                    ...settings,
                    countryFilters: { ...DEFAULT_COUNTRY_FILTERS },
                  })
                }
                className={
                  filtersAreDefault
                    ? "shrink-0 cursor-not-allowed text-sm text-zinc-400 dark:text-zinc-500"
                    : "shrink-0 text-sm text-teal-600 underline-offset-2 hover:underline dark:text-teal-400"
                }
                aria-label="Clear all filters"
              >
                Clear
              </button>
            </div>

            <div className="space-y-3">
              {exploreMarkerCount !== null && exploreMarkerCount === 0 ? (
                <p className="rounded border border-amber-400/60 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-900 dark:border-amber-500/40 dark:text-amber-100">
                  No countries match; widen filters to see flags on the map.
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Min population
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    placeholder="—"
                    value={cf.populationMin ?? ""}
                    onChange={(event) => {
                      const raw = event.target.value;
                      patchFilters({
                        populationMin: raw === "" ? null : Math.max(0, Number.parseInt(raw, 10) || 0),
                      });
                    }}
                    className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </label>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Max population
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    placeholder="—"
                    value={cf.populationMax ?? ""}
                    onChange={(event) => {
                      const raw = event.target.value;
                      patchFilters({
                        populationMax: raw === "" ? null : Math.max(0, Number.parseInt(raw, 10) || 0),
                      });
                    }}
                    className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </label>
              </div>

              <FilterRadioGroup
                groupName={`${filterFieldId}-was-colonized`}
                legend="Was colonized (historical)"
                value={cf.wasColonized}
                onChange={(v) => patchFilters({ wasColonized: v as WasColonizedFilter })}
                options={[
                  { value: "any", label: "Any" },
                  { value: "yes", label: "Yes (known)" },
                  { value: "no", label: "No (known)" },
                ]}
              />

              <TriStateRadios
                groupName={`${filterFieldId}-independent`}
                label="Independent"
                value={cf.independent}
                onChange={(v) => patchFilters({ independent: v })}
              />

              <FilterRadioGroup
                groupName={`${filterFieldId}-dependent`}
                legend="Dependent territory"
                value={cf.hasColonizer === null ? "any" : cf.hasColonizer ? "yes" : "no"}
                onChange={(v) =>
                  patchFilters({
                    hasColonizer: v === "any" ? null : v === "yes",
                  })
                }
                options={[
                  { value: "any", label: "Any" },
                  { value: "yes", label: "Has administering state" },
                  { value: "no", label: "Not listed as dependent" },
                ]}
              />

              <TriStateRadios
                groupName={`${filterFieldId}-landlocked`}
                label="Landlocked"
                value={cf.landlocked}
                onChange={(v) => patchFilters({ landlocked: v })}
              />

              <FilterRadioGroup
                groupName={`${filterFieldId}-driving`}
                legend="Driving side"
                value={cf.drivingSide}
                onChange={(v) => patchFilters({ drivingSide: v as "any" | "left" | "right" })}
                options={[
                  { value: "any", label: "Any" },
                  { value: "left", label: "Left" },
                  { value: "right", label: "Right" },
                ]}
              />

              <button
                type="button"
                onClick={() => setGroupsOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-left text-xs font-medium dark:border-zinc-600 dark:bg-zinc-800/80"
                aria-expanded={groupsOpen}
              >
                Regional &amp; economic groups
                <span aria-hidden>{groupsOpen ? "−" : "+"}</span>
              </button>
              {groupsOpen ? (
                <div className="space-y-3 rounded border border-zinc-100 p-2 dark:border-zinc-700/80">
                  <TriStateRadios
                    groupName={`${filterFieldId}-un-member`}
                    label="UN member"
                    value={cf.unMember}
                    onChange={(v) => patchFilters({ unMember: v })}
                  />
                  <TriStateRadios
                    groupName={`${filterFieldId}-brics`}
                    label="BRICS"
                    value={cf.brics}
                    onChange={(v) => patchFilters({ brics: v })}
                  />
                  <TriStateRadios
                    groupName={`${filterFieldId}-eu`}
                    label="EU member"
                    value={cf.eu}
                    onChange={(v) => patchFilters({ eu: v })}
                  />
                  <TriStateRadios
                    groupName={`${filterFieldId}-commonwealth`}
                    label="Commonwealth"
                    value={cf.commonwealth}
                    onChange={(v) => patchFilters({ commonwealth: v })}
                  />
                  <TriStateRadios
                    groupName={`${filterFieldId}-nato`}
                    label="NATO"
                    value={cf.nato}
                    onChange={(v) => patchFilters({ nato: v })}
                  />
                  <TriStateRadios
                    groupName={`${filterFieldId}-asean`}
                    label="ASEAN"
                    value={cf.asean}
                    onChange={(v) => patchFilters({ asean: v })}
                  />
                  <TriStateRadios
                    groupName={`${filterFieldId}-g7`}
                    label="G7"
                    value={cf.g7}
                    onChange={(v) => patchFilters({ g7: v })}
                  />
                  <TriStateRadios
                    groupName={`${filterFieldId}-g20`}
                    label="G20"
                    value={cf.g20}
                    onChange={(v) => patchFilters({ g20: v })}
                  />
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setGeoOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-left text-xs font-medium dark:border-zinc-600 dark:bg-zinc-800/80"
                aria-expanded={geoOpen}
              >
                Geography
                <span aria-hidden>{geoOpen ? "−" : "+"}</span>
              </button>
              {geoOpen ? (
                <div className="max-h-40 space-y-3 overflow-y-auto rounded border border-zinc-100 p-2 dark:border-zinc-700/80">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Continents (any selected)</p>
                  <ul className="grid grid-cols-1 gap-1">
                    {continentOptions.map((name) => (
                      <li key={name}>
                        <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-700 dark:text-zinc-200">
                          <input
                            type="checkbox"
                            className={filterCheckboxClass}
                            checked={cf.continents.includes(name)}
                            onChange={() => toggleContinent(name)}
                          />
                          {name}
                        </label>
                      </li>
                    ))}
                  </ul>
                  <fieldset className="min-w-0 border-0 p-0">
                    <legend className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Region</legend>
                    <div className="max-h-28 space-y-1 overflow-y-auto pr-0.5">
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-700 dark:text-zinc-200">
                        <input
                          type="radio"
                          name={`${filterFieldId}-region`}
                          className={filterRadioClass}
                          checked={cf.region === null || cf.region === ""}
                          onChange={() => patchFilters({ region: null })}
                        />
                        Any
                      </label>
                      {regionOptions.map((r) => (
                        <label
                          key={r}
                          className="flex cursor-pointer items-center gap-2 text-xs text-zinc-700 dark:text-zinc-200"
                        >
                          <input
                            type="radio"
                            name={`${filterFieldId}-region`}
                            className={filterRadioClass}
                            checked={cf.region === r}
                            onChange={() => patchFilters({ region: r })}
                          />
                          {r}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="min-w-0 border-0 p-0">
                    <legend className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Subregion</legend>
                    <div className="max-h-28 space-y-1 overflow-y-auto pr-0.5">
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-700 dark:text-zinc-200">
                        <input
                          type="radio"
                          name={`${filterFieldId}-subregion`}
                          className={filterRadioClass}
                          checked={cf.subregion === null || cf.subregion === ""}
                          onChange={() => patchFilters({ subregion: null })}
                        />
                        Any
                      </label>
                      {subregionOptions.map((r) => (
                        <label
                          key={r}
                          className="flex cursor-pointer items-center gap-2 text-xs text-zinc-700 dark:text-zinc-200"
                        >
                          <input
                            type="radio"
                            name={`${filterFieldId}-subregion`}
                            className={filterRadioClass}
                            checked={cf.subregion === r}
                            onChange={() => patchFilters({ subregion: r })}
                          />
                          {r}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setFlagOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-left text-xs font-medium dark:border-zinc-600 dark:bg-zinc-800/80"
                aria-expanded={flagOpen}
              >
                Flag aspect ratio
                <span aria-hidden>{flagOpen ? "−" : "+"}</span>
              </button>
              {flagOpen ? (
                <div className="max-h-36 space-y-2 overflow-y-auto rounded border border-zinc-100 p-2 dark:border-zinc-700/80">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Match any selected ratio</p>
                  {aspectRatioOptions.map((ratio) => (
                    <label
                      key={ratio}
                      className="flex cursor-pointer items-center gap-2 text-xs text-zinc-700 dark:text-zinc-200"
                    >
                      <input
                        type="checkbox"
                        className={filterCheckboxClass}
                        checked={cf.flagAspectRatios.includes(ratio)}
                        onChange={() => toggleAspectRatio(ratio)}
                      />
                      {ratio}
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
