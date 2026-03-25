export function formatNumber(value: number | null) {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat().format(value);
}

export function formatArea(value: number | null) {
  if (value === null) {
    return "N/A";
  }
  return `${new Intl.NumberFormat().format(value)} km²`;
}

export function formatYesNo(value: boolean | null) {
  if (value === null) {
    return "N/A";
  }
  return value ? "Yes" : "No";
}

export function formatList(values: string[] | null | undefined) {
  if (!values || values.length === 0) {
    return "N/A";
  }
  return values.join(", ");
}

export function formatStartOfWeek(value: string | null) {
  if (!value) {
    return "N/A";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatLatLng(value: [number, number] | null) {
  if (!value) {
    return "N/A";
  }
  const [lat, lng] = value;
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
