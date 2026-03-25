"use client";

import { useEffect } from "react";
import type mapboxgl from "mapbox-gl";
import { MAP_STYLE_URLS } from "@/src/constants";
import type { MapSettings } from "@/src/types/map-settings";
import type { UseMapSyncArgs } from "@/src/types/use-map-sync";

export function syncProjectionAndSkybox(
  map: mapboxgl.Map,
  settings: MapSettings,
  waitForIdle = false,
) {
  if (!map.isStyleLoaded()) {
    return;
  }

  map.setProjection(settings.projection);

  const apply = () => {
    if (!map.isStyleLoaded()) {
      return;
    }
    applySkybox(map, settings);
  };

  if (waitForIdle) {
    map.once("idle", apply);
    return;
  }

  apply();
}

function applySkybox(map: mapboxgl.Map, settings: MapSettings) {
  if (!map.isStyleLoaded()) {
    return;
  }

  if (!settings.skyboxEnabled || settings.projection !== "globe") {
    map.setFog(null);
    return;
  }

  const softenedHorizonBlend = Math.min(settings.skyHorizonBlend, 0.12);
  const softenedStarIntensity = Math.min(settings.skyStarIntensity, 0.25);

  map.setFog({
    color: settings.skyColor,
    "high-color": settings.skyHorizonColor,
    "space-color": settings.skySpaceColor,
    "horizon-blend": softenedHorizonBlend,
    "star-intensity": softenedStarIntensity,
    range: [1.4, 12],
  });
}

export function useMapSync({
  mapRef,
  settings,
  latestSettingsRef,
  appliedStyleRef,
}: UseMapSyncArgs) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (appliedStyleRef.current === settings.mapStyle) {
      return;
    }

    appliedStyleRef.current = settings.mapStyle;
    map.setStyle(MAP_STYLE_URLS[settings.mapStyle]);
  }, [mapRef, settings.mapStyle, appliedStyleRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    syncProjectionAndSkybox(map, {
      ...latestSettingsRef.current,
      projection: settings.projection,
    });
  }, [mapRef, settings.projection, latestSettingsRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    map.setCenter([settings.centerLng, settings.centerLat]);
    map.setZoom(settings.zoom);
    map.setMinZoom(settings.minZoom);
    map.setMaxZoom(settings.maxZoom);
    map.setPitch(settings.pitch);
    map.setBearing(settings.bearing);
    map.setRenderWorldCopies(settings.renderWorldCopies);
    map.dragRotate.enable();
    map.scrollZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    map.doubleClickZoom.enable();
    map.touchZoomRotate.enable();
  }, [
    mapRef,
    settings.centerLng,
    settings.centerLat,
    settings.zoom,
    settings.minZoom,
    settings.maxZoom,
    settings.pitch,
    settings.bearing,
    settings.renderWorldCopies,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    syncProjectionAndSkybox(map, {
      ...latestSettingsRef.current,
      skyboxEnabled: settings.skyboxEnabled,
      skyColor: settings.skyColor,
      skyHorizonColor: settings.skyHorizonColor,
      skySpaceColor: settings.skySpaceColor,
      skyHorizonBlend: settings.skyHorizonBlend,
      skyStarIntensity: settings.skyStarIntensity,
    });
  }, [
    mapRef,
    latestSettingsRef,
    settings.skyboxEnabled,
    settings.skyColor,
    settings.skyHorizonColor,
    settings.skySpaceColor,
    settings.skyHorizonBlend,
    settings.skyStarIntensity,
  ]);
}
