/**
 * Helpers for the capture data in projects.js: `src` maps each width to its file
 * ({ src } from an asset import); `width`/`height` are the largest version's size.
 */

/** `srcset` for a capture: "file-320.webp 320w, file-480.webp 480w". */
export function srcsetFor(capture) {
  return Object.keys(capture.src)
    .map((width) => `${capture.src[width].src} ${width}w`)
    .join(", ");
}

/** The largest version's file URL. */
export function largestSrc(capture) {
  return capture.src[capture.width].src;
}

/**
 * How far a capture shown at full width in a clipping box moves to show its bottom edge,
 * as a % of its own height (negative: it moves up). `boxWidth` and `boxHeight` share a unit.
 * A capture shorter than its box doesn't move.
 */
export function captureShift(capture, boxWidth, boxHeight) {
  const height = boxWidth * (capture.height / capture.width);
  const hidden = Math.max(1 - boxHeight / height, 0);
  return hidden === 0 ? 0 : -hidden * 100;
}
