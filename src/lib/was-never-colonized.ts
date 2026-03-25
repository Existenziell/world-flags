import wasNeverColonizedIso2 from "@/src/data/was-never-colonized-iso2.json";

/** ISO 3166-1 alpha-2 for independent states we mark `wasColonized: false` in `countries.json`.
 *  Chosen from commonly cited “never colonized” lists (e.g. WorldPopulationReview, WorldAtlas);
 *  excludes cases with broad dispute (e.g. KR/KP under Japan, CN unequal treaties).
 *  Dependent territories are handled separately via `colonizer` / `wasColonized: true`. */
export const WAS_NEVER_COLONIZED_ISO2: ReadonlySet<string> = new Set(wasNeverColonizedIso2);
