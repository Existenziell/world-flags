import { getIsoCode, getIsoFromFeature } from "@/src/lib/iso";

describe("iso helpers", () => {
  test("getIsoCode picks first non-empty code and uppercases", () => {
    expect(getIsoCode([null, "  ", "us"])).toBe("US");
  });

  test("getIsoCode returns null when no valid value exists", () => {
    expect(getIsoCode([null, 42, "", "   "])).toBeNull();
  });

  test("getIsoFromFeature reads ISO2 and ISO3 variants", () => {
    const result = getIsoFromFeature({
      properties: {
        iso2: "de",
        ADM0_A3: "deu",
      },
    });

    expect(result).toEqual({ iso2: "DE", iso3: "DEU" });
  });

  test("getIsoFromFeature returns nulls when properties are missing", () => {
    expect(getIsoFromFeature({})).toEqual({ iso2: null, iso3: null });
  });
});
