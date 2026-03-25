"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CHALLENGE_FLAG_PICKER_SIZE, CHALLENGE_SETUP_STORAGE_KEY } from "@/src/constants";
import { ChallengeFlagPickerOverlay } from "@/src/components/ChallengeFlagPickerOverlay";
import { ChallengeScorecardOverlay } from "@/src/components/ChallengeScorecardOverlay";
import { ChallengeSuccessPopup } from "@/src/components/ChallengeSuccessPopup";
import { ChallengeTypeInputBar } from "@/src/components/ChallengeTypeInputBar";
import type { Country } from "@/src/types/country";
import { CountryOverlay } from "@/src/components/CountryOverlay";
import { ModeSelectOverlay } from "@/src/components/ModeSelectOverlay";
import { SettingsOverlay } from "@/src/components/SettingsOverlay";
import { WorldMap } from "@/src/components/WorldMap";
import { useChallengeHistory } from "@/src/hooks/useChallengeHistory";
import { usePersistentSettings } from "@/src/hooks/usePersistentSettings";
import { normalizeChallengeAnswer } from "@/src/lib/challenge-answer";
import { buildChallengeSummary } from "@/src/lib/challenge-summary";
import { parseChallengeSetupFromStorage } from "@/src/lib/challenge-setup";
import { allCountries } from "@/src/lib/country-lookup";
import { shuffleArray } from "@/src/lib/shuffle";
import type {
  AppMode,
  ChallengeHistoryEntry,
  ChallengeRoundCountOption,
  ChallengeRoundResult,
  ChallengeSummary,
  WorldFlagsProps,
} from "@/src/types/world-flags";

