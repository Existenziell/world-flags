"use client";

import { useEffect } from "react";
import mapboxgl, { type MapMouseEvent } from "mapbox-gl";
import type { Country } from "@/src/types/country";
import {
  COUNTRY_FILL_LAYER,
  COUNTRY_LINE_LAYER,
  COUNTRY_SOURCE_ID,
  PRIMARY_COUNTRIES_GEOJSON_URL,
} from "@/src/constants";
import { countryLngLat } from "@/src/lib/country-coords";
import { getCountryByCode } from "@/src/lib/country-lookup";
import { getIsoFromFeature } from "@/src/lib/iso";
import { syncProjectionAndSkybox } from "@/src/hooks/useMapSync";
import type { UseMapInteractionsArgs } from "@/src/types/use-map-interactions";

function installCountryLayers(map: mapboxgl.Map) {
  if (!map.getSource(COUNTRY_SOURCE_ID)) {
    map.addSource(COUNTRY_SOURCE_ID, {
      type: "geojson",
      data: PRIMARY_COUNTRIES_GEOJSON_URL,
    });
  }

  if (!map.getLayer(COUNTRY_FILL_LAYER)) {
    map.addLayer({
      id: COUNTRY_FILL_LAYER,
      type: "fill",
      source: COUNTRY_SOURCE_ID,
      paint: {
        "fill-color": "#2dd4bf",
        "fill-opacity": 0.15,
      },
    });
  }

  if (!map.getLayer(COUNTRY_LINE_LAYER)) {
    map.addLayer({
      id: COUNTRY_LINE_LAYER,
      type: "line",
      source: COUNTRY_SOURCE_ID,
      paint: {
        "line-color": "#99f6e4",
        "line-width": 0.8,
        "line-opacity": 0.55,
      },
    });
  }
}

function setCountryNameLabelsVisible(map: mapboxgl.Map, visible: boolean) {
  if (!map.isStyleLoaded()) {
    return;
  }
  const style = map.getStyle();
  const layers = style.layers ?? [];
  for (const layer of layers) {
    if (layer.type !== "symbol") {
      continue;
    }
    const layout = layer.layout as { "text-field"?: unknown } | undefined;
    if (!layout || layout["text-field"] === undefined) {
      continue;
    }
    map.setLayoutProperty(layer.id, "visibility", visible ? "visible" : "none");
  }
}

function createFlagMarker(
  country: Country,
  lngLat: [number, number],
  isChallengeFocusMarker: boolean,
  showTitle: boolean,
  size?: { width: number; height: number },
) {
  const width = size?.width ?? (isChallengeFocusMarker ? 96 : 32);
  const height = size?.height ?? (isChallengeFocusMarker ? 60 : 20);
  const marker = document.createElement("button");
  marker.type = "button";
  marker.style.width = `${width}px`;
  marker.style.height = `${height}px`;
  marker.style.padding = "0";
  marker.style.border = "none";
  marker.style.borderRadius = isChallengeFocusMarker ? "6px" : "3px";
  marker.style.overflow = "hidden";
  marker.style.background = "transparent";
  marker.style.boxShadow = isChallengeFocusMarker
    ? "0 4px 14px rgba(20, 184, 166, 0.5)"
    : "0 1px 3px rgba(0, 0, 0, 0.45)";
  marker.style.cursor = "pointer";
  if (showTitle) {
    marker.title = country.name;
  }
  marker.setAttribute("aria-label", `Open ${country.name}`);

  const image = document.createElement("img");
  image.src = country.flagPath;
  image.alt = `${country.name} flag`;
  image.width = width;
  image.height = height;
  image.style.width = "100%";
  image.style.height = "100%";
  image.style.objectFit = "cover";
  image.style.background = "transparent";
  image.loading = "eager";
  marker.append(image);

  return { element: marker, lngLat };
}

function createNameMarker(country: Country, lngLat: [number, number], markerTheme: "dark" | "light") {
  const marker = document.createElement("button");
  const isDark = markerTheme === "dark";
  marker.type = "button";
  marker.style.padding = "10px 14px";
  marker.style.border = "2px solid rgba(20, 184, 166, 0.95)";
  marker.style.borderRadius = "9999px";
  marker.style.background = isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.98)";
  marker.style.boxShadow = "0 4px 14px rgba(20, 184, 166, 0.5)";
  marker.style.cursor = "pointer";
  marker.style.color = isDark ? "#f8fafc" : "#111827";
  marker.style.fontSize = "18px";
  marker.style.fontWeight = "700";
  marker.style.whiteSpace = "nowrap";
  marker.style.maxWidth = "240px";
  marker.style.overflow = "hidden";
  marker.style.textOverflow = "ellipsis";
  marker.style.lineHeight = "1.1";
  marker.textContent = country.name;
  marker.setAttribute("aria-label", `Open choices for ${country.name}`);

  return { element: marker, lngLat };
}

function getIsoCodeFromMapEvent(event: MapMouseEvent): string | null {
  const feature = event.features?.[0];
  const { iso2, iso3 } = getIsoFromFeature({
    properties: feature?.properties as Record<string, unknown> | undefined,
  });
  return iso2 ?? iso3;
}

function getExploreFlagSize(zoom: number, viewportWidth: number, viewportHeight: number): {
  width: number;
  height: number;
} {
  const minWidth = 24;
  const maxWidth = Math.max(minWidth, Math.floor(Math.min(viewportWidth, viewportHeight) * 0.2));
  // Linear zoom 2→10 maps to 0→1, then ease-in so flags stay smaller until higher zoom.
  const clampedZoom = Math.max(2, Math.min(10, zoom));
  const linearProgress = (clampedZoom - 2) / 8;
  const progress = linearProgress ** 1.75;
  const width = Math.round(minWidth + (maxWidth - minWidth) * progress);
  return { width, height: Math.round(width * 0.625) };
}

