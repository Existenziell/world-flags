import type { MapProjection, MapSettings, MapStyleOption, ThemeOption } from "@/src/types/map-settings";

export const MAP_STYLE_OPTIONS: MapStyleOption[] = [
  "dark",
  "light",
  "streets",
  "outdoors",
  "satellite",
  "satelliteStreets",
];

export const PROJECTION_OPTIONS: MapProjection[] = ["globe", "mercator"];
export const THEME_OPTIONS: ThemeOption[] = ["dark", "light"];

export const MAP_STYLE_URLS: Record<MapStyleOption, string> = {
  dark: "mapbox://styles/mapbox/dark-v11",
  light: "mapbox://styles/mapbox/light-v11",
  streets: "mapbox://styles/mapbox/streets-v12",
  outdoors: "mapbox://styles/mapbox/outdoors-v12",
  satellite: "mapbox://styles/mapbox/satellite-v9",
  satelliteStreets: "mapbox://styles/mapbox/satellite-streets-v12",
  navigationDay: "mapbox://styles/mapbox/navigation-day-v1",
  navigationNight: "mapbox://styles/mapbox/navigation-night-v1",
};

export const MAP_MIN_ZOOM = 0;
export const MAP_MAX_ZOOM = 24;

export const DEFAULT_MAP_SETTINGS: MapSettings = {
  projection: "globe",
  mapStyle: "dark",
  theme: "dark",
  centerLng: 0,
  centerLat: 20,
  zoom: 1.2,
  minZoom: MAP_MIN_ZOOM,
  maxZoom: MAP_MAX_ZOOM,
  pitch: 0,
  bearing: 0,
  renderWorldCopies: true,
  skyboxEnabled: true,
  skyColor: "#88b6ff",
  skyHorizonColor: "#ffffff",
  skySpaceColor: "#0b1026",
  skyHorizonBlend: 0.2,
  skyStarIntensity: 0.35,
};

export const SETTINGS_STORAGE_KEY = "world-flags-settings";
export const LEGACY_SETTINGS_STORAGE_KEYS = ["mapSettings", "world-flags-theme"] as const;
export const CHALLENGE_HISTORY_STORAGE_KEY = "world-flags-challenge-history";
export const CHALLENGE_SETUP_STORAGE_KEY = "world-flags-challenge-setup";
export const CHALLENGE_HISTORY_MAX_ENTRIES = 100;
export const CHALLENGE_ROUND_COUNT_OPTIONS = [1, 3, 5, 10, 20, 50, 100, "all"] as const;
export const CHALLENGE_FLAG_PICKER_SIZE = 15;

export const COUNTRY_SOURCE_ID = "world-countries";
export const COUNTRY_FILL_LAYER = "world-countries-fill";
export const COUNTRY_LINE_LAYER = "world-countries-outline";
export const COUNTRY_GEOJSON_URLS = [
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson",
  "https://cdn.jsdelivr.net/gh/datasets/geo-countries@master/data/countries.geojson",
] as const;
export const PRIMARY_COUNTRIES_GEOJSON_URL = COUNTRY_GEOJSON_URLS[0];
