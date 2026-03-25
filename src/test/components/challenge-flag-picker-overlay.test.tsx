import { fireEvent, render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { ChallengeFlagPickerOverlay } from "@/src/components/ChallengeFlagPickerOverlay";
import type { Country } from "@/src/types/country";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt ?? ""} />,
}));

const country = (iso2: string, name: string): Country =>
  ({
    iso2,
    iso3: iso2,
    name,
    officialName: name,
    countryCreationDate: null,
    independenceDate: null,
    altSpellings: [],
    population: null,
    region: null,
    subregion: null,
    unMember: null,
    status: null,
    borders: [],
    continents: [],
    capital: null,
    areaKm2: null,
    latlng: null,
    drivingSide: null,
    callingCodes: [],
    internetTlds: [],
    googleMapsUrl: null,
    openStreetMapsUrl: null,
    wikipediaUrl: "",
    languages: [],
    currencies: [],
    timezones: [],
    independent: null,
    landlocked: null,
    startOfWeek: null,
    flagPath: `/flags/${iso2.toLowerCase()}.svg`,
    flag: { aspectRatio: null, notableHistory: null, sources: [] },
    markerLng: null,
    markerLat: null,
  }) as Country;

describe("ChallengeFlagPickerOverlay", () => {
  it("renders options and wires pick and close", () => {
    const onPick = vi.fn();
    const onClose = vi.fn();
    const a = country("AA", "Alpha");
    const b = country("BB", "Bravo");

    render(
      <ChallengeFlagPickerOverlay
        countryName="Alpha"
        options={[a, b]}
        selectedWrongIso2={["BB"]}
        selectedCorrectIso2={null}
        onPick={onPick}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole("heading", { name: /Select flag for: Alpha/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Alpha flag/i }));
    expect(onPick).toHaveBeenCalledWith(a);
    fireEvent.click(screen.getByRole("button", { name: "Close flag picker" }));
    expect(onClose).toHaveBeenCalled();
  });
});
