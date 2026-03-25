"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import type { Country } from "@/src/types/country";
import { CountryOverlay } from "@/src/components/CountryOverlay";
import { SettingsOverlay } from "@/src/components/SettingsOverlay";
import { WorldMap } from "@/src/components/WorldMap";
import { usePersistentSettings } from "@/src/hooks/usePersistentSettings";
import type { WorldFlagsProps } from "@/src/types/world-flags";

export function WorldFlags({ accessToken }: WorldFlagsProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, setSettings } = usePersistentSettings();
  const handleCountrySelect = useCallback((country: Country | null) => {
    setSelectedCountry((current) => {
      if (!country) {
        return null;
      }
      if (current?.iso2 === country.iso2) {
        return null;
      }
      return country;
    });
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      <WorldMap
        accessToken={accessToken}
        settings={settings}
        onCountrySelect={handleCountrySelect}
      />

      <button
        type="button"
        onClick={() => setSettingsOpen((value) => !value)}
        className="absolute right-4 top-4 z-50 cursor-pointer rounded-full border border-black/30 bg-white/95 p-2 text-zinc-900 shadow-lg transition hover:scale-105 dark:border-white/30 dark:bg-zinc-900/95 dark:text-zinc-50"
        aria-label="Open settings"
      >
        <Image
          src="/icons/gear.svg"
          alt="Settings"
          width={24}
          height={24}
          loading="eager"
          className="dark:invert"
        />
      </button>

      {selectedCountry ? (
        <CountryOverlay country={selectedCountry} onClose={() => setSelectedCountry(null)} />
      ) : null}

      {settingsOpen ? (
        <SettingsOverlay
          settings={settings}
          onChange={setSettings}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </div>
  );
}
