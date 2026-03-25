import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getIsoFromFeature } from "../src/lib/iso";

type RestCountry = {
  cca2?: string;
  cca3?: string;
  name?: {
    common?: string;
    official?: string;
  };
  altSpellings?: string[];
  population?: number;
  region?: string;
  subregion?: string;
  unMember?: boolean;
  status?: string;
  borders?: string[];
  continents?: string[];
  capital?: string[];
  capitalInfo?: { latlng?: number[] };
  area?: number;
  latlng?: number[];
  car?: { side?: string };
  idd?: { root?: string; suffixes?: string[] };
  tld?: string[];
  maps?: {
    googleMaps?: string;
    openStreetMaps?: string;
  };
  languages?: Record<string, string>;
  currencies?: Record<string, { name?: string; symbol?: string }>;
  timezones?: string[];
  independent?: boolean;
  landlocked?: boolean;
  startOfWeek?: string;
};

type CountryRecord = {
  iso2: string;
  iso3: string;
  name: string;
  officialName: string | null;
  countryCreationDate: string | null;
  independenceDate: string | null;
  altSpellings: string[];
  population: number | null;
  region: string | null;
  subregion: string | null;
  unMember: boolean | null;
  status: string | null;
  borders: string[];
  continents: string[];
  capital: string | null;
  areaKm2: number | null;
  latlng: [number, number] | null;
  drivingSide: string | null;
  callingCodes: string[];
  internetTlds: string[];
  googleMapsUrl: string | null;
  openStreetMapsUrl: string | null;
  wikipediaUrl: string;
  languages: string[];
  currencies: string[];
  timezones: string[];
  independent: boolean | null;
  landlocked: boolean | null;
  startOfWeek: string | null;
  flagPath: string;
  markerLng: number | null;
  markerLat: number | null;
};

type WikidataSearchResponse = {
  search?: Array<{ id?: string }>;
};

type WikidataEntity = {
  id?: string;
  claims?: Record<string, WikidataStatement[]>;
  sitelinks?: {
    enwiki?: {
      title?: string;
    };
  };
};

type WikidataStatement = {
  rank?: "preferred" | "normal" | "deprecated";
  mainsnak?: WikidataSnak;
  qualifiers?: Record<string, WikidataSnak[]>;
};

type WikidataSnak = {
  datavalue?: {
    value?: unknown;
  };
};

type ExistingCountry = {
  iso2?: string;
  iso3?: string;
  markerLng?: number | null;
  markerLat?: number | null;
};

const ROOT = process.cwd();
const FLAGS_DIR = path.join(ROOT, "public", "flags");
const DATA_DIR = path.join(ROOT, "src", "data");
const DATA_PATH = path.join(DATA_DIR, "countries.json");
const REST_COUNTRIES_URLS = [
  "https://restcountries.com/v3.1/all?fields=cca2,cca3,name,population,region,capital,capitalInfo,area,latlng,maps",
  "https://restcountries.com/v3.1/all?fields=cca2,cca3,subregion,continents,languages,currencies,timezones,independent,landlocked,startOfWeek",
  "https://restcountries.com/v3.1/all?fields=cca2,cca3,altSpellings,unMember,status,borders,car,idd,tld",
] as const;
const COUNTRY_GEOJSON_URLS = [
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson",
  "https://cdn.jsdelivr.net/gh/datasets/geo-countries@master/data/countries.geojson",
] as const;
const WIKIDATA_API_URL = "https://www.wikidata.org/w/api.php";
const WIKIDATA_TIMEOUT_MS = 8000;
const WIKIDATA_HEADERS = {
  "user-agent": "world-flags-data-script/1.0 (https://example.com)",
} as const;

type CountryFeature = {
  geometry?: {
    type?: string;
    coordinates?: unknown;
  };
  properties?: Record<string, unknown>;
};

