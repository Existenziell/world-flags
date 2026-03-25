import type { Country } from "../types/country";

/** Mapbox `[lng, lat]` from `Country.latlng` `[lat, lng]`, or null if missing/invalid. */
export function countryLngLat(country: Country): [number, number] | null {
  const ll = country.latlng;
  if (!ll || ll.length < 2) return null;
  const [lat, lng] = ll;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lng, lat];
}
