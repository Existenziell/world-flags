import { allCountries } from "@/src/lib/country-lookup";
import { WAS_NEVER_COLONIZED_ISO2 } from "@/src/lib/was-never-colonized";

describe("WAS_NEVER_COLONIZED_ISO2", () => {
  it("marks each listed country as wasColonized false in dataset", () => {
    for (const iso2 of WAS_NEVER_COLONIZED_ISO2) {
      const row = allCountries.find((c) => c.iso2 === iso2);
      expect(row, iso2).toBeTruthy();
      expect(row?.wasColonized).toBe(false);
    }
  });
});
