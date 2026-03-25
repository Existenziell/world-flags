import type { MapSettings } from "@/src/types/map-settings";

export type SettingsOverlayProps = {
  settings: MapSettings;
  onChange: (next: MapSettings) => void;
  onClose: () => void;
  hideMapStyle?: boolean;
};
