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
import { allCountries, getCountryByCode } from "@/src/lib/country-lookup";
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

function createFlagMarker(country: Country, lngLat: [number, number]) {
  const marker = document.createElement("button");
  marker.type = "button";
  marker.style.width = "32px";
  marker.style.height = "20px";
  marker.style.padding = "0";
  marker.style.border = "1px solid rgba(0, 0, 0, 0.5)";
  marker.style.borderRadius = "3px";
  marker.style.overflow = "hidden";
  marker.style.background = "#ffffff";
  marker.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.45)";
  marker.style.cursor = "pointer";
  marker.title = country.name;
  marker.setAttribute("aria-label", `Open ${country.name}`);

  const image = document.createElement("img");
  image.src = country.flagPath;
  image.alt = `${country.name} flag`;
  image.width = 32;
  image.height = 20;
  image.style.width = "100%";
  image.style.height = "100%";
  image.style.objectFit = "cover";
  image.loading = "eager";
  marker.append(image);

  return { element: marker, lngLat };
}

function getIsoCodeFromMapEvent(event: MapMouseEvent): string | null {
  const feature = event.features?.[0];
  const { iso2, iso3 } = getIsoFromFeature({
    properties: feature?.properties as Record<string, unknown> | undefined,
  });
  return iso2 ?? iso3;
}

export function useMapInteractions({
  mapRef,
  onCountrySelectRef,
  latestSettingsRef,
}: UseMapInteractionsArgs) {
  useEffect(() => {
    let frame = 0;
    let cleanupMapBindings = () => {};

    const bind = () => {
      const map = mapRef.current;
      if (!map) {
        frame = requestAnimationFrame(bind);
        return;
      }

      let handlersBound = false;
      const markers: mapboxgl.Marker[] = [];

      const handleClick = (event: MapMouseEvent) => {
        const code = getIsoCodeFromMapEvent(event);
        onCountrySelectRef.current(getCountryByCode(code));
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

      const addFlagMarkers = () => {
        clearMarkers();
        for (const country of allCountries) {
          if (country.markerLng === null || country.markerLat === null) {
            continue;
          }
          const { element, lngLat } = createFlagMarker(country, [country.markerLng, country.markerLat]);
          element.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            onCountrySelectRef.current(country);
          });

          const marker = new mapboxgl.Marker({ element, anchor: "center" }).setLngLat(lngLat).addTo(map);
          markers.push(marker);
        }
      };

      const bindCountryLayerHandlers = () => {
        if (handlersBound) {
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
        addFlagMarkers();
      };

      map.on("load", rehydrateStyleState);
      map.on("style.load", rehydrateStyleState);

      cleanupMapBindings = () => {
        clearMarkers();
        map.off("load", rehydrateStyleState);
        map.off("style.load", rehydrateStyleState);
        if (handlersBound) {
          map.off("click", COUNTRY_FILL_LAYER, handleClick);
          map.off("mouseenter", COUNTRY_FILL_LAYER, handleMouseEnter);
          map.off("mouseleave", COUNTRY_FILL_LAYER, handleMouseLeave);
        }
      };
    };

    bind();

    return () => {
      cancelAnimationFrame(frame);
      cleanupMapBindings();
    };
  }, [latestSettingsRef, mapRef, onCountrySelectRef]);
}
