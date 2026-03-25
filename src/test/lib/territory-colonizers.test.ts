import { allCountries } from "@/src/lib/country-lookup";
import { TERRITORY_COLONIZER_BY_ISO2 } from "@/src/lib/territory-colonizers";

describe("TERRITORY_COLONIZER_BY_ISO2 and countries.json", () => {
  it("matches persisted data for sample territories", () => {
    expect(allCountries.find((c) => c.iso2 === "AX")?.colonizer).toBe("Finland");
    expect(allCountries.find((c) => c.iso2 === "HK")?.colonizer).toBe("China");
    expect(allCountries.find((c) => c.iso2 === "DE")?.colonizer).toBeNull();
    expect(allCountries.find((c) => c.iso2 === "AQ")?.colonizer).toBeNull();
    expect(allCountries.find((c) => c.iso2 === "HK")?.wasColonized).toBe(true);
    expect(allCountries.find((c) => c.iso2 === "AX")?.wasColonized).toBe(true);
    expect(allCountries.find((c) => c.iso2 === "DE")?.wasColonized).toBeNull();
  });

  it("covers every ISO2 used in the lookup table", () => {
    const iso2List = Object.keys(TERRITORY_COLONIZER_BY_ISO2);
    expect(iso2List.length).toBeGreaterThan(40);
    for (const iso2 of iso2List) {
      const row = allCountries.find((c) => c.iso2 === iso2);
      expect(row, `missing ${iso2} in dataset`).toBeTruthy();
      expect(row?.colonizer).toBe(TERRITORY_COLONIZER_BY_ISO2[iso2]);
      expect(row?.wasColonized).toBe(true);
    }
  });
});