function flattenCoordinates(node: unknown, output: [number, number][]) {
  if (!Array.isArray(node)) {
    return;
  }

  const [first, second] = node;
  if (typeof first === "number" && typeof second === "number") {
    output.push([first, second]);
    return;
  }

  for (const child of node) {
    flattenCoordinates(child, output);
  }
}

function getFeatureCenter(feature: CountryFeature): [number, number] | null {
  const points: [number, number][] = [];
  flattenCoordinates(feature.geometry?.coordinates, points);
  if (points.length === 0) {
    return null;
  }

  let minLng = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  for (const [lng, lat] of points) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}

async function fetchCountryFeatures(): Promise<CountryFeature[]> {
  for (const url of COUNTRY_GEOJSON_URLS) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        continue;
      }
      const data = (await response.json()) as { features?: CountryFeature[] };
      if (Array.isArray(data.features) && data.features.length > 0) {
        return data.features;
      }
    } catch {
      // Try the next mirror URL.
    }
  }

  throw new Error("Failed to fetch country GeoJSON from all mirrors");
}

function getCountryMergeKey(country: RestCountry): string | null {
  const iso3 = country.cca3?.toUpperCase();
  if (iso3) {
    return `iso3:${iso3}`;
  }
  const iso2 = country.cca2?.toUpperCase();
  if (iso2) {
    return `iso2:${iso2}`;
  }
  return null;
}

function getCapitalMarker(country: RestCountry): [number, number] | null {
  const latlng = country.capitalInfo?.latlng;
  if (!Array.isArray(latlng) || latlng.length < 2) {
    return null;
  }

  const [lat, lng] = latlng;
  if (
    typeof lat !== "number" ||
    !Number.isFinite(lat) ||
    typeof lng !== "number" ||
    !Number.isFinite(lng)
  ) {
    return null;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return [lng, lat];
}

function getCountryLatLng(country: RestCountry): [number, number] | null {
  const latlng = country.latlng;
  if (!Array.isArray(latlng) || latlng.length < 2) {
    return null;
  }

  const [lat, lng] = latlng;
  if (
    typeof lat !== "number" ||
    !Number.isFinite(lat) ||
    typeof lng !== "number" ||
    !Number.isFinite(lng)
  ) {
    return null;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return [lat, lng];
}

function parseWikidataDateFromTimeString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(/[+-](\d{4,})-(\d{2})-(\d{2})T/);
  if (!match) {
    return null;
  }

  const [, yearRaw, month, day] = match;
  const year = yearRaw.replace(/^0+/, "") || "0";
  return `${year}-${month}-${day}`;
}

function getBestStatements(statements: WikidataStatement[] | undefined): WikidataStatement[] {
  if (!Array.isArray(statements) || statements.length === 0) {
    return [];
  }

  const preferred = statements.filter((statement) => statement.rank === "preferred");
  return preferred.length > 0 ? preferred : statements;
}

function getTimeClaimFromStatement(statement: WikidataStatement): string | null {
  const value = statement.mainsnak?.datavalue?.value;
  if (!value || typeof value !== "object") {
    return null;
  }
  const time = (value as { time?: unknown }).time;
  return parseWikidataDateFromTimeString(time);
}

function getCountryCreationDate(entity: WikidataEntity): string | null {
  const creationStatements = getBestStatements(entity.claims?.P571);
  for (const statement of creationStatements) {
    const date = getTimeClaimFromStatement(statement);
    if (date) {
      return date;
    }
  }
  return null;
}

function getClaimEntityId(statement: WikidataStatement): string | null {
  const value = statement.mainsnak?.datavalue?.value;
  if (!value || typeof value !== "object") {
    return null;
  }
  const id = (value as { id?: unknown }).id;
  return typeof id === "string" ? id : null;
}

function getIndependenceDate(entity: WikidataEntity, independent: boolean | undefined): string | null {
  const sovereigntyTypes = new Set(["Q3624078", "Q6256"]);
  const instanceStatements = getBestStatements(entity.claims?.P31);
  for (const statement of instanceStatements) {
    const instanceId = getClaimEntityId(statement);
    if (!instanceId || !sovereigntyTypes.has(instanceId)) {
      continue;
    }

    const startQualifiers = statement.qualifiers?.P580;
    if (!Array.isArray(startQualifiers)) {
      continue;
    }

    for (const qualifier of startQualifiers) {
      const value = qualifier.datavalue?.value;
      if (!value || typeof value !== "object") {
        continue;
      }
      const time = (value as { time?: unknown }).time;
      const date = parseWikidataDateFromTimeString(time);
      if (date) {
        return date;
      }
    }
  }

  if (independent) {
    return getCountryCreationDate(entity);
  }

  return null;
}

function getClaimString(entity: WikidataEntity, property: string): string | null {
  const statements = getBestStatements(entity.claims?.[property]);
  for (const statement of statements) {
    const value = statement.mainsnak?.datavalue?.value;
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim().toUpperCase();
    }
  }
  return null;
}

