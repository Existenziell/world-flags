import type { Country } from "@/src/types/country";
import type { MapSettings } from "@/src/types/map-settings";

export type WorldMapProps = {
  accessToken: string;
  settings: MapSettings;
  onCountrySelect: (country: Country | null) => void;
};
