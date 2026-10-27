import { describe, expect, it } from "vitest";

import {
  activeIndex,
  chapterForPanel,
  chapterLabel,
  formatCount,
  formatIndex,
  scrollForOffset,
} from "./chapter-utils.js";

describe("formatCount", () => {
  it("pads to two digits", () => {
    expect(formatCount(4)).toBe("04");
    expect(formatCount(12)).toBe("12");
  });
});

describe("formatIndex", () => {
  it("pads to two digits and is 1-based", () => {
    expect(formatIndex(0)).toBe("01");
    expect(formatIndex(9)).toBe("10");
  });
});

describe("chapterLabel", () => {
  it("formats the rail label", () => {
    expect(chapterLabel(0, 4)).toBe("CH.1 / 4");
    expect(chapterLabel(3, 4)).toBe("CH.4 / 4");
  });
});

describe("activeIndex", () => {
  const offsets = [0, 4000, 6000];

  it("returns the first chapter before or at its start", () => {
    expect(activeIndex(offsets, -100)).toBe(0);
    expect(activeIndex(offsets, 0)).toBe(0);
  });

  it("returns the last chapter that has started", () => {
    expect(activeIndex(offsets, 3999)).toBe(0);
    expect(activeIndex(offsets, 4000)).toBe(1);
    expect(activeIndex(offsets, 9999)).toBe(2);
  });
});

describe("chapterForPanel", () => {
  // Ch.1 has 4 project panels, Ch.2 1, Ch.3 3 (one per principle), Ch.4 1.
  const panelCounts = [4, 1, 3, 1];

  it.each([
    [0, 0],
    [3, 0],
    [4, 1],
    [5, 2],
    [7, 2],
    [8, 3],
  ])("maps panel %i to chapter %i", (panel, chapter) => {
    expect(chapterForPanel(panel, panelCounts)).toBe(chapter);
  });

  it("clamps panels past the end to the last chapter", () => {
    expect(chapterForPanel(42, panelCounts)).toBe(3);
  });
});

describe("scrollForOffset", () => {
  const geometry = { start: 1000, end: 4000, distance: 3000 };

  it("maps track offsets linearly onto the pinned scroll range", () => {
    expect(scrollForOffset({ ...geometry, offset: 0 })).toBe(1000);
    expect(scrollForOffset({ ...geometry, offset: 1500 })).toBe(2500);
    expect(scrollForOffset({ ...geometry, offset: 3000 })).toBe(4000);
  });

  it("clamps offsets outside the track", () => {
    expect(scrollForOffset({ ...geometry, offset: -50 })).toBe(1000);
    expect(scrollForOffset({ ...geometry, offset: 9000 })).toBe(4000);
  });

  it("returns start when there is nothing to travel", () => {
    expect(scrollForOffset({ ...geometry, distance: 0, offset: 500 })).toBe(
      1000,
    );
  });
});
