import type { Country } from "@/src/types/country";

export type WorldFlagsProps = {
  accessToken: string;
};

export type AppMode = "explore" | "challenge1" | "challenge2";

export type ChallengeRoundCountOption = 1 | 3 | 5 | 10 | 20 | 50 | 100 | "all";

export type ChallengeRunStatus = "idle" | "active" | "completed";

export type ChallengeRoundResult = {
  iso2: string;
  countryName: string;
  attempts: number;
  correct: boolean;
};

export type ChallengeSummary = {
  totalRounds: number;
  totalCorrect: number;
  score: number;
  totalAttempts: number;
  averageAttemptsPerRound: number;
  hardestRounds: ChallengeRoundResult[];
};

export type ChallengeHistoryEntry = {
  id: string;
  mode: Exclude<AppMode, "explore">;
  roundTarget: ChallengeRoundCountOption;
  startedAt: string;
  completedAt: string;
  summary: ChallengeSummary;
  rounds: ChallengeRoundResult[];
};

export type CountryNameSuggestionsDropdownProps = {
  query: string;
  countries: string[];
  isOpen: boolean;
  onSelect: (countryName: string) => void;
  maxItems?: number;
};

export type ChallengeTypeInputBarProps = {
  value: string;
  countrySuggestions: string[];
  roundLabel: string;
  attemptCount: number;
  isCorrect: boolean;
  isIncorrect: boolean;
  onChange: (value: string) => void;
  onSelectSuggestion: (countryName: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
};

export type ChallengeScorecardOverlayProps = {
  modeLabel: string;
  summary: ChallengeSummary;
  latestHistory: ChallengeHistoryEntry[];
  onPlayAgain: () => void;
  onBackToModes: () => void;
};

export type ChallengeSuccessPopupProps = {
  score: number;
  completedRounds: number;
  totalRounds: number;
  attemptsForRound: number;
  selectedFlagPath?: string | null;
  selectedFlagName?: string | null;
};

export type ChallengeFlagPickerOverlayProps = {
  countryName: string;
  options: Country[];
  selectedWrongIso2: string[];
  selectedCorrectIso2: string | null;
  onPick: (country: Country) => void;
  onClose: () => void;
};
