import type { RefObject } from "react";
import type mapboxgl from "mapbox-gl";
import type { MapSettings, MapStyleOption } from "@/src/types/map-settings";

export type UseMapSyncArgs = {
  mapRef: RefObject<mapboxgl.Map | null>;
  settings: MapSettings;
  latestSettingsRef: RefObject<MapSettings>;
  appliedStyleRef: RefObject<MapStyleOption>;
};
