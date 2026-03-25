import { DEFAULT_COUNTRY_FILTERS } from "@/src/constants";
import {
  applyCountryFilters,
  countryFiltersAreDefault,
  normalizeCountryFilters,
} from "@/src/lib/country-filters";
import type { Country } from "@/src/types/country";
import countries from "@/src/data/countries.json";

function de(): Country {
  const row = (countries as Country[]).find((c) => c.iso2 === "DE");
  if (!row) {
    throw new Error("missing DE");
  }
  return { ...row };
}

describe("normalizeCountryFilters", () => {
  it("fills defaults for empty or invalid payloads", () => {
    expect(normalizeCountryFilters(null)).toEqual(DEFAULT_COUNTRY_FILTERS);
    expect(normalizeCountryFilters({})).toMatchObject({
      unMember: "any",
      brics: "any",
    });
  });

  it("preserves valid partial arrays", () => {
    const next = normalizeCountryFilters({
      continents: ["Europe"],
      flagAspectRatios: ["3:2"],
    });
    expect(next.continents).toEqual(["Europe"]);
    expect(next.flagAspectRatios).toEqual(["3:2"]);
  });
});

describe("countryFiltersAreDefault", () => {
  it("is true for DEFAULT_COUNTRY_FILTERS", () => {
    expect(countryFiltersAreDefault(DEFAULT_COUNTRY_FILTERS)).toBe(true);
  });

  it("is true when array fields are empty like defaults", () => {
    expect(
      countryFiltersAreDefault({
        ...DEFAULT_COUNTRY_FILTERS,
        continents: [],
        flagAspectRatios: [],
      }),
    ).toBe(true);
  });

  it("is false when any field differs from defaults", () => {
    expect(countryFiltersAreDefault({ ...DEFAULT_COUNTRY_FILTERS, unMember: "yes" })).toBe(false);
    expect(countryFiltersAreDefault({ ...DEFAULT_COUNTRY_FILTERS, populationMin: 1000 })).toBe(false);
    expect(
      countryFiltersAreDefault({ ...DEFAULT_COUNTRY_FILTERS, continents: ["Europe", "Asia"] }),
    ).toBe(false);
  });
});

describe("applyCountryFilters", () => {
  it("returns all countries under default criteria", () => {
    const all = countries as Country[];
    expect(applyCountryFilters(all, DEFAULT_COUNTRY_FILTERS).length).toBe(all.length);
  });

  it("filters UN member yes", () => {
    const all = countries as Country[];
    const filtered = applyCountryFilters(all, { ...DEFAULT_COUNTRY_FILTERS, unMember: "yes" });
    expect(filtered.every((c) => c.unMember === true)).toBe(true);
    expect(filtered.length).toBeLessThan(all.length);
  });

  it("filters G7 membership", () => {
    const all = countries as Country[];
    const filtered = applyCountryFilters(all, { ...DEFAULT_COUNTRY_FILTERS, g7: "yes" });
    const expectedIso2 = all.filter((c) => c.memberships.g7).map((c) => c.iso2).sort();
    expect(filtered.map((c) => c.iso2).sort()).toEqual(expectedIso2);
  });

  it("filters NATO no", () => {
    const all = countries as Country[];
    const filtered = applyCountryFilters(all, { ...DEFAULT_COUNTRY_FILTERS, nato: "no" });
    expect(filtered.every((c) => !c.memberships.nato)).toBe(true);
  });

  it("excludes null population when bounds set", () => {
    const a = de();
    const b: Country = { ...de(), iso2: "ZZ", population: null };
    const out = applyCountryFilters([a, b], {
      ...DEFAULT_COUNTRY_FILTERS,
      populationMin: 1,
    });
    expect(out.map((c) => c.iso2)).toEqual(["DE"]);
  });

  it("filters wasColonized yes", () => {
    const a: Country = { ...de(), iso2: "A1", wasColonized: null };
    const b: Country = { ...de(), iso2: "B2", wasColonized: true };
    const c: Country = { ...de(), iso2: "C3", wasColonized: false };
    const out = applyCountryFilters([a, b, c], { ...DEFAULT_COUNTRY_FILTERS, wasColonized: "yes" });
    expect(out.map((x) => x.iso2)).toEqual(["B2"]);
  });

  it("filters wasColonized no", () => {
    const a: Country = { ...de(), iso2: "A1", wasColonized: null };
    const b: Country = { ...de(), iso2: "B2", wasColonized: true };
    const c: Country = { ...de(), iso2: "C3", wasColonized: false };
    const out = applyCountryFilters([a, b, c], { ...DEFAULT_COUNTRY_FILTERS, wasColonized: "no" });
    expect(out.map((x) => x.iso2)).toEqual(["C3"]);
  });

  it("normalizes legacy wasColonized unknown from storage to any", () => {
    const next = normalizeCountryFilters({ wasColonized: "unknown" });
    expect(next.wasColonized).toBe("any");
  });

  it("filters dependent territory via hasColonizer", () => {
    const a: Country = { ...de(), iso2: "X1", colonizer: null };
    const b: Country = { ...de(), iso2: "X2", colonizer: "France" };
    const out = applyCountryFilters([a, b], { ...DEFAULT_COUNTRY_FILTERS, hasColonizer: true });
    expect(out.map((x) => x.iso2)).toEqual(["X2"]);
  });

  it("filters flag aspect ratios", () => {
    const a: Country = { ...de(), iso2: "F1", flag: { ...de().flag, aspectRatio: "2:1" } };
    const b: Country = { ...de(), iso2: "F2", flag: { ...de().flag, aspectRatio: "3:2" } };
    const out = applyCountryFilters([a, b], { ...DEFAULT_COUNTRY_FILTERS, flagAspectRatios: ["2:1"] });
    expect(out.map((x) => x.iso2)).toEqual(["F1"]);
  });

  it("AND-combines constraints", () => {
    const all = countries as Country[];
    const out = applyCountryFilters(all, {
      ...DEFAULT_COUNTRY_FILTERS,
      g7: "yes",
      drivingSide: "right",
    });
    const expected = all.filter(
      (c) => c.memberships.g7 && c.drivingSide?.toLowerCase() === "right",
    );
    expect(out.map((c) => c.iso2).sort()).toEqual(expected.map((c) => c.iso2).sort());
  });
});
