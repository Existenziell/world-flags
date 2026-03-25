import { buildChallengeSummary } from "@/src/lib/challenge-summary";
import type { ChallengeRoundResult } from "@/src/types/world-flags";

function round(partial: Partial<ChallengeRoundResult> & Pick<ChallengeRoundResult, "iso2">): ChallengeRoundResult {
  return {
    iso2: partial.iso2,
    countryName: partial.countryName ?? "X",
    attempts: partial.attempts ?? 1,
    correct: partial.correct ?? true,
  };
}

describe("buildChallengeSummary", () => {
  it("scores first-try correct rounds at 10 each", () => {
    const summary = buildChallengeSummary([
      round({ iso2: "A", attempts: 1, correct: true }),
      round({ iso2: "B", attempts: 1, correct: true }),
    ]);
    expect(summary.score).toBe(20);
    expect(summary.totalCorrect).toBe(2);
    expect(summary.totalAttempts).toBe(2);
  });

  it("reduces score when extra attempts are used", () => {
    const summary = buildChallengeSummary([round({ iso2: "A", attempts: 3, correct: true })]);
    expect(summary.score).toBe(8);
  });

  it("applies skip penalty for incorrect rounds", () => {
    const summary = buildChallengeSummary([round({ iso2: "A", attempts: 0, correct: false })]);
    expect(summary.score).toBe(-3);
  });

  it("floors per-round score at zero for very high attempts", () => {
    const summary = buildChallengeSummary([round({ iso2: "A", attempts: 20, correct: true })]);
    expect(summary.score).toBe(0);
  });

  it("sorts hardest rounds by attempts descending", () => {
    const summary = buildChallengeSummary([
      round({ iso2: "A", countryName: "Low", attempts: 1, correct: true }),
      round({ iso2: "B", countryName: "High", attempts: 5, correct: true }),
    ]);
    expect(summary.hardestRounds[0]?.countryName).toBe("High");
  });
});
