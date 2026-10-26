import { describe, expect, it } from "vitest";

import {
  activeChapterIndex,
  chapterLabel,
  formatIndex,
  scrollForOffset,
} from "./chapter-utils.js";

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

describe("activeChapterIndex", () => {
  const offsets = [0, 4000, 6000];

  it("returns the first chapter before or at its start", () => {
    expect(activeChapterIndex(offsets, -100)).toBe(0);
    expect(activeChapterIndex(offsets, 0)).toBe(0);
  });

  it("returns the last chapter that has started", () => {
    expect(activeChapterIndex(offsets, 3999)).toBe(0);
    expect(activeChapterIndex(offsets, 4000)).toBe(1);
    expect(activeChapterIndex(offsets, 9999)).toBe(2);
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
