import { countryLngLat } from "@/src/lib/country-coords";
import type { Country } from "@/src/types/country";
import { DEFAULT_COUNTRY_MEMBERSHIPS } from "@/src/types/country";

function minimalCountry(overrides: Partial<Country>): Country {
  return {
    iso2: "XX",
    iso3: "XXX",
    name: "Test",
    officialName: null,
    countryCreationDate: null,
    independenceDate: null,
    altSpellings: [],
    population: null,
    region: null,
    subregion: null,
    unMember: null,
    status: null,
    borders: [],
    continents: [],
    capital: null,
    areaKm2: null,
    latlng: null,
    drivingSide: null,
    callingCodes: [],
    internetTlds: [],
    wikipediaUrl: "",
    languages: [],
    currencies: [],
    timezones: [],
    independent: null,
    colonizer: null,
    wasColonized: null,
    landlocked: null,
    startOfWeek: null,
    flagPath: "/flags/xx.svg",
    flag: { aspectRatio: null, notableHistory: null, sources: [] },
    memberships: DEFAULT_COUNTRY_MEMBERSHIPS,
    ...overrides,
  };
}

describe("countryLngLat", () => {
  it("returns Mapbox [lng, lat] from [lat, lng]", () => {
    expect(countryLngLat(minimalCountry({ latlng: [51, 9] }))).toEqual([9, 51]);
  });

  it("returns null when latlng is null or incomplete", () => {
    expect(countryLngLat(minimalCountry({ latlng: null }))).toBeNull();
    expect(countryLngLat(minimalCountry({ latlng: [51] as unknown as [number, number] }))).toBeNull();
  });

  it("returns null when coordinates are not finite", () => {
    expect(countryLngLat(minimalCountry({ latlng: [NaN, 0] }))).toBeNull();
    expect(countryLngLat(minimalCountry({ latlng: [0, Infinity] }))).toBeNull();
  });
});
