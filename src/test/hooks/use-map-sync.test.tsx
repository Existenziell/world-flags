import { renderHook } from "@testing-library/react";
import { DEFAULT_MAP_SETTINGS, MAP_STYLE_URLS } from "@/src/constants";
import { syncProjectionAndSkybox, useMapSync } from "@/src/hooks/useMapSync";

function createMapMock() {
  return {
    isStyleLoaded: vi.fn(() => true),
    setStyle: vi.fn(),
    setProjection: vi.fn(),
    setFog: vi.fn(),
    once: vi.fn(),
    setCenter: vi.fn(),
    setZoom: vi.fn(),
    setMinZoom: vi.fn(),
    setMaxZoom: vi.fn(),
    setPitch: vi.fn(),
    setBearing: vi.fn(),
    setRenderWorldCopies: vi.fn(),
    dragRotate: { enable: vi.fn() },
    scrollZoom: { enable: vi.fn() },
    boxZoom: { enable: vi.fn() },
    keyboard: { enable: vi.fn() },
    doubleClickZoom: { enable: vi.fn() },
    touchZoomRotate: { enable: vi.fn() },
  };
}

describe("syncProjectionAndSkybox", () => {
  it("applies projection and skybox settings when style is loaded", () => {
    const map = createMapMock();

    syncProjectionAndSkybox(map as never, DEFAULT_MAP_SETTINGS);

    expect(map.setProjection).toHaveBeenCalledWith("globe");
    expect(map.setFog).toHaveBeenCalledWith(
      expect.objectContaining({
        color: DEFAULT_MAP_SETTINGS.skyColor,
        "high-color": DEFAULT_MAP_SETTINGS.skyHorizonColor,
        "space-color": DEFAULT_MAP_SETTINGS.skySpaceColor,
        "horizon-blend": 0.12,
        "star-intensity": 0.25,
      }),
    );
  });

  it("clears fog when skybox is disabled or projection is not globe", () => {
    const map = createMapMock();

    syncProjectionAndSkybox(map as never, {
      ...DEFAULT_MAP_SETTINGS,
      projection: "mercator",
    });

    expect(map.setProjection).toHaveBeenCalledWith("mercator");
    expect(map.setFog).toHaveBeenCalledWith(null);
  });
});

describe("useMapSync", () => {
  it("updates style and map camera controls from settings", () => {
    const map = createMapMock();
    const mapRef = { current: map };
    const settings = {
      ...DEFAULT_MAP_SETTINGS,
      mapStyle: "satellite" as const,
      centerLng: 12,
      centerLat: -4,
      zoom: 3,
      minZoom: 1,
      maxZoom: 8,
      pitch: 25,
      bearing: 40,
      renderWorldCopies: false,
    };
    const latestSettingsRef = { current: settings };
    const appliedStyleRef = { current: "dark" as const };

    renderHook(() =>
      useMapSync({
        mapRef: mapRef as never,
        settings,
        latestSettingsRef: latestSettingsRef as never,
        appliedStyleRef: appliedStyleRef as never,
      }),
    );

    expect(map.setStyle).toHaveBeenCalledWith(MAP_STYLE_URLS.satellite);
    expect(appliedStyleRef.current).toBe("satellite");
    expect(map.setCenter).toHaveBeenCalledWith([12, -4]);
    expect(map.setZoom).toHaveBeenCalledWith(3);
    expect(map.setMinZoom).toHaveBeenCalledWith(1);
    expect(map.setMaxZoom).toHaveBeenCalledWith(8);
    expect(map.setPitch).toHaveBeenCalledWith(25);
    expect(map.setBearing).toHaveBeenCalledWith(40);
    expect(map.setRenderWorldCopies).toHaveBeenCalledWith(false);
    expect(map.dragRotate.enable).toHaveBeenCalled();
    expect(map.scrollZoom.enable).toHaveBeenCalled();
  });

  it("does not call setStyle when style is already applied", () => {
    const map = createMapMock();
    const mapRef = { current: map };
    const settings = DEFAULT_MAP_SETTINGS;
    const latestSettingsRef = { current: settings };
    const appliedStyleRef = { current: settings.mapStyle };

    renderHook(() =>
      useMapSync({
        mapRef: mapRef as never,
        settings,
        latestSettingsRef: latestSettingsRef as never,
        appliedStyleRef: appliedStyleRef as never,
      }),
    );

    expect(map.setStyle).not.toHaveBeenCalled();
  });
});
