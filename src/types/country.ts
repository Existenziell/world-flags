export type FlagMetadata = {
  aspectRatio: string | null;
  notableHistory: string | null;
  sources: string[];
};

/** Political / economic group memberships used for explore filters; maintained in `countries.json`. */
export type CountryMemberships = {
  brics: boolean;
  eu: boolean;
  commonwealth: boolean;
  nato: boolean;
  asean: boolean;
  g7: boolean;
  g20: boolean;
};

export const DEFAULT_COUNTRY_MEMBERSHIPS: CountryMemberships = {
  brics: false,
  eu: false,
  commonwealth: false,
  nato: false,
  asean: false,
  g7: false,
  g20: false,
};

export type Country = {
  iso2: string;
  iso3: string;
  name: string;
  officialName: string | null;
  countryCreationDate: string | null;
  independenceDate: string | null;
  altSpellings: string[];
  population: number | null;
  region: string | null;
  subregion: string | null;
  unMember: boolean | null;
  status: string | null;
  borders: string[];
  continents: string[];
  capital: string | null;
  areaKm2: number | null;
  latlng: [number, number] | null;
  drivingSide: string | null;
  callingCodes: string[];
  internetTlds: string[];
  wikipediaUrl: string;
  languages: string[];
  currencies: string[];
  timezones: string[];
  independent: boolean | null;
  /** Sovereign or administering power for dependent territories; null if independent or not listed. */
  colonizer: string | null;
  /** Historical colonization: `true` if dependent territory (`colonizer` set); `false` if listed in `was-never-colonized-iso2.json`; else `null` (unknown). */
  wasColonized: boolean | null;
  landlocked: boolean | null;
  startOfWeek: string | null;
  flagPath: string;
  flag: FlagMetadata;
  memberships: CountryMemberships;
};
