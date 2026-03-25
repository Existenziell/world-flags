import { fireEvent, render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { DEFAULT_MAP_SETTINGS } from "@/src/constants";
import { CountryExplorer } from "@/src/components/CountryExplorer";
import type { Country } from "@/src/types/country";

const { mockUsePersistentSettings, mockSetSettings } = vi.hoisted(() => ({
  mockUsePersistentSettings: vi.fn(),
  mockSetSettings: vi.fn(),
}));

const testCountry: Country = {
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
  markerLng: 10,
  markerLat: 51,
};

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

vi.mock("@/src/hooks/usePersistentSettings", () => ({
  usePersistentSettings: mockUsePersistentSettings,
}));

vi.mock("@/src/components/WorldMap", () => ({
  WorldMap: ({
    onCountrySelect,
  }: {
    onCountrySelect: (country: Country | null) => void;
  }) => (
    <div>
      <button type="button" onClick={() => onCountrySelect(testCountry)}>
        select-country
      </button>
    </div>
  ),
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
  SettingsOverlay: ({
    onClose,
  }: {
    onClose: () => void;
  }) => (
    <div>
      <span>settings-overlay</span>
      <button type="button" onClick={onClose}>
        close-settings
      </button>
    </div>
  ),
}));

describe("CountryExplorer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePersistentSettings.mockReturnValue({
      settings: DEFAULT_MAP_SETTINGS,
      setSettings: mockSetSettings,
      isReady: true,
    });
  });

  it("toggles settings overlay from settings button", () => {
    render(<CountryExplorer accessToken="token" />);

    expect(screen.queryByText("settings-overlay")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
    expect(screen.getByText("settings-overlay")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "close-settings" }));
    expect(screen.queryByText("settings-overlay")).not.toBeInTheDocument();
  });

  it("shows selected country overlay and closes it", () => {
    render(<CountryExplorer accessToken="token" />);

    fireEvent.click(screen.getByRole("button", { name: "select-country" }));
    expect(screen.getByText("overlay:Germany")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "close-country" }));
    expect(screen.queryByText("overlay:Germany")).not.toBeInTheDocument();
  });
});
