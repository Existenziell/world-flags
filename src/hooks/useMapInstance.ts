"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { MAP_STYLE_URLS } from "@/src/constants";
import type { UseMapInstanceArgs } from "@/src/types/use-map-instance";

export function useMapInstance({ accessToken, settings }: UseMapInstanceArgs) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const initialSettingsRef = useRef(settings);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    mapboxgl.accessToken = accessToken;
    const initial = initialSettingsRef.current;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URLS[initial.mapStyle],
      projection: initial.projection,
      center: [initial.centerLng, initial.centerLat],
      zoom: initial.zoom,
      minZoom: initial.minZoom,
      maxZoom: initial.maxZoom,
      pitch: initial.pitch,
      bearing: initial.bearing,
      renderWorldCopies: initial.renderWorldCopies,
      dragRotate: true,
      scrollZoom: true,
      boxZoom: true,
      keyboard: true,
      doubleClickZoom: true,
      touchZoomRotate: true,
    });
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [accessToken]);

  return { containerRef, mapRef };
}
