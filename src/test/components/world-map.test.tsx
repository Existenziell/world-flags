import { render } from "@testing-library/react";
import { DEFAULT_MAP_SETTINGS } from "@/src/constants";
import { WorldMap } from "@/src/components/WorldMap";
import type { Country } from "@/src/types/country";

const { mockUseMap } = vi.hoisted(() => ({
  mockUseMap: vi.fn(),
}));

vi.mock("@/src/hooks/useMap", () => ({
  useMap: mockUseMap,
}));

describe("WorldMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders map container and delegates to useMap", () => {
    const containerRef = { current: null };
    const onCountrySelect = vi.fn();
    const onFocusCountryClick = vi.fn();
    const focusCountry = null as Country | null;
    mockUseMap.mockReturnValue({ containerRef });

    const { container } = render(
      <WorldMap
        accessToken="abc-123"
        settings={DEFAULT_MAP_SETTINGS}
        onCountrySelect={onCountrySelect}
        mode="explore"
        focusCountry={focusCountry}
        showOnlyFocusMarker={false}
        focusMarkerVariant="flag"
        onFocusCountryClick={onFocusCountryClick}
      />,
    );

    expect(mockUseMap).toHaveBeenCalledWith({
      accessToken: "abc-123",
      settings: DEFAULT_MAP_SETTINGS,
      onCountrySelect,
      mode: "explore",
      focusCountry,
      flyToToken: undefined,
      showOnlyFocusMarker: false,
      focusMarkerVariant: "flag",
      onFocusCountryClick,
    });
    expect(container.firstChild).toHaveClass("absolute", "inset-0", "h-full", "w-full");
  });
});
