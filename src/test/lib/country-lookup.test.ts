import { getCountryByIso2 } from "@/src/lib/country-lookup";

describe("getCountryByIso2", () => {
  it("returns country details for a known code", () => {
    const france = getCountryByIso2("fr");
    expect(france?.name).toBe("France");
  });

  it("returns null for unknown country code", () => {
    expect(getCountryByIso2("ZZ")).toBeNull();
  });
});
