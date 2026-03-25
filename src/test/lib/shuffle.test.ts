import { shuffleArray } from "@/src/lib/shuffle";

describe("shuffleArray", () => {
  it("returns same length and multiset of items", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toHaveLength(input.length);
    expect([...result].sort((a, b) => a - b)).toEqual(input);
  });

  it("does not mutate the original array", () => {
    const input = Object.freeze([1, 2, 3]);
    const result = shuffleArray(input);
    expect(result).not.toBe(input);
    expect(input).toEqual([1, 2, 3]);
  });
});
