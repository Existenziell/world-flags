import type { Country } from "@/src/types/country";
import type { MapSettings } from "@/src/types/map-settings";

export type UseMapArgs = {
  accessToken: string;
  settings: MapSettings;
  onCountrySelect: (country: Country | null) => void;
};
