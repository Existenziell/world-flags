import { existsSync } from "node:fs";
import path from "node:path";
import wasNeverColonizedIso2 from "@/src/data/was-never-colonized-iso2.json";
import countries from "@/src/data/countries.json";

describe("countries dataset", () => {
  it("includes required properties", () => {
    expect(countries.length).toBeGreaterThan(200);

    const sample = countries[0];
    expect(sample).toMatchObject({
      iso2: expect.any(String),
      iso3: expect.any(String),
      name: expect.any(String),
      colonizer: null,
      memberships: {
        brics: expect.any(Boolean),
        eu: expect.any(Boolean),
        commonwealth: expect.any(Boolean),
        nato: expect.any(Boolean),
        asean: expect.any(Boolean),
        g7: expect.any(Boolean),
        g20: expect.any(Boolean),
      },
      flagPath: expect.stringMatching(/^\/flags\/[a-z]{2}\.svg$/),
      flag: {
        aspectRatio: expect.anything(),
        notableHistory: expect.anything(),
        sources: expect.any(Array),
      },
    });
    expect(sample.wasColonized === null || typeof sample.wasColonized === "boolean").toBe(true);
  });

  it("sets wasColonized: true when colonizer is set", () => {
    for (const c of countries) {
      if (c.colonizer !== null) {
        expect(c.wasColonized).toBe(true);
      }
    }
  });

  it("sets wasColonized: false for never-colonized ISO2 list", () => {
    const never = new Set(wasNeverColonizedIso2);
    for (const c of countries) {
      if (never.has(c.iso2)) {
        expect(c.colonizer).toBeNull();
        expect(c.wasColonized).toBe(false);
      }
    }
  });

  it("contains valid flag metadata", () => {
    const ratioPattern = /^\d+:\d+$/;

    for (const country of countries) {
      expect(country.flag).toBeTruthy();
      expect(Array.isArray(country.flag.sources)).toBe(true);

      if (country.flag.aspectRatio !== null) {
        expect(country.flag.aspectRatio).toMatch(ratioPattern);
      }
    }
  });

  it("references local flag files that exist", () => {
    for (const country of countries.slice(0, 25)) {
      const absolute = path.join(
        process.cwd(),
        "public",
        country.flagPath.replace(/^\/+/, ""),
      );
      expect(existsSync(absolute)).toBe(true);
    }
  });
});