export function WorldFlags({ accessToken }: WorldFlagsProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, setSettings } = usePersistentSettings();
  const { history, addEntry } = useChallengeHistory();
  const [modeSelectOpen, setModeSelectOpen] = useState(true);
  const [selectedMode, setSelectedMode] = useState<AppMode>("explore");
  const [selectedRoundTarget, setSelectedRoundTarget] = useState<ChallengeRoundCountOption>(20);
  const [activeMode, setActiveMode] = useState<AppMode>("explore");
  const [challengeCountries, setChallengeCountries] = useState<Country[]>([]);
  const [roundResults, setRoundResults] = useState<ChallengeRoundResult[]>([]);
  const [finalSummary, setFinalSummary] = useState<ChallengeSummary | null>(null);
  const [runStartedAt, setRunStartedAt] = useState<string | null>(null);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [challengeFlyToToken, setChallengeFlyToToken] = useState(0);
  const [currentRoundAttempts, setCurrentRoundAttempts] = useState(0);
  const [challengeInput, setChallengeInput] = useState("");
  const [challengeInputCorrect, setChallengeInputCorrect] = useState(false);
  const [challengeInputIncorrect, setChallengeInputIncorrect] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [flagPickerOpen, setFlagPickerOpen] = useState(false);
  const [wrongFlagSelections, setWrongFlagSelections] = useState<string[]>([]);
  const [correctFlagSelection, setCorrectFlagSelection] = useState<string | null>(null);
  const [successFlagPreview, setSuccessFlagPreview] = useState<{ flagPath: string; name: string } | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const storedSetup = parseChallengeSetupFromStorage();
      setSelectedMode(storedSetup.mode);
      setSelectedRoundTarget(storedSetup.roundTarget);
    });
  }, []);

  const activeChallengeCountry =
    activeMode === "explore" ? null : (challengeCountries[currentRoundIndex] ?? null);
  const challenge1CountrySuggestions = useMemo(
    () =>
      [...new Set(allCountries.map((country) => country.name).filter((name) => name.trim().length > 0))].sort(
        (left, right) => left.localeCompare(right),
      ),
    [],
  );

  const mapSettings = useMemo(() => settings, [settings]);

  const prepareChallengeRun = useCallback((mode: Exclude<AppMode, "explore">) => {
    const eligible = allCountries.filter((country) => country.markerLat !== null && country.markerLng !== null);
    const pool = shuffleArray(eligible);
    const limit = selectedRoundTarget === "all" ? pool.length : Math.min(selectedRoundTarget, pool.length);
    const nextCountries = pool.slice(0, limit);
    setActiveMode(mode);
    setChallengeCountries(nextCountries);
    setRoundResults([]);
    setFinalSummary(null);
    setCurrentRoundIndex(0);
    setScore(0);
    setChallengeFlyToToken((value) => value + 1);
    setCurrentRoundAttempts(0);
    setChallengeInput("");
    setChallengeInputCorrect(false);
    setChallengeInputIncorrect(false);
    setShowSuccessPopup(false);
    setFlagPickerOpen(false);
    setWrongFlagSelections([]);
    setCorrectFlagSelection(null);
    setSuccessFlagPreview(null);
    setRunStartedAt(new Date().toISOString());
    setSettings((current) =>
      current.mapStyle === "satellite" ? current : { ...current, mapStyle: "satellite" },
    );
  }, [selectedRoundTarget, setSettings]);

  const completeRoundAndContinue = useCallback(
    (round: ChallengeRoundResult, nextScore: number) => {
      const updatedRounds = [...roundResults, round];
      setRoundResults(updatedRounds);
      const isLastRound = currentRoundIndex + 1 >= challengeCountries.length;
      if (isLastRound) {
        const summary = buildChallengeSummary(updatedRounds);
        setFinalSummary(summary);
        const entry: ChallengeHistoryEntry = {
          id: crypto.randomUUID(),
          mode: activeMode === "explore" ? "challenge1" : activeMode,
          roundTarget: selectedRoundTarget,
          startedAt: runStartedAt ?? new Date().toISOString(),
          completedAt: new Date().toISOString(),
          summary,
          rounds: updatedRounds,
        };
        addEntry(entry);
        setModeSelectOpen(false);
        return;
      }

      setCurrentRoundIndex((value) => value + 1);
      setScore(nextScore);
      if (activeMode === "challenge1") {
        setChallengeFlyToToken((value) => value + 1);
      }
      setCurrentRoundAttempts(0);
      setChallengeInput("");
      setChallengeInputCorrect(false);
      setChallengeInputIncorrect(false);
      setFlagPickerOpen(false);
      setWrongFlagSelections([]);
      setCorrectFlagSelection(null);
      setTimeout(() => {
        setShowSuccessPopup(false);
        setSuccessFlagPreview(null);
      }, 4000);
    },
    [
      activeMode,
      addEntry,
      challengeCountries.length,
      currentRoundIndex,
      roundResults,
      runStartedAt,
      selectedRoundTarget,
    ],
  );

  const handleCountrySelect = useCallback(
    (country: Country | null) => {
      if (activeMode !== "explore") {
        return;
      }
      setSelectedCountry((current) => {
        if (!country) {
          return null;
        }
        if (current?.iso2 === country.iso2) {
          return null;
        }
        return country;
      });
    },
    [activeMode],
  );

  const startSelectedMode = useCallback(() => {
    window.localStorage.setItem(
      CHALLENGE_SETUP_STORAGE_KEY,
      JSON.stringify({ mode: selectedMode, roundTarget: selectedRoundTarget }),
    );
    setModeSelectOpen(false);
    setSelectedCountry(null);
    setSettingsOpen(false);
    if (selectedMode === "explore") {
      setActiveMode("explore");
      setChallengeCountries([]);
      setRoundResults([]);
      setFinalSummary(null);
      return;
    }
    prepareChallengeRun(selectedMode);
  }, [prepareChallengeRun, selectedMode, selectedRoundTarget]);

  const handleChallenge1Submit = useCallback(() => {
    const targetCountry = activeChallengeCountry;
    if (!targetCountry) {
      return;
    }
    const nextAttempts = currentRoundAttempts + 1;
    setCurrentRoundAttempts(nextAttempts);

    const acceptedNames = [targetCountry.name, targetCountry.officialName, ...targetCountry.altSpellings]
      .filter((value): value is string => Boolean(value))
      .map(normalizeChallengeAnswer);
    const submitted = normalizeChallengeAnswer(challengeInput);
    if (!acceptedNames.includes(submitted)) {
      setChallengeInputCorrect(false);
      setChallengeInputIncorrect(true);
      setChallengeInput("");
      return;
    }

    const nextScore = score + 1;
    setScore(nextScore);
    setChallengeInputCorrect(true);
    setChallengeInputIncorrect(false);
    setShowSuccessPopup(true);
    completeRoundAndContinue(
      {
        iso2: targetCountry.iso2,
        countryName: targetCountry.name,
        attempts: nextAttempts,
        correct: true,
      },
      nextScore,
    );
  }, [
    activeChallengeCountry,
    challengeInput,
    completeRoundAndContinue,
    currentRoundAttempts,
    score,
  ]);

  const challenge2Options = useMemo(() => {
    if (!activeChallengeCountry) {
      return [];
    }
    const distractors = shuffleArray(
      allCountries.filter((country) => country.iso2 !== activeChallengeCountry.iso2),
    ).slice(0, Math.max(CHALLENGE_FLAG_PICKER_SIZE - 1, 0));
    const options = shuffleArray([activeChallengeCountry, ...distractors]).slice(
      0,
      CHALLENGE_FLAG_PICKER_SIZE,
    );
    if (!options.some((country) => country.iso2 === activeChallengeCountry.iso2)) {
      if (options.length < CHALLENGE_FLAG_PICKER_SIZE) {
        options.push(activeChallengeCountry);
      } else if (options.length > 0) {
        options[options.length - 1] = activeChallengeCountry;
      }
    }
    return shuffleArray(options);
  }, [activeChallengeCountry]);

  const handleChallenge2Pick = useCallback(
    (country: Country) => {
      const targetCountry = activeChallengeCountry;
      if (!targetCountry) {
        return;
      }
      const nextAttempts = currentRoundAttempts + 1;
      setCurrentRoundAttempts(nextAttempts);

      if (country.iso2 !== targetCountry.iso2) {
        setWrongFlagSelections((current) =>
          current.includes(country.iso2) ? current : [...current, country.iso2],
        );
        return;
      }

      const nextScore = score + 1;
      setScore(nextScore);
      setCorrectFlagSelection(country.iso2);
      setSuccessFlagPreview({
        flagPath: country.flagPath,
        name: country.name,
      });
      setShowSuccessPopup(true);
      setChallengeFlyToToken((value) => value + 1);
      completeRoundAndContinue(
        {
          iso2: targetCountry.iso2,
          countryName: targetCountry.name,
          attempts: nextAttempts,
          correct: true,
        },
        nextScore,
      );
    },
    [activeChallengeCountry, completeRoundAndContinue, currentRoundAttempts, score],
  );

  const handleChallenge1Skip = useCallback(() => {
    const targetCountry = activeChallengeCountry;
    if (!targetCountry) {
      return;
    }

    setChallengeInput("");
    setChallengeInputCorrect(false);
    setChallengeInputIncorrect(false);
    completeRoundAndContinue(
      {
        iso2: targetCountry.iso2,
        countryName: targetCountry.name,
        attempts: currentRoundAttempts,
        correct: false,
      },
      score,
    );
  }, [activeChallengeCountry, completeRoundAndContinue, currentRoundAttempts, score]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      <WorldMap
        accessToken={accessToken}
        settings={mapSettings}
        onCountrySelect={handleCountrySelect}
        mode={activeMode}
        focusCountry={activeChallengeCountry}
        flyToToken={challengeFlyToToken}
        showOnlyFocusMarker={activeMode !== "explore"}
        focusMarkerVariant={activeMode === "challenge2" ? "name" : "flag"}
        onFocusCountryClick={(country) => {
          if (activeMode === "challenge2" && activeChallengeCountry?.iso2 === country.iso2) {
            setFlagPickerOpen(true);
          }
        }}
      />

      <button
        type="button"
        onClick={() => setSettingsOpen((value) => !value)}
        className="absolute right-4 top-4 z-50 cursor-pointer rounded-full border border-black/30 bg-white/95 p-2 text-zinc-900 shadow-lg transition hover:scale-105 dark:border-white/30 dark:bg-zinc-900/95 dark:text-zinc-50"
        aria-label="Open settings"
      >
        <Image
          src="/icons/gear.svg"
          alt="Settings"
          width={24}
          height={24}
          loading="eager"
          className="dark:invert"
        />
      </button>

      {selectedCountry && activeMode === "explore" ? (
        <CountryOverlay country={selectedCountry} onClose={() => setSelectedCountry(null)} />
      ) : null}

      {settingsOpen ? (
        <SettingsOverlay
          settings={settings}
          onChange={setSettings}
          hideMapStyle={activeMode !== "explore"}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}

      {activeMode === "challenge1" && activeChallengeCountry ? (
        <ChallengeTypeInputBar
          value={challengeInput}
          countrySuggestions={challenge1CountrySuggestions}
          roundLabel={`Round ${currentRoundIndex + 1}/${challengeCountries.length}`}
          attemptCount={currentRoundAttempts}
          isCorrect={challengeInputCorrect}
          isIncorrect={challengeInputIncorrect}
          onChange={(value) => {
            setChallengeInput(value);
            setChallengeInputCorrect(false);
            setChallengeInputIncorrect(false);
          }}
          onSelectSuggestion={(countryName) => {
            setChallengeInput(countryName);
            setChallengeInputCorrect(false);
            setChallengeInputIncorrect(false);
          }}
          onSubmit={handleChallenge1Submit}
          onSkip={handleChallenge1Skip}
        />
      ) : null}

      {activeMode === "challenge2" && activeChallengeCountry ? (
        <div className="absolute left-4 top-4 z-40 rounded-lg border border-black/20 bg-white/90 px-3 py-2 text-sm shadow-lg dark:border-white/20 dark:bg-zinc-900/90">
          <p className="font-medium">Find the flag</p>
          <p className="mt-1 text-lg font-semibold leading-tight">Find flag for: {activeChallengeCountry.name}</p>
          <p className="mt-0.5">
            Round {currentRoundIndex + 1}/{challengeCountries.length} | Tries {currentRoundAttempts}
          </p>
        </div>
      ) : null}

      {flagPickerOpen && activeMode === "challenge2" && activeChallengeCountry ? (
        <ChallengeFlagPickerOverlay
          countryName={activeChallengeCountry.name}
          options={challenge2Options}
          selectedWrongIso2={wrongFlagSelections}
          selectedCorrectIso2={correctFlagSelection}
          onPick={handleChallenge2Pick}
          onClose={() => setFlagPickerOpen(false)}
        />
      ) : null}

      {showSuccessPopup && activeMode !== "explore" ? (
        <ChallengeSuccessPopup
          score={score}
          completedRounds={Math.min(currentRoundIndex + 1, challengeCountries.length)}
          totalRounds={challengeCountries.length}
          attemptsForRound={currentRoundAttempts}
          selectedFlagPath={activeMode === "challenge2" ? successFlagPreview?.flagPath : null}
          selectedFlagName={activeMode === "challenge2" ? successFlagPreview?.name : null}
        />
      ) : null}

      {finalSummary && activeMode !== "explore" ? (
        <ChallengeScorecardOverlay
          modeLabel={activeMode === "challenge1" ? "Find the country" : "Find the flag"}
          summary={finalSummary}
          latestHistory={history}
          onPlayAgain={() => {
            prepareChallengeRun(activeMode);
          }}
          onBackToModes={() => {
            setActiveMode("explore");
            setFinalSummary(null);
            setSuccessFlagPreview(null);
            setModeSelectOpen(true);
          }}
        />
      ) : null}

      {modeSelectOpen ? (
        <ModeSelectOverlay
          selectedMode={selectedMode}
          selectedRoundTarget={selectedRoundTarget}
          history={history}
          onModeChange={setSelectedMode}
          onRoundTargetChange={setSelectedRoundTarget}
          onStart={startSelectedMode}
        />
      ) : null}
    </div>
  );
}
