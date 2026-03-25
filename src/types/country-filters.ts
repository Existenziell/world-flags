/** Tri-state for UN-style yes/no filters. */
export type CountryFilterTriState = "any" | "yes" | "no";

export type WasColonizedFilter = "any" | "yes" | "no";

export type CountryFilterCriteria = {
  unMember: CountryFilterTriState;
  brics: CountryFilterTriState;
  eu: CountryFilterTriState;
  commonwealth: CountryFilterTriState;
  nato: CountryFilterTriState;
  asean: CountryFilterTriState;
  g7: CountryFilterTriState;
  g20: CountryFilterTriState;
  populationMin: number | null;
  populationMax: number | null;
  wasColonized: WasColonizedFilter;
  /** When `true`, only countries with `colonizer !== null`. When `false`, only `colonizer === null`. When omitted/`null`, no constraint. */
  hasColonizer: boolean | null;
  drivingSide: "any" | "left" | "right";
  continents: string[];
  region: string | null;
  subregion: string | null;
  flagAspectRatios: string[];
  landlocked: CountryFilterTriState;
  independent: CountryFilterTriState;
};
