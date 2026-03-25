import { fireEvent, render, screen } from "@testing-library/react";
import { ChallengeScorecardOverlay } from "@/src/components/ChallengeScorecardOverlay";
import type { ChallengeHistoryEntry, ChallengeSummary } from "@/src/types/world-flags";

const summary: ChallengeSummary = {
  totalRounds: 10,
  totalCorrect: 10,
  score: 95,
  totalAttempts: 15,
  averageAttemptsPerRound: 1.5,
  hardestRounds: [
    { iso2: "A", countryName: "One", attempts: 4, correct: true },
    { iso2: "B", countryName: "Two", attempts: 3, correct: true },
    { iso2: "C", countryName: "Three", attempts: 2, correct: true },
    { iso2: "D", countryName: "Four", attempts: 1, correct: true },
  ],
};

const historyEntry: ChallengeHistoryEntry = {
  id: "1",
  mode: "challenge1",
  roundTarget: 10,
  startedAt: "",
  completedAt: "",
  summary: { ...summary, totalRounds: 5, score: 40, totalAttempts: 8, averageAttemptsPerRound: 1.6, hardestRounds: [] },
  rounds: [],
};

describe("ChallengeScorecardOverlay", () => {
  it("renders metrics and callbacks", () => {
    const onPlayAgain = vi.fn();
    const onBackToModes = vi.fn();
    render(
      <ChallengeScorecardOverlay
        modeLabel="Find the country"
        summary={summary}
        latestHistory={[historyEntry]}
        onPlayAgain={onPlayAgain}
        onBackToModes={onBackToModes}
      />,
    );

    expect(screen.getByRole("heading", { name: /Find the country scorecard/i })).toBeInTheDocument();
    expect(screen.getByText("95")).toBeInTheDocument();
    expect(screen.getByText(/Find the country - 40\/5 points/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Play again" }));
    expect(onPlayAgain).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Back to modes" }));
    expect(onBackToModes).toHaveBeenCalled();
  });

  it("hides hardest section when at most three rounds", () => {
    const small: ChallengeSummary = {
      ...summary,
      hardestRounds: [],
    };
    render(
      <ChallengeScorecardOverlay
        modeLabel="Find the flag"
        summary={small}
        latestHistory={[]}
        onPlayAgain={vi.fn()}
        onBackToModes={vi.fn()}
      />,
    );
    expect(screen.queryByText("Hardest flags")).not.toBeInTheDocument();
  });

  it("shows hardest section when more than three rounds", () => {
    render(
      <ChallengeScorecardOverlay
        modeLabel="Find the flag"
        summary={summary}
        latestHistory={[]}
        onPlayAgain={vi.fn()}
        onBackToModes={vi.fn()}
      />,
    );
    expect(screen.getByText("Hardest flags")).toBeInTheDocument();
    expect(screen.getByText(/One: 4 tries/)).toBeInTheDocument();
  });
});
