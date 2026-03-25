"use client";

import { useEffect, useRef } from "react";
import { type MapStyleOption } from "@/src/types/map-settings";
import { useMapInstance } from "@/src/hooks/useMapInstance";
import { useMapInteractions } from "@/src/hooks/useMapInteractions";
import { useMapSync } from "@/src/hooks/useMapSync";
import type { UseMapArgs } from "@/src/types/use-map";

export function useMap({ accessToken, settings, onCountrySelect }: UseMapArgs) {
  const latestSettingsRef = useRef(settings);
  const onCountrySelectRef = useRef(onCountrySelect);
  const appliedStyleRef = useRef<MapStyleOption>(settings.mapStyle);

  useEffect(() => {
    latestSettingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    onCountrySelectRef.current = onCountrySelect;
  }, [onCountrySelect]);

  const { containerRef, mapRef } = useMapInstance({ accessToken, settings });

  useMapInteractions({
    mapRef,
    onCountrySelectRef,
    latestSettingsRef,
  });

  useMapSync({
    mapRef,
    settings,
    latestSettingsRef,
    appliedStyleRef,
  });

  return { containerRef };
}
