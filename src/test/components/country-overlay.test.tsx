import { render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { CountryOverlay } from "@/src/components/CountryOverlay";
import type { Country } from "@/src/types/country";
import { DEFAULT_COUNTRY_MEMBERSHIPS } from "@/src/types/country";

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    const { priority, ...rest } = props;
    void priority;
    // Test double for next/image; real app uses optimized Image.
    // eslint-disable-next-line @next/next/no-img-element -- mock only
    return <img {...rest} alt={rest.alt ?? ""} />;
  },
}));

describe("CountryOverlay", () => {
  it("renders country information fields", () => {
    const country: Country = {
      iso2: "DE",
      iso3: "DEU",
      name: "Germany",
      officialName: "Federal Republic of Germany",
      countryCreationDate: "1949-05-23",
      independenceDate: "1949-05-23",
      altSpellings: ["DE", "Federal Republic of Germany"],
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
      wikipediaUrl: "https://en.wikipedia.org/wiki/Germany",
      languages: ["German"],
      currencies: ["Euro (€)"],
      timezones: ["UTC+01:00"],
      independent: true,
      landlocked: false,
      startOfWeek: "monday",
      flagPath: "/flags/de.svg",
      flag: {
        aspectRatio: "3:2",
        notableHistory: null,
        sources: ["https://en.wikipedia.org/wiki/Flag_of_Germany"],
      },
      memberships: {
        ...DEFAULT_COUNTRY_MEMBERSHIPS,
        eu: true,
        nato: true,
        g7: true,
        g20: true,
      },
      colonizer: null,
      wasColonized: null,
    };

    render(
      <CountryOverlay
        country={country}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("Germany")).toBeInTheDocument();
    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(screen.getByText("83,240,525")).toBeInTheDocument();
  });

  it("shows colonizer for dependent territories", () => {
    const territory: Country = {
      iso2: "AI",
      iso3: "AIA",
      name: "Anguilla",
      officialName: "Anguilla",
      countryCreationDate: null,
      independenceDate: null,
      altSpellings: ["AI"],
      population: 15000,
      region: "Americas",
      subregion: "Caribbean",
      unMember: false,
      status: "officially-assigned",
      borders: [],
      continents: ["North America"],
      capital: "The Valley",
      areaKm2: 91,
      latlng: [18.22, -63.05],
      drivingSide: "left",
      callingCodes: ["+1264"],
      internetTlds: [".ai"],
      wikipediaUrl: "https://en.wikipedia.org/wiki/Anguilla",
      languages: ["English"],
      currencies: ["East Caribbean dollar"],
      timezones: ["UTC-04:00"],
      independent: false,
      colonizer: "United Kingdom",
      landlocked: false,
      startOfWeek: "monday",
      flagPath: "/flags/ai.svg",
      flag: { aspectRatio: "3:2", notableHistory: null, sources: [] },
      memberships: DEFAULT_COUNTRY_MEMBERSHIPS,
      wasColonized: null,
    };

    render(<CountryOverlay country={territory} onClose={() => {}} />);
    expect(screen.getByText("Colonizer")).toBeInTheDocument();
    expect(screen.getByText("United Kingdom")).toBeInTheDocument();
  });
});
