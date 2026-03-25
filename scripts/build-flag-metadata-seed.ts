import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import countries from "../src/data/countries.json";

type CountryRecord = {
  iso2: string;
  name: string;
  wikipediaUrl: string;
  flagPath: string;
};

type SeedFlagColor = {
  hex: string;
  name: string | null;
  meaning: string | null;
};

type SeedFlagMetadata = {
  aspectRatio: string | null;
  colors: SeedFlagColor[];
  notableHistory: string | null;
  sources: string[];
};

type SeedMap = Record<string, SeedFlagMetadata>;

type WikiOpenSearch = [string, string[], string[], string[]];

type WikiSummary = {
  extract?: string;
  content_urls?: {
    desktop?: {
      page?: string;
    };
  };
};

const ROOT = process.cwd();
const SEED_DIR = path.join(ROOT, "scripts", "data");
const SEED_PATH = path.join(SEED_DIR, "flag-metadata-seed.json");

const BASIC_COLORS: Array<{ name: string; hex: string; rgb: [number, number, number] }> = [
  { name: "black", hex: "#000000", rgb: [0, 0, 0] },
  { name: "white", hex: "#FFFFFF", rgb: [255, 255, 255] },
  { name: "red", hex: "#D22F27", rgb: [210, 47, 39] },
  { name: "green", hex: "#1B8A3D", rgb: [27, 138, 61] },
  { name: "blue", hex: "#1E4DA1", rgb: [30, 77, 161] },
  { name: "yellow", hex: "#F2C319", rgb: [242, 195, 25] },
  { name: "orange", hex: "#E8751A", rgb: [232, 117, 26] },
  { name: "brown", hex: "#8A5A2B", rgb: [138, 90, 43] },
  { name: "purple", hex: "#6C3D96", rgb: [108, 61, 150] },
  { name: "gray", hex: "#808080", rgb: [128, 128, 128] },
];

function normalizeHex(raw: string): string | null {
  const trimmed = raw.trim().toUpperCase();
  if (/^#[0-9A-F]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  if (/^#[0-9A-F]{6}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^#[0-9A-F]{8}$/.test(trimmed)) {
    return `#${trimmed.slice(1, 7)}`;
  }
  return null;
}

function parseRgbToken(token: string): string | null {
  const match = token
    .trim()
    .match(/^RGB\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)$/i);
  if (!match) {
    return null;
  }
  const rgb = match.slice(1, 4).map((value) => Math.min(255, Number(value)));
  if (rgb.some((value) => !Number.isFinite(value))) {
    return null;
  }
  return `#${rgb.map((value) => value.toString(16).toUpperCase().padStart(2, "0")).join("")}`;
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

function getColorName(hex: string): string | null {
  const rgb = hexToRgb(hex);
  let best: { name: string; distance: number } | null = null;
  for (const option of BASIC_COLORS) {
    const distance =
      (rgb[0] - option.rgb[0]) ** 2 + (rgb[1] - option.rgb[1]) ** 2 + (rgb[2] - option.rgb[2]) ** 2;
    if (!best || distance < best.distance) {
      best = { name: option.name, distance };
    }
  }
  return best?.name ?? null;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
}

function toAspectRatio(width: number, height: number): string | null {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }
  const roundedW = Math.round(width * 1000);
  const roundedH = Math.round(height * 1000);
  const divisor = gcd(roundedW, roundedH);
  return `${Math.round(roundedW / divisor)}:${Math.round(roundedH / divisor)}`;
}

function parseAspectRatio(svg: string): string | null {
  const viewBox = svg.match(/\bviewBox\s*=\s*"([^"]+)"/i)?.[1];
  if (viewBox) {
    const parts = viewBox
      .trim()
      .split(/\s+/)
      .map((value) => Number.parseFloat(value));
    if (parts.length === 4 && parts.every((value) => Number.isFinite(value))) {
      return toAspectRatio(parts[2]!, parts[3]!);
    }
  }

  const width = svg.match(/\bwidth\s*=\s*"([^"]+)"/i)?.[1];
  const height = svg.match(/\bheight\s*=\s*"([^"]+)"/i)?.[1];
  if (width && height) {
    const w = Number.parseFloat(width);
    const h = Number.parseFloat(height);
    return toAspectRatio(w, h);
  }

  return null;
}

