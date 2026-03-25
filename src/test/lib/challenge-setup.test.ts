import { CHALLENGE_SETUP_STORAGE_KEY } from "@/src/constants";
import { parseChallengeSetupFromStorage } from "@/src/lib/challenge-setup";

describe("parseChallengeSetupFromStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns defaults when storage is empty", () => {
    expect(parseChallengeSetupFromStorage()).toEqual({ mode: "explore", roundTarget: 20 });
  });

  it("reads stored mode and round target", () => {
    window.localStorage.setItem(
      CHALLENGE_SETUP_STORAGE_KEY,
      JSON.stringify({ mode: "challenge2", roundTarget: 10 }),
    );
    expect(parseChallengeSetupFromStorage()).toEqual({ mode: "challenge2", roundTarget: 10 });
  });

  it("falls back on invalid JSON", () => {
    window.localStorage.setItem(CHALLENGE_SETUP_STORAGE_KEY, "not-json");
    expect(parseChallengeSetupFromStorage()).toEqual({ mode: "explore", roundTarget: 20 });
  });
});
