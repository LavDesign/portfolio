import { describe, expect, it } from "vitest";

import { captureShift, largestSrc, srcsetFor } from "./captures.js";

const capture = {
  src: { 960: { src: "/a-960.webp" }, 1440: { src: "/a-1440.webp" } },
  width: 1440,
  height: 4443,
  alt: "A capture",
};

describe("srcsetFor", () => {
  it("lists every width with its file", () => {
    expect(srcsetFor(capture)).toBe("/a-960.webp 960w, /a-1440.webp 1440w");
  });
});

describe("largestSrc", () => {
  it("returns the file at the capture's own width", () => {
    expect(largestSrc(capture)).toBe("/a-1440.webp");
  });
});

describe("captureShift", () => {
  it("moves a tall capture until its bottom meets the box's", () => {
    // Full width in a 16:10 frame: the box shows 0.625 of a width; the capture is 3.085 tall.
    expect(captureShift(capture, 1, 10 / 16)).toBeCloseTo(-79.743, 3);
  });

  it("keeps a capture shorter than its box still", () => {
    expect(captureShift({ width: 16, height: 9 }, 1, 10 / 16)).toBe(0);
  });
});
