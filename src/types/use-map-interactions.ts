import type { RefObject } from "react";
import type mapboxgl from "mapbox-gl";
import type { Country } from "@/src/types/country";
import type { MapSettings, ThemeOption } from "@/src/types/map-settings";
import type { FocusMarkerVariant } from "@/src/types/world-map";
import type { AppMode } from "@/src/types/world-flags";

export type UseMapInteractionsArgs = {
  mapRef: RefObject<mapboxgl.Map | null>;
  onCountrySelectRef: RefObject<(country: Country | null) => void>;
  latestSettingsRef: RefObject<MapSettings>;
  mode: AppMode;
  focusCountry: Country | null;
  showOnlyFocusMarker: boolean;
  focusMarkerVariant: FocusMarkerVariant;
  markerTheme: ThemeOption;
  /** Explore-mode flag markers; ignored when `showOnlyFocusMarker` focuses one country. */
  exploreCountries: Country[];
  onFocusCountryClick?: (country: Country) => void;
};
