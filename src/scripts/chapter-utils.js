/** Zero-padded count for display: 4 -> "04". */
export function formatCount(count) {
  return String(count).padStart(2, "0");
}

/** Zero-padded index for display: 0 -> "01". */
export function formatIndex(index) {
  return formatCount(index + 1);
}

/**
 * Index of the last item (panel) that starts at or before `position`
 * (both measured in px along the track). Returns 0 before the first one.
 */
export function activeIndex(offsets, position) {
  let active = 0;
  offsets.forEach((offset, index) => {
    if (offset <= position) active = index;
  });
  return active;
}

/**
 * Chapter that owns a panel, given how many panels each chapter has:
 * with [4, 1, 3, 1], panels 0–3 -> 0, 4 -> 1, 5–7 -> 2, 8 -> 3.
 */
export function chapterForPanel(panelIndex, panelCounts) {
  let end = 0;
  for (let chapter = 0; chapter < panelCounts.length; chapter++) {
    end += panelCounts[chapter];
    if (panelIndex < end) return chapter;
  }
  return Math.max(panelCounts.length - 1, 0);
}

// Scroll the track stays stopped at pause `index`: its own entry in `pauseLengths` when set,
// otherwise the shared `pauseLength`.
const lengthOf = (index, { pauseLength = 0, pauseLengths = [] }) =>
  pauseLengths[index] ?? pauseLength;

/**
 * Scroll length of the pinned track: its travel `distance` plus, for each offset in
 * `pauses`, the px of scroll the track stays stopped there while a capture scrolls.
 */
export function scrollLength({ distance, pauses = [], ...lengths }) {
  return (
    Math.max(distance, 0) +
    pauses.reduce((sum, _pause, index) => sum + lengthOf(index, lengths), 0)
  );
}

/**
 * Where the track is after `scrolled` px of the pinned range. `pauses` are track offsets
 * (sorted, within 0..distance). Returns the track's `travel` (px) and each pause's progress
 * (0 before it, 0–1 while the track is stopped there, 1 after).
 */
export function trackPosition(scrolled, { distance, pauses = [], ...lengths }) {
  let earlier = 0;
  const progress = pauses.map((pause, index) => {
    // Scroll at which the track reaches this pause: its offset plus the earlier pauses.
    const start = pause + earlier;
    const length = lengthOf(index, lengths);
    earlier += length;
    if (scrolled <= start) return 0;
    if (length <= 0) return 1;
    return Math.min((scrolled - start) / length, 1);
  });
  // Every pause fully or partly passed holds the track back by the scroll it used.
  const held = progress.reduce(
    (sum, value, index) => sum + value * lengthOf(index, lengths),
    0,
  );
  const travel = Math.min(Math.max(scrolled - held, 0), Math.max(distance, 0));
  return { travel, pauses: progress };
}

/**
 * Vertical scroll position that brings a horizontal track offset into view,
 * given the pinned trigger's start/end, the track's travel distance and its pauses.
 * An offset with a pause lands at the pause's start (the capture at its top).
 */
export function scrollForOffset({ start, end, distance, offset, ...track }) {
  const total = scrollLength({ distance, ...track });
  if (distance <= 0 || total <= 0) return start;
  const clamped = Math.min(Math.max(offset, 0), distance);
  const { pauses = [] } = track;
  const before = pauses.reduce(
    (sum, pause, index) =>
      pause < clamped ? sum + lengthOf(index, track) : sum,
    0,
  );
  return start + ((clamped + before) / total) * (end - start);
}
