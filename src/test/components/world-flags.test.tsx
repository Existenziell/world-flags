import { fireEvent, render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { CHALLENGE_FLAG_PICKER_SIZE, DEFAULT_MAP_SETTINGS } from "@/src/constants";
import { WorldFlags } from "@/src/components/WorldFlags";
import type { Country } from "@/src/types/country";

const { mockUsePersistentSettings, mockSetSettings, mockUseChallengeHistory, mockAddHistoryEntry } =
  vi.hoisted(() => ({
  mockUsePersistentSettings: vi.fn(),
  mockSetSettings: vi.fn(),
  mockUseChallengeHistory: vi.fn(),
  mockAddHistoryEntry: vi.fn(),
}));

const { mockWorldMap, mockFlagPickerOverlay, mockSettingsOverlay } = vi.hoisted(() => ({
  mockWorldMap: vi.fn(),
  mockFlagPickerOverlay: vi.fn(),
  mockSettingsOverlay: vi.fn(),
}));

const { testCountry, challengeCountries } = vi.hoisted(() => {
  const baseCountry: Country = {
    iso2: "DE",
    iso3: "DEU",
    name: "Germany",
    officialName: "Federal Republic of Germany",
    countryCreationDate: "1949-05-23",
    independenceDate: "1949-05-23",
    altSpellings: ["DE"],
    population: 83240525,
    region: "Europe",
    subregion: "Western Europe",
    unMember: true,
    status: "officially-assigned",
    borders: ["AUT"],
    continents: ["Europe"],
    capital: "Berlin",
    areaKm2: 357114,
    latlng: [51, 9],
    drivingSide: "right",
    callingCodes: ["+49"],
    internetTlds: [".de"],
    googleMapsUrl: null,
    openStreetMapsUrl: null,
    wikipediaUrl: "https://en.wikipedia.org/wiki/Germany",
    languages: ["German"],
    currencies: ["Euro"],
    timezones: ["UTC+1"],
    independent: true,
    landlocked: false,
    startOfWeek: "monday",
    flagPath: "/flags/de.svg",
    flag: {
      aspectRatio: "3:2",
      notableHistory: null,
      sources: ["https://en.wikipedia.org/wiki/Flag_of_Germany"],
    },
    markerLng: 10,
    markerLat: 51,
  };

  const makeCountry = (index: number): Country => {
    // Two-char codes must stay unique (avoid slice(0,2) on "C10"/"C11", which both become "C1").
    const iso2 = String(index).padStart(2, "0");
    const iso3 = String(index).padStart(3, "0");
    return {
      ...baseCountry,
      iso2,
      iso3,
      name: `Country ${index}`,
      officialName: `Country ${index} Official`,
      altSpellings: [`Country${index}`],
      flagPath: `/flags/country-${index}.svg`,
      markerLng: index,
      markerLat: index,
    };
  };

  const countries: Country[] = Array.from({ length: 30 }, (_, index) => makeCountry(index + 1));
  const target: Country = {
    ...baseCountry,
    iso2: "DE",
    iso3: "DEU",
    name: "Germany",
    officialName: "Federal Republic of Germany",
    altSpellings: ["DE", "Germany"],
  };
  countries[0] = target;

  return {
    testCountry: baseCountry,
    challengeCountries: countries,
  };
});

vi.mock("@/src/lib/country-lookup", () => ({
  allCountries: challengeCountries,
}));

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

vi.mock("@/src/hooks/usePersistentSettings", () => ({
  usePersistentSettings: mockUsePersistentSettings,
}));

vi.mock("@/src/hooks/useChallengeHistory", () => ({
  useChallengeHistory: mockUseChallengeHistory,
}));

vi.mock("@/src/components/WorldMap", () => ({
  WorldMap: (props: {
    onCountrySelect: (country: Country | null) => void;
    focusCountry?: Country | null;
    onFocusCountryClick?: (country: Country) => void;
  }) => {
    mockWorldMap(props);
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            props.onCountrySelect(testCountry);
          }}
        >
          select-country
        </button>
        <button
          type="button"
          onClick={() => {
            if (props.focusCountry) {
              props.onFocusCountryClick?.(props.focusCountry);
            }
          }}
        >
          click-focus-country
        </button>
      </div>
    );
  },
}));

