import type { ChallengeRoundResult, ChallengeSummary } from "@/src/types/world-flags";

export function buildChallengeSummary(rounds: ChallengeRoundResult[]): ChallengeSummary {
  const totalRounds = rounds.length;
  const totalCorrect = rounds.filter((round) => round.correct).length;
  const totalAttempts = rounds.reduce((sum, round) => sum + round.attempts, 0);
  const score = rounds.reduce(
    (sum, round) => sum + (round.correct ? Math.max(0, 11 - round.attempts) : -3),
    0,
  );
  const hardestRounds = [...rounds].sort((a, b) => b.attempts - a.attempts);
  return {
    totalRounds,
    totalCorrect,
    score,
    totalAttempts,
    averageAttemptsPerRound: totalRounds ? totalAttempts / totalRounds : 0,
    hardestRounds,
  };
}
