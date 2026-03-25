import { existsSync } from "node:fs";
import path from "node:path";
import countries from "@/src/data/countries.json";

describe("countries dataset", () => {
  it("includes required properties", () => {
    expect(countries.length).toBeGreaterThan(200);

    const sample = countries[0];
    expect(sample).toMatchObject({
      iso2: expect.any(String),
      iso3: expect.any(String),
      name: expect.any(String),
      flagPath: expect.stringMatching(/^\/flags\/[a-z]{2}\.svg$/),
    });
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
