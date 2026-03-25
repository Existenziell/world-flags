import { DEFAULT_COUNTRY_FILTERS } from "@/src/constants";
import type { Country } from "@/src/types/country";
import type {
  CountryFilterCriteria,
  CountryFilterTriState,
  WasColonizedFilter,
} from "@/src/types/country-filters";

function normalizeWasColonizedFilter(
  value: CountryFilterCriteria["wasColonized"] | "unknown" | undefined,
): CountryFilterCriteria["wasColonized"] {
  if (value === "unknown") {
    return "any";
  }
  if (value === "any" || value === "yes" || value === "no") {
    return value;
  }
  return DEFAULT_COUNTRY_FILTERS.wasColonized;
}

export function normalizeCountryFilters(input: unknown): CountryFilterCriteria {
  if (!input || typeof input !== "object") {
    return { ...DEFAULT_COUNTRY_FILTERS };
  }
  const partial = input as Partial<CountryFilterCriteria> & { wasColonized?: string };
  return {
    ...DEFAULT_COUNTRY_FILTERS,
    ...partial,
    wasColonized: normalizeWasColonizedFilter(partial.wasColonized),
    continents: Array.isArray(partial.continents) ? partial.continents : DEFAULT_COUNTRY_FILTERS.continents,
    flagAspectRatios: Array.isArray(partial.flagAspectRatios)
      ? partial.flagAspectRatios
      : DEFAULT_COUNTRY_FILTERS.flagAspectRatios,
  };
}

function sameStringSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const sortedA = [...a].sort((x, y) => x.localeCompare(y));
  const sortedB = [...b].sort((x, y) => x.localeCompare(y));
  return sortedA.every((v, i) => v === sortedB[i]);
}

/** True when `criteria` matches {@link DEFAULT_COUNTRY_FILTERS} (order of array fields ignored). */
export function countryFiltersAreDefault(criteria: CountryFilterCriteria): boolean {
  const d = DEFAULT_COUNTRY_FILTERS;
  const c = criteria;
  return (
    c.unMember === d.unMember &&
    c.brics === d.brics &&
    c.eu === d.eu &&
    c.commonwealth === d.commonwealth &&
    c.nato === d.nato &&
    c.asean === d.asean &&
    c.g7 === d.g7 &&
    c.g20 === d.g20 &&
    c.populationMin === d.populationMin &&
    c.populationMax === d.populationMax &&
    c.wasColonized === d.wasColonized &&
    c.hasColonizer === d.hasColonizer &&
    c.drivingSide === d.drivingSide &&
    sameStringSet(c.continents, d.continents) &&
    c.region === d.region &&
    c.subregion === d.subregion &&
    sameStringSet(c.flagAspectRatios, d.flagAspectRatios) &&
    c.landlocked === d.landlocked &&
    c.independent === d.independent
  );
}

function matchesTriStateBoolean(
  value: boolean | null | undefined,
  state: CountryFilterTriState,
): boolean {
  if (state === "any") {
    return true;
  }
  if (value === true) {
    return state === "yes";
  }
  if (value === false) {
    return state === "no";
  }
  return false;
}

function matchesMembership(member: boolean, state: CountryFilterTriState): boolean {
  if (state === "any") {
    return true;
  }
  if (state === "yes") {
    return member === true;
  }
  return member === false;
}

function matchesWasColonized(value: boolean | null | undefined, state: WasColonizedFilter): boolean {
  if (state === "any") {
    return true;
  }
  if (value === null || value === undefined) {
    return false;
  }
  if (state === "yes") {
    return value === true;
  }
  if (state === "no") {
    return value === false;
  }
  return true;
}

export function applyCountryFilters(countries: Country[], criteria: CountryFilterCriteria): Country[] {
  const c = criteria;
  const hasPopMin = c.populationMin !== null && c.populationMin !== undefined;
  const hasPopMax = c.populationMax !== null && c.populationMax !== undefined;

  return countries.filter((country) => {
    const m = country.memberships;

    if (!matchesTriStateBoolean(country.unMember, c.unMember)) {
      return false;
    }
    if (!matchesMembership(m.brics, c.brics)) {
      return false;
    }
    if (!matchesMembership(m.eu, c.eu)) {
      return false;
    }
    if (!matchesMembership(m.commonwealth, c.commonwealth)) {
      return false;
    }
    if (!matchesMembership(m.nato, c.nato)) {
      return false;
    }
    if (!matchesMembership(m.asean, c.asean)) {
      return false;
    }
    if (!matchesMembership(m.g7, c.g7)) {
      return false;
    }
    if (!matchesMembership(m.g20, c.g20)) {
      return false;
    }

    if (hasPopMin || hasPopMax) {
      const pop = country.population;
      if (pop === null || pop === undefined) {
        return false;
      }
      if (hasPopMin && pop < (c.populationMin as number)) {
        return false;
      }
      if (hasPopMax && pop > (c.populationMax as number)) {
        return false;
      }
    }

    if (!matchesWasColonized(country.wasColonized, c.wasColonized)) {
      return false;
    }

    if (c.hasColonizer === true && country.colonizer === null) {
      return false;
    }
    if (c.hasColonizer === false && country.colonizer !== null) {
      return false;
    }

    if (c.drivingSide !== "any") {
      const side = country.drivingSide?.toLowerCase() ?? null;
      if (side !== c.drivingSide) {
        return false;
      }
    }

    if (c.continents.length > 0) {
      const selected = new Set(c.continents);
      if (!country.continents.some((ct) => selected.has(ct))) {
        return false;
      }
    }

    if (c.region !== null && c.region !== "") {
      if (country.region !== c.region) {
        return false;
      }
    }

    if (c.subregion !== null && c.subregion !== "") {
      if (country.subregion !== c.subregion) {
        return false;
      }
    }

    if (c.flagAspectRatios.length > 0) {
      const allowed = new Set(c.flagAspectRatios);
      const ratio = country.flag?.aspectRatio;
      if (ratio === null || ratio === undefined || !allowed.has(ratio)) {
        return false;
      }
    }

    if (!matchesTriStateBoolean(country.landlocked, c.landlocked)) {
      return false;
    }
    if (!matchesTriStateBoolean(country.independent, c.independent)) {
      return false;
    }

    return true;
  });
}