function scoreWikidataEntity(entity: WikidataEntity, iso2: string, iso3: string): number {
  const entityIso2 = getClaimString(entity, "P297");
  const entityIso3 = getClaimString(entity, "P298");
  let score = 0;

  if (entityIso2 && entityIso2 === iso2) {
    score += 4;
  }
  if (entityIso3 && entityIso3 === iso3) {
    score += 5;
  }
  if (entity.sitelinks?.enwiki?.title) {
    score += 1;
  }

  return score;
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WIKIDATA_TIMEOUT_MS);
  const response = await fetch(url, {
    headers: WIKIDATA_HEADERS,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }
  return (await response.json()) as T;
}

async function resolveWikidataEntity(country: RestCountry): Promise<WikidataEntity | null> {
  const iso2 = country.cca2?.toUpperCase() ?? "";
  const iso3 = country.cca3?.toUpperCase() ?? "";
  const searchTerms = [country.name?.common, country.name?.official].filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );

  for (const term of searchTerms) {
    const searchUrl =
      `${WIKIDATA_API_URL}?action=wbsearchentities&format=json&type=item&language=en&limit=5` +
      `&search=${encodeURIComponent(term)}`;
    let searchData: WikidataSearchResponse;
    try {
      searchData = await fetchJson<WikidataSearchResponse>(searchUrl);
    } catch {
      continue;
    }
    const ids = (searchData.search ?? [])
      .map((entry) => entry.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    if (ids.length === 0) {
      continue;
    }

    const entitiesUrl =
      `${WIKIDATA_API_URL}?action=wbgetentities&format=json&props=claims|sitelinks` +
      `&ids=${encodeURIComponent(ids.join("|"))}`;
    let entitiesData: { entities?: Record<string, WikidataEntity> };
    try {
      entitiesData = await fetchJson<{ entities?: Record<string, WikidataEntity> }>(entitiesUrl);
    } catch {
      continue;
    }
    const candidates = Object.values(entitiesData.entities ?? {});
    if (candidates.length === 0) {
      continue;
    }

    const best = candidates
      .map((entity) => ({
        entity,
        score: scoreWikidataEntity(entity, iso2, iso3),
      }))
      .sort((a, b) => b.score - a.score)[0];

    if (best && best.score > 0) {
      return best.entity;
    }
  }

  return null;
}

