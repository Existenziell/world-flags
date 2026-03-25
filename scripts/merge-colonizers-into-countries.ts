/**
 * One-off / maintenance: writes `colonizer` onto each record in countries.json
 * from TERRITORY_COLONIZER_BY_ISO2. Run after editing the map or to backfill.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { TERRITORY_COLONIZER_BY_ISO2 } from "../src/lib/territory-colonizers";

const DATA_PATH = path.join(process.cwd(), "src", "data", "countries.json");

type Row = Record<string, unknown>;

function colonizerFor(row: Row): string | null {
  if (row.independent !== false) {
    return null;
  }
  const iso2 = String(row.iso2 ?? "").toUpperCase();
  return TERRITORY_COLONIZER_BY_ISO2[iso2] ?? null;
}

/** Insert `colonizer` immediately after `independent` for stable, readable JSON. */
function withColonizerField(row: Row): Row {
  const { colonizer, ...rest } = row;
  void colonizer;
  const value = colonizerFor(row);
  const keys = Object.keys(rest);
  const out: Row = {};
  for (const key of keys) {
    out[key] = rest[key];
    if (key === "independent") {
      out.colonizer = value;
    }
  }
  return out;
}

async function main() {
  const raw = await readFile(DATA_PATH, "utf8");
  const rows = JSON.parse(raw) as Row[];
  const next = rows.map((row) => withColonizerField(row));
  await writeFile(DATA_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(`Updated ${next.length} rows in ${DATA_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
