import type { Country } from "@/src/types/country";
import type { MapSettings } from "@/src/types/map-settings";
import type { FocusMarkerVariant } from "@/src/types/world-map";
import type { AppMode } from "@/src/types/world-flags";

export type UseMapArgs = {
  accessToken: string;
  settings: MapSettings;
  onCountrySelect: (country: Country | null) => void;
  mode: AppMode;
  focusCountry: Country | null;
  flyToToken?: number;
  showOnlyFocusMarker?: boolean;
  focusMarkerVariant?: FocusMarkerVariant;
  onFocusCountryClick?: (country: Country) => void;
};
