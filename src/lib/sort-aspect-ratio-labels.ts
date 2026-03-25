/** Parse "w:h" into positive integers; returns null if not in that form. */
function parseAspectRatioLabel(label: string): [number, number] | null {
  const m = /^(\d+)\s*:\s*(\d+)$/.exec(label.trim());
  if (!m) {
    return null;
  }
  const w = Number(m[1]);
  const h = Number(m[2]);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return null;
  }
  return [w, h];
}

/** Compare two "w:h" labels by numeric ratio w/h (wider/shorter first), then lexicographically. */
function compareAspectRatioLabel(a: string, b: string): number {
  const pa = parseAspectRatioLabel(a);
  const pb = parseAspectRatioLabel(b);
  if (pa && pb) {
    const [wa, ha] = pa;
    const [wb, hb] = pb;
    const lhs = wa * hb;
    const rhs = wb * ha;
    if (lhs !== rhs) {
      return lhs - rhs;
    }
  }
  if (pa && !pb) {
    return -1;
  }
  if (!pa && pb) {
    return 1;
  }
  return a.localeCompare(b);
}

/** Sort unique flag aspect ratio strings (e.g. from `countries.json`) for filter UI. */
export function sortAspectRatioLabels(labels: readonly string[]): string[] {
  return [...labels].sort(compareAspectRatioLabel);
}