function getWikipediaUrl(entity: WikidataEntity | null, countryName: string): string {
  const title = entity?.sitelinks?.enwiki?.title;
  if (typeof title === "string" && title.trim().length > 0) {
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  }
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(countryName.replace(/ /g, "_"))}`;
}

async function loadExistingMarkerByKey(): Promise<Map<string, [number, number]>> {
  try {
    const raw = await readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as ExistingCountry[];
    const markers = new Map<string, [number, number]>();

    for (const country of parsed) {
      if (
        typeof country.markerLng !== "number" ||
        !Number.isFinite(country.markerLng) ||
        typeof country.markerLat !== "number" ||
        !Number.isFinite(country.markerLat)
      ) {
        continue;
      }

      const marker: [number, number] = [country.markerLng, country.markerLat];
      const iso2 = country.iso2?.toUpperCase();
      const iso3 = country.iso3?.toUpperCase();
      if (iso2) {
        markers.set(`iso2:${iso2}`, marker);
      }
      if (iso3) {
        markers.set(`iso3:${iso3}`, marker);
      }
    }

    return markers;
  } catch {
    return new Map<string, [number, number]>();
  }
}

async function fetchCountries(): Promise<RestCountry[]> {
  const responses = await Promise.all(REST_COUNTRIES_URLS.map((url) => fetch(url)));
  for (const [index, response] of responses.entries()) {
    if (!response.ok) {
      throw new Error(`Failed to fetch country list part ${index + 1} (${response.status})`);
    }
  }

  const chunks = (await Promise.all(responses.map((response) => response.json()))) as RestCountry[][];
  const mergedByKey = new Map<string, RestCountry>();

  for (const chunk of chunks) {
    for (const country of chunk) {
      const key = getCountryMergeKey(country);
      if (!key) {
        continue;
      }
      const existing = mergedByKey.get(key);
      mergedByKey.set(key, existing ? { ...existing, ...country } : country);
    }
  }

  return Array.from(mergedByKey.values());
}

async function downloadFlag(iso2: string): Promise<string> {
  const lower = iso2.toLowerCase();
  const url = `https://flagcdn.com/${lower}.svg`;
  const outPath = path.join(FLAGS_DIR, `${lower}.svg`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download ${iso2} flag (${response.status})`);
  }

  const svg = await response.text();
  await writeFile(outPath, svg, "utf8");
  return `/flags/${lower}.svg`;
}

function toCountryRecord(
  country: RestCountry,
  flagPath: string,
  marker: [number, number] | null,
  wikipediaUrl: string,
  countryCreationDate: string | null,
  independenceDate: string | null,
): CountryRecord {
  const iso2 = country.cca2?.toUpperCase() ?? "";
  const iso3 = country.cca3?.toUpperCase() ?? "";
  const name = country.name?.common?.trim() ?? "";

  const languages =
    country.languages && typeof country.languages === "object"
      ? Object.values(country.languages).filter(
          (value): value is string => typeof value === "string" && value.trim().length > 0,
        )
      : [];
  const currencies =
    country.currencies && typeof country.currencies === "object"
      ? Object.entries(country.currencies)
          .map(([code, details]) => {
            const name =
              details && typeof details.name === "string" && details.name.trim().length > 0
                ? details.name.trim()
                : code;
            const symbol =
              details && typeof details.symbol === "string" && details.symbol.trim().length > 0
                ? details.symbol.trim()
                : null;
            return symbol ? `${name} (${symbol})` : name;
          })
          .filter((value) => value.length > 0)
      : [];
  const countryLatLng = getCountryLatLng(country);
  const callingCodes =
    typeof country.idd?.root === "string" && Array.isArray(country.idd.suffixes)
      ? country.idd.suffixes
          .filter((suffix): suffix is string => typeof suffix === "string" && suffix.trim().length > 0)
          .map((suffix) => `${country.idd!.root}${suffix}`)
      : [];

  return {
    iso2,
    iso3,
    name,
    officialName: country.name?.official?.trim() ?? null,
    countryCreationDate,
    independenceDate,
    altSpellings: Array.isArray(country.altSpellings)
      ? country.altSpellings.filter(
          (value): value is string => typeof value === "string" && value.trim().length > 0,
        )
      : [],
    population:
      typeof country.population === "number" ? country.population : null,
    region: country.region ?? null,
    subregion: country.subregion ?? null,
    unMember: typeof country.unMember === "boolean" ? country.unMember : null,
    status: country.status ?? null,
    borders: Array.isArray(country.borders)
      ? country.borders.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      : [],
    continents: Array.isArray(country.continents)
      ? country.continents.filter(
          (value): value is string => typeof value === "string" && value.trim().length > 0,
        )
      : [],
    capital: country.capital?.[0] ?? null,
    areaKm2: typeof country.area === "number" ? country.area : null,
    latlng: countryLatLng,
    drivingSide: country.car?.side ?? null,
    callingCodes,
    internetTlds: Array.isArray(country.tld)
      ? country.tld.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      : [],
    googleMapsUrl: country.maps?.googleMaps ?? null,
    openStreetMapsUrl: country.maps?.openStreetMaps ?? null,
    wikipediaUrl,
    languages,
    currencies,
    timezones: Array.isArray(country.timezones)
      ? country.timezones.filter(
          (value): value is string => typeof value === "string" && value.trim().length > 0,
        )
      : [],
    independent:
      typeof country.independent === "boolean" ? country.independent : null,
    landlocked: typeof country.landlocked === "boolean" ? country.landlocked : null,
    startOfWeek: country.startOfWeek ?? null,
    flagPath,
    markerLng: marker?.[0] ?? null,
    markerLat: marker?.[1] ?? null,
  };
}

async function main() {
  await mkdir(FLAGS_DIR, { recursive: true });
  await mkdir(DATA_DIR, { recursive: true });

  const countries = await fetchCountries();
  const existingMarkerByKey = await loadExistingMarkerByKey();
  const valid = countries.filter((country) => country.cca2 && country.cca3);
  const features = await fetchCountryFeatures();
  const centerByIso2 = new Map<string, [number, number]>();
  const centerByIso3 = new Map<string, [number, number]>();

  for (const feature of features) {
    const center = getFeatureCenter(feature);
    if (!center) {
      continue;
    }
    const { iso2, iso3 } = getIsoFromFeature(feature);
    if (iso2) {
      centerByIso2.set(iso2, center);
    }
    if (iso3) {
      centerByIso3.set(iso3, center);
    }
  }

  const records: CountryRecord[] = [];
  const failures: string[] = [];

  for (const country of valid) {
    const iso2 = country.cca2!.toUpperCase();
    const iso3 = country.cca3!.toUpperCase();
    const existingMarker =
      existingMarkerByKey.get(`iso3:${iso3}`) ?? existingMarkerByKey.get(`iso2:${iso2}`) ?? null;
    const marker =
      existingMarker ??
      getCapitalMarker(country) ??
      centerByIso2.get(iso2) ??
      centerByIso3.get(iso3) ??
      null;

    try {
      const flagPath = await downloadFlag(iso2);
      const wikidataEntity = await resolveWikidataEntity(country);
      const wikipediaUrl = getWikipediaUrl(wikidataEntity, country.name?.common?.trim() ?? iso3);
      const countryCreationDate = wikidataEntity ? getCountryCreationDate(wikidataEntity) : null;
      const independenceDate = wikidataEntity
        ? getIndependenceDate(wikidataEntity, country.independent)
        : null;

      records.push(
        toCountryRecord(
          country,
          flagPath,
          marker,
          wikipediaUrl,
          countryCreationDate,
          independenceDate,
        ),
      );
    } catch (error) {
      failures.push(`${iso2}: ${(error as Error).message}`);
    }
  }

  records.sort((a, b) => a.name.localeCompare(b.name));
  await writeFile(DATA_PATH, `${JSON.stringify(records, null, 2)}\n`, "utf8");

  console.log(`Saved ${records.length} countries to ${DATA_PATH}`);
  console.log(`Saved flags to ${FLAGS_DIR}`);

  if (failures.length > 0) {
    console.log(`Skipped ${failures.length} flags:`);
    for (const failure of failures) {
      console.log(`- ${failure}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
