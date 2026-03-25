import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type ExistingCountry = {
  iso2: string;
  [key: string]: unknown;
};

type FlagColor = {
  hex: string;
  name: string | null;
  meaning: string | null;
};

type FlagMetadata = {
  aspectRatio: string | null;
  colors: FlagColor[];
  notableHistory: string | null;
  sources: string[];
};

type SeedMap = Record<string, FlagMetadata>;

const ROOT = process.cwd();
const COUNTRIES_PATH = path.join(ROOT, "src", "data", "countries.json");
const SEED_PATH = path.join(ROOT, "scripts", "data", "flag-metadata-seed.json");

function normalizeColor(color: FlagColor): FlagColor {
  return {
    hex: color.hex.trim().toUpperCase(),
    name: color.name?.trim() || null,
    meaning: color.meaning?.trim() || null,
  };
}

function normalizeFlag(flag: FlagMetadata | undefined): FlagMetadata {
  if (!flag) {
    return { aspectRatio: null, colors: [], notableHistory: null, sources: [] };
  }
  return {
    aspectRatio: flag.aspectRatio ?? null,
    colors: Array.isArray(flag.colors) ? flag.colors.map(normalizeColor) : [],
    notableHistory: flag.notableHistory ?? null,
    sources: Array.isArray(flag.sources)
      ? Array.from(new Set(flag.sources.map((source) => source.trim()).filter(Boolean)))
      : [],
  };
}

async function main() {
  const rawCountries = await readFile(COUNTRIES_PATH, "utf8");
  const countries = JSON.parse(rawCountries) as ExistingCountry[];
  const rawSeed = await readFile(SEED_PATH, "utf8");
  const seed = JSON.parse(rawSeed) as SeedMap;

  const enriched = countries.map((country) => {
    const metadata = seed[country.iso2.toUpperCase()];
    return {
      ...country,
      flag: normalizeFlag(metadata),
    };
  });

  await writeFile(COUNTRIES_PATH, `${JSON.stringify(enriched, null, 2)}\n`, "utf8");
  console.log(`Updated ${enriched.length} countries in ${COUNTRIES_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