vi.mock("@/src/components/ChallengeFlagPickerOverlay", () => ({
  ChallengeFlagPickerOverlay: (props: {
    countryName: string;
    options: Country[];
    onPick: (country: Country) => void;
    onClose: () => void;
  }) => {
    mockFlagPickerOverlay(props);
    const correctChoice = props.options.find((country) => country.name === props.countryName) ?? props.options[0];
    const wrongChoice = props.options.find((country) => country.name !== props.countryName) ?? props.options[0];
    return (
      <div>
        <span>flag-picker:{props.countryName}</span>
        <span>flag-picker-count:{props.options.length}</span>
        <button type="button" onClick={() => props.onPick(wrongChoice)}>
          pick-wrong
        </button>
        <button type="button" onClick={() => props.onPick(correctChoice)}>
          pick-correct
        </button>
        <button type="button" onClick={props.onClose}>
          close-flag-picker
        </button>
      </div>
    );
  },
}));

vi.mock("@/src/components/CountryOverlay", () => ({
  CountryOverlay: ({
    country,
    onClose,
  }: {
    country: Country;
    onClose: () => void;
  }) => (
    <div>
      <span>overlay:{country.name}</span>
      <button type="button" onClick={onClose}>
        close-country
      </button>
    </div>
  ),
}));

vi.mock("@/src/components/SettingsOverlay", () => ({
  SettingsOverlay: (props: {
    onClose: () => void;
    hideMapStyle?: boolean;
  }) => {
    mockSettingsOverlay(props);
    return (
      <div>
        <span>settings-overlay</span>
        <span>hide-map-style:{String(Boolean(props.hideMapStyle))}</span>
        <button type="button" onClick={props.onClose}>
          close-settings
        </button>
      </div>
    );
  },
}));

