import countries from "@/src/data/countries.json";
import type { Country } from "@/src/types/country";

const byIso2 = new Map(
  (countries as Country[]).map((country) => [country.iso2.toUpperCase(), country]),
);
const byIso3 = new Map(
  (countries as Country[]).map((country) => [country.iso3.toUpperCase(), country]),
);

export function getCountryByIso2(iso2: string | null | undefined): Country | null {
  if (!iso2) {
    return null;
  }

  return byIso2.get(iso2.toUpperCase()) ?? null;
}

export function getCountryByCode(code: string | null | undefined): Country | null {
  if (!code) {
    return null;
  }

  const upper = code.toUpperCase();
  if (upper.length === 2) {
    return byIso2.get(upper) ?? null;
  }

  if (upper.length === 3) {
    return byIso3.get(upper) ?? null;
  }

  return byIso2.get(upper) ?? byIso3.get(upper) ?? null;
}

export const allCountries = countries as Country[];
