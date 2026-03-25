"use client";

import { useMap } from "@/src/hooks/useMap";
import type { WorldMapProps } from "@/src/types/world-map";

export function WorldMap({
  accessToken,
  settings,
  onCountrySelect,
  mode,
  focusCountry,
  flyToToken,
  showOnlyFocusMarker,
  focusMarkerVariant,
  onFocusCountryClick,
}: WorldMapProps) {
  const { containerRef } = useMap({
    accessToken,
    settings,
    onCountrySelect,
    mode,
    focusCountry,
    flyToToken,
    showOnlyFocusMarker,
    focusMarkerVariant,
    onFocusCountryClick,
  });

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
}
