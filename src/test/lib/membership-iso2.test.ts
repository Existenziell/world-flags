import countries from "@/src/data/countries.json";
import type { Country } from "@/src/types/country";

describe("countries.json memberships", () => {
  it("has boolean flags for every bloc on every row", () => {
    for (const c of countries as Country[]) {
      expect(c.memberships).toEqual(
        expect.objectContaining({
          brics: expect.any(Boolean),
          eu: expect.any(Boolean),
          commonwealth: expect.any(Boolean),
          nato: expect.any(Boolean),
          asean: expect.any(Boolean),
          g7: expect.any(Boolean),
          g20: expect.any(Boolean),
        }),
      );
    }
  });

  it("has exactly seven G7 members", () => {
    const g7 = (countries as Country[]).filter((c) => c.memberships.g7);
    expect(g7).toHaveLength(7);
  });
});
