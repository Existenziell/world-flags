import { normalizeChallengeAnswer } from "@/src/lib/challenge-answer";

describe("normalizeChallengeAnswer", () => {
  it("trims, lowercases, and strips combining marks", () => {
    expect(normalizeChallengeAnswer("  Café  ")).toBe("cafe");
  });

  it("matches stable comparison for challenge input", () => {
    expect(normalizeChallengeAnswer("GERMANY")).toBe("germany");
  });
});
