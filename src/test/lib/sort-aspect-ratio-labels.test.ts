import { sortAspectRatioLabels } from "@/src/lib/sort-aspect-ratio-labels";

describe("sortAspectRatioLabels", () => {
  it("orders by numeric ratio (width/height), not string order", () => {
    const input = ["10:19", "2:1", "3:2", "1:1", "16:9"];
    expect(sortAspectRatioLabels(input)).toEqual(["10:19", "1:1", "3:2", "16:9", "2:1"]);
  });

  it("falls back to localeCompare for non-numeric labels", () => {
    expect(sortAspectRatioLabels(["3:2", "custom", "1:1"])).toEqual(["1:1", "3:2", "custom"]);
  });
});
