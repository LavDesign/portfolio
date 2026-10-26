import { describe, expect, it } from "vitest";

import { timeline, timelineClosing } from "./timeline.js";

describe("timeline", () => {
  it("has 7 years in ascending order", () => {
    const years = timeline.map((item) => item.year);
    expect(years).toHaveLength(7);
    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(new Set(years).size).toBe(years.length);
  });

  it("gives every year a label and has a closing line", () => {
    for (const item of timeline) {
      expect(Number.isInteger(item.year)).toBe(true);
      expect(item.label.trim()).not.toBe("");
    }
    expect(timelineClosing.trim()).not.toBe("");
  });
});