function extractColors(svg: string): Array<{ hex: string; name: string | null }> {
  const counts = new Map<string, number>();
  const addHex = (raw: string) => {
    const normalized = normalizeHex(raw) ?? parseRgbToken(raw);
    if (!normalized) {
      return;
    }
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  };

  for (const match of svg.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)) {
    addHex(match[0]);
  }
  for (const match of svg.matchAll(/rgb\(\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*\)/gi)) {
    addHex(match[0]);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([hex]) => ({ hex, name: getColorName(hex) }));
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "world-flags-flag-metadata/1.0" },
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function toWikiTitleFromUrl(url: string): string | null {
  const match = url.match(/\/wiki\/(.+)$/);
  if (!match?.[1]) {
    return null;
  }
  return decodeURIComponent(match[1]);
}

async function resolveFlagPageTitle(country: CountryRecord): Promise<string | null> {
  const countryTitle = toWikiTitleFromUrl(country.wikipediaUrl) ?? country.name.replace(/ /g, "_");
  const preferred = `Flag_of_${countryTitle}`;
  const directSummary = await fetchJson<WikiSummary>(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(preferred)}`,
  );
  if (directSummary?.extract) {
    return preferred;
  }

  const query = `Flag of ${country.name}`;
  const openSearch = await fetchJson<WikiOpenSearch>(
    `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json&origin=*`,
  );
  const titles = openSearch?.[1] ?? [];
  const best = titles.find((title) => /^Flag of /i.test(title));
  return best ? best.replace(/ /g, "_") : null;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function pickNotableHistory(extract: string): string | null {
  const sentences = splitSentences(extract);
  const history = sentences.find((sentence) =>
    /\b(adopted|introduced|approved|used since|first used|current flag)\b/i.test(sentence),
  );
  return history ?? sentences[0] ?? null;
}

function pickMeaning(extract: string, colorName: string | null): string | null {
  if (!colorName) {
    return null;
  }
  const sentences = splitSentences(extract);
  const candidate = sentences.find((sentence) => {
    return (
      new RegExp(`\\b${colorName}\\b`, "i").test(sentence) &&
      /\b(represent|symboli[sz]e|stand for|denote|signif)\b/i.test(sentence)
    );
  });
  return candidate ?? null;
}

async function buildOne(country: CountryRecord): Promise<SeedFlagMetadata> {
  const flagSvgPath = path.join(ROOT, "public", country.flagPath.replace(/^\/+/, ""));
  const svg = await readFile(flagSvgPath, "utf8");
  const aspectRatio = parseAspectRatio(svg);
  const colors = extractColors(svg);

  const title = await resolveFlagPageTitle(country);
  const summary = title
    ? await fetchJson<WikiSummary>(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      )
    : null;
  const extract = summary?.extract ?? "";
  const notableHistory = extract ? pickNotableHistory(extract) : null;
  const sourceSet = new Set<string>([country.wikipediaUrl]);
  if (summary?.content_urls?.desktop?.page) {
    sourceSet.add(summary.content_urls.desktop.page);
  } else if (title) {
    sourceSet.add(`https://en.wikipedia.org/wiki/${title}`);
  }

  return {
    aspectRatio,
    colors: colors.map((entry) => ({
      hex: entry.hex,
      name: entry.name,
      meaning: extract ? pickMeaning(extract, entry.name) : null,
    })),
    notableHistory,
    sources: Array.from(sourceSet),
  };
}

async function main() {
  const records = countries as CountryRecord[];
  const seed: SeedMap = {};

  for (let index = 0; index < records.length; index += 1) {
    const country = records[index]!;
    seed[country.iso2] = await buildOne(country);
    if ((index + 1) % 20 === 0 || index === records.length - 1) {
      console.log(`Processed ${index + 1}/${records.length}: ${country.name}`);
    }
  }

  await mkdir(SEED_DIR, { recursive: true });
  await writeFile(SEED_PATH, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
  console.log(`Saved seed metadata to ${SEED_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
