import type { RefObject } from "react";
import type mapboxgl from "mapbox-gl";
import type { Country } from "@/src/types/country";
import type { MapSettings } from "@/src/types/map-settings";

export type UseMapInteractionsArgs = {
  mapRef: RefObject<mapboxgl.Map | null>;
  onCountrySelectRef: RefObject<(country: Country | null) => void>;
  latestSettingsRef: RefObject<MapSettings>;
};
