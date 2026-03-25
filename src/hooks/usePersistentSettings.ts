"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MapSettings } from "@/src/types/map-settings";
import {
  DEFAULT_MAP_SETTINGS,
  LEGACY_SETTINGS_STORAGE_KEYS,
  SETTINGS_STORAGE_KEY,
} from "@/src/constants";

function parseSettings(value: string | null): MapSettings {
  if (!value) {
    return DEFAULT_MAP_SETTINGS;
  }

  try {
    const parsed = JSON.parse(value) as Partial<MapSettings>;
    return {
      projection: parsed.projection ?? DEFAULT_MAP_SETTINGS.projection,
      mapStyle: parsed.mapStyle ?? DEFAULT_MAP_SETTINGS.mapStyle,
      theme: parsed.theme ?? DEFAULT_MAP_SETTINGS.theme,
      centerLng: parsed.centerLng ?? DEFAULT_MAP_SETTINGS.centerLng,
      centerLat: parsed.centerLat ?? DEFAULT_MAP_SETTINGS.centerLat,
      zoom: parsed.zoom ?? DEFAULT_MAP_SETTINGS.zoom,
      minZoom: parsed.minZoom ?? DEFAULT_MAP_SETTINGS.minZoom,
      maxZoom: parsed.maxZoom ?? DEFAULT_MAP_SETTINGS.maxZoom,
      pitch: parsed.pitch ?? DEFAULT_MAP_SETTINGS.pitch,
      bearing: parsed.bearing ?? DEFAULT_MAP_SETTINGS.bearing,
      renderWorldCopies: parsed.renderWorldCopies ?? DEFAULT_MAP_SETTINGS.renderWorldCopies,
      skyboxEnabled: parsed.skyboxEnabled ?? DEFAULT_MAP_SETTINGS.skyboxEnabled,
      skyColor: parsed.skyColor ?? DEFAULT_MAP_SETTINGS.skyColor,
      skyHorizonColor: parsed.skyHorizonColor ?? DEFAULT_MAP_SETTINGS.skyHorizonColor,
      skySpaceColor: parsed.skySpaceColor ?? DEFAULT_MAP_SETTINGS.skySpaceColor,
      skyHorizonBlend: parsed.skyHorizonBlend ?? DEFAULT_MAP_SETTINGS.skyHorizonBlend,
      skyStarIntensity: parsed.skyStarIntensity ?? DEFAULT_MAP_SETTINGS.skyStarIntensity,
    };
  } catch {
    return DEFAULT_MAP_SETTINGS;
  }
}

function getStoredSettings(): MapSettings {
  const currentSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (currentSettings) {
    return parseSettings(currentSettings);
  }

  for (const key of LEGACY_SETTINGS_STORAGE_KEYS) {
    const legacy = window.localStorage.getItem(key);
    if (legacy) {
      return parseSettings(legacy);
    }
  }

  return DEFAULT_MAP_SETTINGS;
}

export function usePersistentSettings() {
  const [settings, setSettings] = useState<MapSettings>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_MAP_SETTINGS;
    }

    return getStoredSettings();
  });
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const serialized = JSON.stringify(settings);
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, serialized);
    window.localStorage.setItem("mapSettings", serialized);
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-light", "dark");
    root.classList.add(settings.theme === "dark" ? "theme-dark" : "theme-light");
    if (settings.theme === "dark") {
      root.classList.add("dark");
    }
  }, [settings.theme]);

  const api = useMemo(
    () => ({
      settings,
      setSettings,
      isReady: true,
    }),
    [settings],
  );

  return api;
}
