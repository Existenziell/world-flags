import {
  formatArea,
  formatLatLng,
  formatList,
  formatNumber,
  formatStartOfWeek,
  formatYesNo,
} from "@/src/lib/formatters";

describe("formatters", () => {
  test("formatNumber returns N/A for null", () => {
    expect(formatNumber(null)).toBe("N/A");
  });

  test("formatNumber formats a number", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  test("formatArea returns N/A for null", () => {
    expect(formatArea(null)).toBe("N/A");
  });

  test("formatArea formats square kilometers", () => {
    expect(formatArea(7654321)).toBe("7,654,321 km²");
  });

  test("formatYesNo handles booleans and null", () => {
    expect(formatYesNo(true)).toBe("Yes");
    expect(formatYesNo(false)).toBe("No");
    expect(formatYesNo(null)).toBe("N/A");
  });

  test("formatList handles empty and populated lists", () => {
    expect(formatList([])).toBe("N/A");
    expect(formatList(null)).toBe("N/A");
    expect(formatList(["One", "Two"])).toBe("One, Two");
  });

  test("formatStartOfWeek capitalizes the value", () => {
    expect(formatStartOfWeek("monday")).toBe("Monday");
    expect(formatStartOfWeek(null)).toBe("N/A");
  });

  test("formatLatLng formats coordinates", () => {
    expect(formatLatLng([51.5074, -0.1278])).toBe("51.5074, -0.1278");
    expect(formatLatLng(null)).toBe("N/A");
  });
});
