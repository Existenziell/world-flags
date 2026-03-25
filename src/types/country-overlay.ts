import type { Country } from "@/src/types/country";

export type CountryOverlayProps = {
  country: Country;
  onClose: () => void;
};

export type StatRowProps = {
  label: string;
  value: string;
};