export function useMapInteractions({
  mapRef,
  onCountrySelectRef,
  latestSettingsRef,
  mode,
  focusCountry,
  showOnlyFocusMarker,
  focusMarkerVariant,
  markerTheme,
  exploreCountries,
  onFocusCountryClick,
}: UseMapInteractionsArgs) {
  useEffect(() => {
    let frame = 0;
    let cleanupMapBindings = () => { };

    const bind = () => {
      const map = mapRef.current;
      if (!map) {
        frame = requestAnimationFrame(bind);
        return;
      }

      let handlersBound = false;
      let zoomHandlerBound = false;
      const markers: mapboxgl.Marker[] = [];

      const handleClick = (event: MapMouseEvent) => {
        const code = getIsoCodeFromMapEvent(event);
        const clickedCountry = getCountryByCode(code);
        if (!clickedCountry) {
          onCountrySelectRef.current(null);
          return;
        }

        if (mode === "explore") {
          onCountrySelectRef.current(clickedCountry);
          return;
        }

        if (!focusCountry || focusCountry.iso2 !== clickedCountry.iso2) {
          return;
        }

        onFocusCountryClick?.(clickedCountry);
      };

      const handleMouseEnter = () => {
        map.getCanvas().style.cursor = "pointer";
      };

      const handleMouseLeave = () => {
        map.getCanvas().style.cursor = "";
      };

      const clearMarkers = () => {
        for (const marker of markers) {
          marker.remove();
        }
        markers.length = 0;
      };

      const updateExploreMarkerSizes = () => {
        if (mode !== "explore") {
          return;
        }
        const viewportWidth = map.getContainer().clientWidth;
        const viewportHeight = map.getContainer().clientHeight;
        const nextSize = getExploreFlagSize(map.getZoom(), viewportWidth, viewportHeight);
        for (const marker of markers) {
          const element = marker.getElement() as HTMLElement;
          element.style.width = `${nextSize.width}px`;
          element.style.height = `${nextSize.height}px`;
        }
      };

      const addFlagMarkers = () => {
        clearMarkers();
        const isChallengeFocusMode = showOnlyFocusMarker && Boolean(focusCountry);
        const countriesToRender =
          isChallengeFocusMode && focusCountry ? [focusCountry] : exploreCountries;
        const initialExploreSize = getExploreFlagSize(
          map.getZoom(),
          map.getContainer().clientWidth,
          map.getContainer().clientHeight,
        );
        for (const country of countriesToRender) {
          const lngLat = countryLngLat(country);
          if (!lngLat) {
            continue;
          }
          const markerData =
            isChallengeFocusMode && focusMarkerVariant === "name"
              ? createNameMarker(country, lngLat, markerTheme)
              : createFlagMarker(
                country,
                lngLat,
                isChallengeFocusMode,
                mode !== "challenge1",
                mode === "explore" && !isChallengeFocusMode ? initialExploreSize : undefined,
              );
          markerData.element.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (mode === "explore") {
              onCountrySelectRef.current(country);
              return;
            }

            if (!focusCountry || focusCountry.iso2 !== country.iso2) {
              return;
            }
            onFocusCountryClick?.(country);
          });

          const marker = new mapboxgl.Marker({ element: markerData.element, anchor: "center" })
            .setLngLat(markerData.lngLat)
            .addTo(map);
          markers.push(marker);
        }

        if (mode === "explore") {
          updateExploreMarkerSizes();
          if (!zoomHandlerBound) {
            map.on("zoom", updateExploreMarkerSizes);
            zoomHandlerBound = true;
          }
        } else if (zoomHandlerBound) {
          map.off("zoom", updateExploreMarkerSizes);
          zoomHandlerBound = false;
        }
      };

      const bindCountryLayerHandlers = () => {
        if (handlersBound) {
          return;
        }
        if (mode === "challenge1") {
          return;
        }
        map.on("click", COUNTRY_FILL_LAYER, handleClick);
        map.on("mouseenter", COUNTRY_FILL_LAYER, handleMouseEnter);
        map.on("mouseleave", COUNTRY_FILL_LAYER, handleMouseLeave);
        handlersBound = true;
      };

      const rehydrateStyleState = () => {
        installCountryLayers(map);
        bindCountryLayerHandlers();
        syncProjectionAndSkybox(map, latestSettingsRef.current, true);
        setCountryNameLabelsVisible(map, mode !== "challenge1");
        addFlagMarkers();
      };

      map.on("load", rehydrateStyleState);
      map.on("style.load", rehydrateStyleState);
      if (map.isStyleLoaded()) {
        rehydrateStyleState();
      }

      cleanupMapBindings = () => {
        clearMarkers();
        map.off("load", rehydrateStyleState);
        map.off("style.load", rehydrateStyleState);
        if (handlersBound) {
          map.off("click", COUNTRY_FILL_LAYER, handleClick);
          map.off("mouseenter", COUNTRY_FILL_LAYER, handleMouseEnter);
          map.off("mouseleave", COUNTRY_FILL_LAYER, handleMouseLeave);
        }
        if (zoomHandlerBound) {
          map.off("zoom", updateExploreMarkerSizes);
        }
      };
    };

    bind();

    return () => {
      cancelAnimationFrame(frame);
      cleanupMapBindings();
    };
  }, [
    exploreCountries,
    focusCountry,
    latestSettingsRef,
    mapRef,
    mode,
    onCountrySelectRef,
    onFocusCountryClick,
    focusMarkerVariant,
    markerTheme,
    showOnlyFocusMarker,
  ]);
}
