import { render } from "@testing-library/react";
import { DEFAULT_MAP_SETTINGS } from "@/src/constants";
import { WorldMap } from "@/src/components/WorldMap";

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
    mockUseMap.mockReturnValue({ containerRef });

    const { container } = render(
      <WorldMap
        accessToken="abc-123"
        settings={DEFAULT_MAP_SETTINGS}
        onCountrySelect={onCountrySelect}
      />,
    );

    expect(mockUseMap).toHaveBeenCalledWith({
      accessToken: "abc-123",
      settings: DEFAULT_MAP_SETTINGS,
      onCountrySelect,
    });
    expect(container.firstChild).toHaveClass("absolute", "inset-0", "h-full", "w-full");
  });
});
