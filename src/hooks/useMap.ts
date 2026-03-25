"use client";

import { useEffect, useRef } from "react";
import { type MapStyleOption } from "@/src/types/map-settings";
import { useMapInstance } from "@/src/hooks/useMapInstance";
import { useMapInteractions } from "@/src/hooks/useMapInteractions";
import { useMapSync } from "@/src/hooks/useMapSync";
import type { UseMapArgs } from "@/src/types/use-map";

export function useMap({
  accessToken,
  settings,
  onCountrySelect,
  mode,
  focusCountry,
  flyToToken,
  showOnlyFocusMarker,
  focusMarkerVariant = "flag",
  onFocusCountryClick,
}: UseMapArgs) {
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
    mode,
    focusCountry,
    showOnlyFocusMarker: Boolean(showOnlyFocusMarker),
    focusMarkerVariant,
    markerTheme: settings.theme,
    onFocusCountryClick,
  });

  useMapSync({
    mapRef,
    settings,
    latestSettingsRef,
    appliedStyleRef,
  });

  useEffect(() => {
    if (mode === "explore" || !focusCountry) {
      return;
    }
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const lng = focusCountry.markerLng ?? focusCountry.latlng?.[1];
    const lat = focusCountry.markerLat ?? focusCountry.latlng?.[0];
    if (lng === null || lng === undefined || lat === null || lat === undefined) {
      return;
    }
    map.flyTo({
      center: [lng, lat],
      zoom: Math.max(map.getZoom(), 3),
      speed: 0.35,
      curve: 1.6,
      maxDuration: 3500,
      essential: true,
    });
  }, [flyToToken, focusCountry, mapRef, mode]);

  return { containerRef };
}
