const ROLL = { duration: 200, easing: "ease-out" };

// The rail text is vertical-rl rotated 180°, so it reads bottom to top and the glyphs' "up"
// points to the screen's left. In the element's own (pre-rotation) axes that is +X, so the
// digit rolls on X: the old one leaves toward the glyphs' top, the new one enters from below.
const EXIT = [
  { transform: "translateX(0)", opacity: 1 },
  { transform: "translateX(100%)", opacity: 0 },
];
const ENTER = [
  { transform: "translateX(-100%)", opacity: 0 },
  { transform: "translateX(0)", opacity: 1 },
];

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/**
 * Drives the rail's "CH.n / total" indicator. set(index) shows a chapter, set(null) restores
 * the element's original text ("© 2026"). The digit is highlighted in brand, 2px larger than
 * "CH." and "/ total". Between chapters only the digit rolls; a new change
 * mid-roll settles the running one first, so fast scrolling never stacks animations.
 * Not a live region on purpose: announcing every chapter change would be noise.
 */
export function createRailStatus(el, total) {
  if (!el) return { set() {} };

  const defaultText = el.textContent.trim();
  let current = null;
  let slot = null;

  const digit = (index) => {
    const span = document.createElement("span");
    span.style.gridArea = "1 / 1";
    span.textContent = String(index + 1);
    return span;
  };

  const render = (index) => {
    if (index === null) {
      el.textContent = defaultText;
      delete el.dataset.active;
      slot = null;
      return;
    }
    slot = document.createElement("span");
    slot.style.display = "inline-grid";
    slot.style.overflow = "clip";
    slot.style.color = "var(--color-brand)";
    slot.style.fontSize = "calc(1em + 2px)";
    // line-height 1 keeps the larger digit inside the parent's line box, so the text doesn't
    // shift sideways when the indicator appears; Geist Mono's fixed advance keeps it from
    // shifting along the line as digits change.
    slot.style.lineHeight = "1";
    slot.append(digit(index));
    el.replaceChildren("CH.", slot, ` / ${total}`);
    el.dataset.active = "";
  };

  const roll = (index) => {
    // Settle any roll in progress: drop outgoing digits and snap the newest one in place.
    const digits = [...slot.children];
    digits.forEach((d) => d.getAnimations().forEach((a) => a.cancel()));
    digits.slice(0, -1).forEach((d) => d.remove());

    const outgoing = slot.lastElementChild;
    outgoing.setAttribute("aria-hidden", "true");
    const incoming = digit(index);
    slot.append(incoming);

    outgoing
      .animate(EXIT, { ...ROLL, fill: "forwards" })
      .finished.then(() => outgoing.remove())
      .catch(() => {});
    incoming.animate(ENTER, ROLL);
  };

  return {
    set(index) {
      if (index === current) return;
      const previous = current;
      current = index;

      const canRoll =
        previous !== null &&
        index !== null &&
        slot &&
        typeof slot.animate === "function" &&
        !prefersReducedMotion();

      if (canRoll) roll(index);
      else render(index);
    },
  };
}
