import { getChallengeModeLabel } from "@/src/lib/challenge-mode-label";

describe("getChallengeModeLabel", () => {
  it("maps challenge modes to display names", () => {
    expect(getChallengeModeLabel("challenge1")).toBe("Find the country");
    expect(getChallengeModeLabel("challenge2")).toBe("Find the flag");
  });
});
