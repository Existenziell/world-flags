import type { Country } from "@/src/types/country";
import type { MapSettings } from "@/src/types/map-settings";
import type { AppMode } from "@/src/types/world-flags";

export type FocusMarkerVariant = "flag" | "name";

export type WorldMapProps = {
  accessToken: string;
  settings: MapSettings;
  onCountrySelect: (country: Country | null) => void;
  mode: AppMode;
  focusCountry: Country | null;
  flyToToken?: number;
  showOnlyFocusMarker?: boolean;
  focusMarkerVariant?: FocusMarkerVariant;
  exploreCountries: Country[];
  onFocusCountryClick?: (country: Country) => void;
};
