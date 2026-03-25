import { renderHook } from "@testing-library/react";
import { DEFAULT_MAP_SETTINGS } from "@/src/constants";
import { useMap } from "@/src/hooks/useMap";

const { mockUseMapInstance, mockUseMapInteractions, mockUseMapSync } = vi.hoisted(() => ({
  mockUseMapInstance: vi.fn(),
  mockUseMapInteractions: vi.fn(),
  mockUseMapSync: vi.fn(),
}));

vi.mock("@/src/hooks/useMapInstance", () => ({
  useMapInstance: mockUseMapInstance,
}));

vi.mock("@/src/hooks/useMapInteractions", () => ({
  useMapInteractions: mockUseMapInteractions,
}));

vi.mock("@/src/hooks/useMapSync", () => ({
  useMapSync: mockUseMapSync,
}));

describe("useMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMapInstance.mockReturnValue({
      containerRef: { current: null },
      mapRef: { current: null },
      mapReadyKey: 11,
    });
  });

  it("wires map hooks with current refs and returns container ref", () => {
    const onCountrySelectA = vi.fn();
    const onCountrySelectB = vi.fn();
    const settingsA = DEFAULT_MAP_SETTINGS;
    const settingsB = {
      ...DEFAULT_MAP_SETTINGS,
      projection: "mercator" as const,
      mapStyle: "satellite" as const,
    };

    const { result, rerender } = renderHook(
      ({ settings, onCountrySelect }) =>
        useMap({
          accessToken: "token-1",
          settings,
          onCountrySelect,
          mode: "explore",
          focusCountry: null,
          exploreCountries: [],
        }),
      {
        initialProps: {
          settings: settingsA,
          onCountrySelect: onCountrySelectA,
        },
      },
    );

    expect(mockUseMapInstance).toHaveBeenCalledWith({
      accessToken: "token-1",
      settings: settingsA,
    });
    expect(mockUseMapInteractions).toHaveBeenCalledTimes(1);
    expect(mockUseMapSync).toHaveBeenCalledTimes(1);

    const firstInteractionsArgs = mockUseMapInteractions.mock.calls[0][0];
    const firstSyncArgs = mockUseMapSync.mock.calls[0][0];
    expect(firstInteractionsArgs.latestSettingsRef.current).toBe(settingsA);
    expect(firstInteractionsArgs.onCountrySelectRef.current).toBe(onCountrySelectA);
    expect(firstSyncArgs.latestSettingsRef.current).toBe(settingsA);
    expect(firstSyncArgs.appliedStyleRef.current).toBe(settingsA.mapStyle);

    rerender({
      settings: settingsB,
      onCountrySelect: onCountrySelectB,
    });

    const secondInteractionsArgs = mockUseMapInteractions.mock.calls[1][0];
    const secondSyncArgs = mockUseMapSync.mock.calls[1][0];
    expect(secondInteractionsArgs.latestSettingsRef.current).toBe(settingsB);
    expect(secondInteractionsArgs.onCountrySelectRef.current).toBe(onCountrySelectB);
    expect(secondSyncArgs.latestSettingsRef.current).toBe(settingsB);

    expect(result.current.containerRef).toBe(mockUseMapInstance.mock.results[0].value.containerRef);
  });
});
