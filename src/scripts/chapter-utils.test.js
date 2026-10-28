import { describe, expect, it } from "vitest";

import {
  activeIndex,
  chapterForPanel,
  formatCount,
  formatIndex,
  scrollForOffset,
  scrollLength,
  trackPosition,
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

  it("adds the scroll of every pause before the offset", () => {
    // Travel 3000 + one 1000px pause at 1000: the pinned range is 4000px long.
    const paused = {
      start: 1000,
      end: 5000,
      distance: 3000,
      pauses: [1000],
      pauseLength: 1000,
    };
    expect(scrollForOffset({ ...paused, offset: 500 })).toBe(1500);
    // The paused panel itself lands at the pause's start, with its capture at the top.
    expect(scrollForOffset({ ...paused, offset: 1000 })).toBe(2000);
    expect(scrollForOffset({ ...paused, offset: 2000 })).toBe(4000);
    expect(scrollForOffset({ ...paused, offset: 3000 })).toBe(5000);
  });

  it("uses each pause's own length", () => {
    // Pauses of 400 (at 1000) and 1000 (at 2000): the pinned range is 4400px long.
    const mixed = {
      start: 0,
      end: 4400,
      distance: 3000,
      pauses: [1000, 2000],
      pauseLength: 1000,
      pauseLengths: [400],
    };
    expect(scrollForOffset({ ...mixed, offset: 2000 })).toBe(2400);
    expect(scrollForOffset({ ...mixed, offset: 2500 })).toBe(3900);
  });

  it("returns start when there is nothing to travel", () => {
    expect(scrollForOffset({ ...geometry, distance: 0, offset: 500 })).toBe(
      1000,
    );
  });
});

describe("scrollLength", () => {
  it("is the travel distance plus one pause length per pause", () => {
    expect(scrollLength({ distance: 3000 })).toBe(3000);
    expect(
      scrollLength({ distance: 3000, pauses: [1000, 2000], pauseLength: 800 }),
    ).toBe(4600);
  });

  it("never goes below the pauses' length", () => {
    expect(scrollLength({ distance: -20, pauses: [0], pauseLength: 800 })).toBe(
      800,
    );
  });
});

describe("trackPosition", () => {
  // Travel 3000 with a 1000px pause at offset 1000 (one 1000px panel in).
  const geometry = { distance: 3000, pauses: [1000], pauseLength: 1000 };

  it("moves 1:1 with scroll before the pause", () => {
    expect(trackPosition(-50, geometry)).toEqual({ travel: 0, pauses: [0] });
    expect(trackPosition(600, geometry)).toEqual({ travel: 600, pauses: [0] });
    expect(trackPosition(1000, geometry)).toEqual({
      travel: 1000,
      pauses: [0],
    });
  });

  it("holds the track while the pause runs", () => {
    expect(trackPosition(1250, geometry)).toEqual({
      travel: 1000,
      pauses: [0.25],
    });
    expect(trackPosition(2000, geometry)).toEqual({
      travel: 1000,
      pauses: [1],
    });
  });

  it("moves on after the pause and clamps at the end", () => {
    expect(trackPosition(2500, geometry)).toEqual({
      travel: 1500,
      pauses: [1],
    });
    expect(trackPosition(4000, geometry)).toEqual({
      travel: 3000,
      pauses: [1],
    });
    expect(trackPosition(9000, geometry)).toEqual({
      travel: 3000,
      pauses: [1],
    });
  });

  it("chains several pauses", () => {
    const two = { distance: 3000, pauses: [1000, 2000], pauseLength: 500 };
    expect(trackPosition(1700, two)).toEqual({ travel: 1200, pauses: [1, 0] });
    expect(trackPosition(2750, two)).toEqual({
      travel: 2000,
      pauses: [1, 0.5],
    });
    expect(trackPosition(4000, two)).toEqual({ travel: 3000, pauses: [1, 1] });
  });

  it("lets each pause set its own length", () => {
    // A 400px pause at 1000, then the shared 1000px one at 2000.
    const mixed = {
      distance: 3000,
      pauses: [1000, 2000],
      pauseLength: 1000,
      pauseLengths: [400],
    };
    expect(trackPosition(1200, mixed)).toEqual({
      travel: 1000,
      pauses: [0.5, 0],
    });
    expect(trackPosition(2400, mixed)).toEqual({
      travel: 2000,
      pauses: [1, 0],
    });
    expect(trackPosition(2900, mixed)).toEqual({
      travel: 2000,
      pauses: [1, 0.5],
    });
    expect(scrollLength(mixed)).toBe(4400);
  });

  it("moves without stopping when there are no pauses", () => {
    expect(trackPosition(1234, { distance: 3000 })).toEqual({
      travel: 1234,
      pauses: [],
    });
  });
});
