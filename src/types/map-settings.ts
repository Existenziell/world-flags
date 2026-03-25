import type { CountryFilterCriteria } from "@/src/types/country-filters";

export type MapProjection = "globe" | "mercator";
export type MapStyleOption =
  | "dark"
  | "light"
  | "streets"
  | "outdoors"
  | "satellite"
  | "satelliteStreets"
  | "navigationDay"
  | "navigationNight";
export type ThemeOption = "dark" | "light";

export type MapSettings = {
  projection: MapProjection;
  mapStyle: MapStyleOption;
  theme: ThemeOption;
  centerLng: number;
  centerLat: number;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  pitch: number;
  bearing: number;
  renderWorldCopies: boolean;
  skyboxEnabled: boolean;
  skyColor: string;
  skyHorizonColor: string;
  skySpaceColor: string;
  skyHorizonBlend: number;
  skyStarIntensity: number;
  countryFilters: CountryFilterCriteria;
};
