export type GeoCountryFeature = {
  properties?: Record<string, unknown>;
};

export function getIsoCode(candidates: unknown[]): string | null {
  const code =
    (candidates.find((value) => typeof value === "string" && value.trim().length > 0) as
      | string
      | undefined) ?? null;

  return code?.toUpperCase() ?? null;
}

export function getIsoFromFeature(feature: GeoCountryFeature): {
  iso2: string | null;
  iso3: string | null;
} {
  const properties = feature.properties ?? {};
  const iso2Candidates = [
    properties["ISO_A2"],
    properties["iso_a2"],
    properties["ISO2"],
    properties["iso2"],
    properties["ISO3166-1-Alpha-2"],
    properties["iso3166-1-alpha-2"],
  ];
  const iso3Candidates = [
    properties["ISO_A3"],
    properties["iso_a3"],
    properties["ADM0_A3"],
    properties["adm0_a3"],
    properties["ISO3166-1-Alpha-3"],
    properties["iso3166-1-alpha-3"],
  ];

  return {
    iso2: getIsoCode(iso2Candidates),
    iso3: getIsoCode(iso3Candidates),
  };
}
