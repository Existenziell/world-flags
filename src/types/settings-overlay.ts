import type { MapSettings } from "@/src/types/map-settings";

export type SettingsOverlayProps = {
  settings: MapSettings;
  onChange: (next: MapSettings) => void;
  onClose: () => void;
  hideMapStyle?: boolean;
  showCountryFilters?: boolean;
  /** Countries with markers after filters; used for empty-state hint. */
  exploreMarkerCount?: number | null;
};
