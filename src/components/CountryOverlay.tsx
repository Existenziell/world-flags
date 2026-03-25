"use client";

import Image from "next/image";
import {
  formatArea,
  formatLatLng,
  formatList,
  formatNumber,
  formatStartOfWeek,
  formatYesNo,
} from "@/src/lib/formatters";
import type { CountryOverlayProps, StatRowProps } from "@/src/types/country-overlay";

function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-x-3 py-0.5 text-sm">
      <dt className="text-zinc-500 dark:text-zinc-300">{label}</dt>
      <dd className="font-medium text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

export function CountryOverlay({ country, onClose }: CountryOverlayProps) {
  return (
    <aside className="absolute left-4 top-4 z-30 max-h-[calc(100vh-2rem)] w-[min(25rem,calc(100vw-2rem))] overflow-x-hidden overflow-y-auto rounded-2xl border border-black/10 bg-white/92 text-zinc-900 shadow-2xl backdrop-blur-md dark:border-white/20 dark:bg-zinc-950/85 dark:text-white">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-white/95 px-4 pb-4 pt-5 backdrop-blur-md dark:border-white/15 dark:bg-zinc-950/95 sm:px-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 bg-white/95 text-lg font-semibold text-zinc-800 shadow-md transition hover:scale-105 hover:bg-white dark:border-white/30 dark:bg-zinc-900/95 dark:text-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Close country overlay"
        >
          ✕
        </button>
        <Image
          src={country.flagPath}
          alt={`${country.name} flag`}
          width={1200}
          height={700}
          className="block h-auto w-1/2 object-contain pr-12"
          priority
        />
        <h2 className="mt-3 pr-12 text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          {country.name}
        </h2>
      </header>

      <div className="space-y-4 p-4 sm:p-5">

        <section className="rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
            Identity
          </h3>
          <dl>
            <StatRow label="ISO2" value={country.iso2} />
            <StatRow label="ISO3" value={country.iso3} />
            <StatRow label="Official name" value={country.officialName ?? "N/A"} />
            <StatRow label="Independent" value={formatYesNo(country.independent)} />
            {country.independent === false ? (
              <StatRow label="Colonizer" value={country.colonizer ?? "N/A"} />
            ) : null}
            <StatRow label="Independent since" value={country.independenceDate ?? "N/A"} />
            <StatRow label="Founded" value={country.countryCreationDate ?? "N/A"} />
            <StatRow label="UN member" value={formatYesNo(country.unMember)} />
            <StatRow label="Status" value={country.status ?? "N/A"} />
            <StatRow label="Alt spellings" value={formatList(country.altSpellings)} />
            <StatRow label="Start of week" value={formatStartOfWeek(country.startOfWeek)} />
          </dl>
        </section>

        <section className="rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
            Geography
          </h3>
          <dl>
            <StatRow label="Region" value={country.region ?? "N/A"} />
            <StatRow label="Subregion" value={country.subregion ?? "N/A"} />
            <StatRow label="Continents" value={formatList(country.continents)} />
            <StatRow label="Capital" value={country.capital ?? "N/A"} />
            <StatRow label="Area" value={formatArea(country.areaKm2)} />
            <StatRow label="Landlocked" value={formatYesNo(country.landlocked)} />
            <StatRow label="Center (lat/lng)" value={formatLatLng(country.latlng)} />
            <StatRow label="Borders" value={formatList(country.borders)} />
            <StatRow label="Timezones" value={formatList(country.timezones)} />
          </dl>
        </section>

        <section className="rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
            Society and economy
          </h3>
          <dl>
            <StatRow label="Population" value={formatNumber(country.population)} />
            <StatRow label="Languages" value={formatList(country.languages)} />
            <StatRow label="Currencies" value={formatList(country.currencies)} />
            <StatRow label="Calling codes" value={formatList(country.callingCodes)} />
            <StatRow label="Driving side" value={country.drivingSide ?? "N/A"} />
            <StatRow label="Internet TLDs" value={formatList(country.internetTlds)} />
          </dl>
        </section>

        <section className="rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
            Flag details
          </h3>
          <dl>
            <StatRow label="Format" value={country.flag.aspectRatio ?? "N/A"} />
            <StatRow label="History" value={country.flag.notableHistory ?? "N/A"} />
          </dl>
        </section>

        <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
          <a
            href={country.wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-sm font-medium text-blue-700 underline underline-offset-2 transition hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
          >
            View on Wikipedia
          </a>
        </footer>
      </div>
    </aside>
  );
}
