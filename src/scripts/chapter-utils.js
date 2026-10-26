/** Zero-padded index for display: 0 -> "01". */
export function formatIndex(index) {
  return String(index + 1).padStart(2, "0");
}

/** Rail label for a chapter: 0, 4 -> "CH.1 / 4". */
export function chapterLabel(index, total) {
  return `CH.${index + 1} / ${total}`;
}

/**
 * Index of the last chapter that starts at or before `position`
 * (both measured in px along the track). Returns 0 before the first one.
 */
export function activeChapterIndex(offsets, position) {
  let active = 0;
  offsets.forEach((offset, index) => {
    if (offset <= position) active = index;
  });
  return active;
}

/**
 * Vertical scroll position that brings a horizontal track offset into view,
 * given the pinned trigger's start/end and the track's total travel distance.
 */
export function scrollForOffset({ start, end, distance, offset }) {
  if (distance <= 0) return start;
  const clamped = Math.min(Math.max(offset, 0), distance);
  return start + (clamped / distance) * (end - start);
}