describe("WorldFlags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    vi.stubGlobal("queueMicrotask", (callback: () => void) => {
      callback();
    });
    mockUsePersistentSettings.mockReturnValue({
      settings: DEFAULT_MAP_SETTINGS,
      setSettings: mockSetSettings,
      isReady: true,
    });
    mockUseChallengeHistory.mockReturnValue({
      history: [],
      addEntry: mockAddHistoryEntry,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows mode selection overlay on first load", () => {
    render(<WorldFlags accessToken="token" />);
    expect(screen.getByText("Choose a mode")).toBeInTheDocument();
  });

  it("runs challenge 1 and tracks attempts", () => {
    render(<WorldFlags accessToken="token" />);

    fireEvent.click(screen.getByRole("button", { name: /Find the country/i }));
    fireEvent.change(screen.getByLabelText("Number of rounds"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    const input = screen.getByLabelText("Enter the country name");
    fireEvent.change(input, { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByText("Tries this flag: 1")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Germany" } });
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByText("Tries this flag: 2")).toBeInTheDocument();
  });

  it("shows prefix country suggestions and allows selecting one", () => {
    render(<WorldFlags accessToken="token" />);

    fireEvent.click(screen.getByRole("button", { name: /Find the country/i }));
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    const input = screen.getByLabelText("Enter the country name");
    expect(screen.queryByRole("listbox", { name: "Country suggestions" })).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "g" } });
    expect(screen.getByRole("listbox", { name: "Country suggestions" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Germany" }));
    expect(input).toHaveValue("Germany");

    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByText("Tries this flag: 1")).toBeInTheDocument();
  });

  it("places skip to the right of tries text", () => {
    render(<WorldFlags accessToken="token" />);

    fireEvent.click(screen.getByRole("button", { name: /Find the country/i }));
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    const skipButton = screen.getByRole("button", { name: "Skip" });
    const triesText = screen.getByText("Tries this flag: 0");
    const infoRow = triesText.parentElement;

    expect(infoRow).not.toBeNull();
    expect(infoRow).toContainElement(skipButton);
    expect(infoRow).toHaveClass("flex", "items-center", "justify-between");
  });

  it("forces satellite style and keeps settings gear in challenge mode", () => {
    render(<WorldFlags accessToken="token" />);

    fireEvent.click(screen.getByRole("button", { name: /Find the country/i }));
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    expect(screen.getByRole("button", { name: "Open settings" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
    expect(screen.getByText("settings-overlay")).toBeInTheDocument();
    expect(screen.getByText("hide-map-style:true")).toBeInTheDocument();
    expect(mockSetSettings).toHaveBeenCalled();
    const updater = mockSetSettings.mock.calls[0]?.[0] as (settings: typeof DEFAULT_MAP_SETTINGS) => typeof DEFAULT_MAP_SETTINGS;
    const updated = updater(DEFAULT_MAP_SETTINGS);
    expect(updated.mapStyle).toBe("satellite");
  });

  it("uses name marker for challenge2 and keeps target in picker options", () => {
    render(<WorldFlags accessToken="token" />);

    fireEvent.click(screen.getByRole("button", { name: /Find the flag/i }));
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    fireEvent.click(screen.getByRole("button", { name: "click-focus-country" }));

    expect(screen.getByText(/flag-picker:/)).toBeInTheDocument();
    expect(screen.getByText(`flag-picker-count:${CHALLENGE_FLAG_PICKER_SIZE}`)).toBeInTheDocument();

    const latestMapProps = mockWorldMap.mock.calls.at(-1)?.[0] as {
      mode?: string;
      focusMarkerVariant?: string;
      focusCountry?: Country | null;
    };
    expect(latestMapProps.mode).toBe("challenge2");
    expect(latestMapProps.focusMarkerVariant).toBe("name");

    const latestPickerProps = mockFlagPickerOverlay.mock.calls.at(-1)?.[0] as { options: Country[] };
    expect(
      latestPickerProps.options.some((country) => country.iso2 === latestMapProps.focusCountry?.iso2),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "pick-correct" }));
    expect(screen.getByAltText(/Selected flag:/i)).toBeInTheDocument();
    const flyToTokens = mockWorldMap.mock.calls
      .map((call) => call[0]?.flyToToken)
      .filter((value): value is number => typeof value === "number");
    expect(flyToTokens.at(-1)).toBeGreaterThan(flyToTokens[0] ?? 0);
  });

  it("uses retry-weighted points in challenge2 scorecard", () => {
    render(<WorldFlags accessToken="token" />);

    fireEvent.click(screen.getByRole("button", { name: /Find the flag/i }));
    fireEvent.change(screen.getByLabelText("Number of rounds"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    fireEvent.click(screen.getByRole("button", { name: "click-focus-country" }));
    fireEvent.click(screen.getByRole("button", { name: "pick-wrong" }));
    fireEvent.click(screen.getByRole("button", { name: "pick-correct" }));

    for (let index = 0; index < 9; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "click-focus-country" }));
      fireEvent.click(screen.getByRole("button", { name: "pick-correct" }));
    }

    expect(screen.getByText("Find the flag scorecard")).toBeInTheDocument();
    expect(screen.getByText("99")).toBeInTheDocument();
  });

  it("caps per-round retry points at zero", () => {
    render(<WorldFlags accessToken="token" />);

    fireEvent.click(screen.getByRole("button", { name: /Find the flag/i }));
    fireEvent.change(screen.getByLabelText("Number of rounds"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    fireEvent.click(screen.getByRole("button", { name: "click-focus-country" }));
    for (let index = 0; index < 11; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "pick-wrong" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "pick-correct" }));

    for (let index = 0; index < 9; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "click-focus-country" }));
      fireEvent.click(screen.getByRole("button", { name: "pick-correct" }));
    }

    expect(screen.getByText("Find the flag scorecard")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();
  });

  it("shows challenge labels in recent runs", () => {
    mockUseChallengeHistory.mockReturnValue({
      history: [
        {
          id: "entry-1",
          mode: "challenge2",
          roundTarget: 10,
          startedAt: "2026-03-25T00:00:00.000Z",
          completedAt: "2026-03-25T00:01:00.000Z",
          summary: {
            totalRounds: 10,
            totalCorrect: 10,
            score: 99,
            totalAttempts: 11,
            averageAttemptsPerRound: 1.1,
            hardestRounds: [],
          },
          rounds: [],
        },
      ],
      addEntry: mockAddHistoryEntry,
    });

    render(<WorldFlags accessToken="token" />);

    expect(screen.getByText(/Find the flag - 99\/10 points/)).toBeInTheDocument();
    expect(screen.queryByText(/challenge2 -/i)).not.toBeInTheDocument();
  });

  it("applies skip penalty to final points", () => {
    render(<WorldFlags accessToken="token" />);

    fireEvent.click(screen.getByRole("button", { name: /Find the country/i }));
    fireEvent.change(screen.getByLabelText("Number of rounds"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    for (let index = 0; index < 10; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    }

    expect(screen.getByText("Find the country scorecard")).toBeInTheDocument();
    expect(screen.getByText("-30")).toBeInTheDocument();
  });
});
