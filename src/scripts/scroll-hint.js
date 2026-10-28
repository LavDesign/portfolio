import { scrollToWork } from "./chapters.js";

// Native smooth scrolling has no completion callback in older browsers: focus anyway after this.
const NATIVE_FALLBACK_MS = 1500;

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/**
 * The hero's "Scroll to see selected work" link. Instead of jumping, it glides to Ch.1 with
 * Lenis (horizontal layout) or native smooth scrolling (otherwise), then moves focus to Ch.1
 * so the keyboard continues from there. With reduced motion it jumps at once.
 */
export function initScrollHint(doc = document) {
  const link = doc.querySelector("[data-scroll-hint]");
  const target = link && doc.querySelector(link.hash);
  if (!target) return;

  const focusTarget = () => {
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  link.addEventListener("click", (event) => {
    event.preventDefault();

    if (prefersReducedMotion()) {
      target.scrollIntoView();
      focusTarget();
      return;
    }

    if (scrollToWork(focusTarget)) return;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      focusTarget();
    };
    const timer = setTimeout(finish, NATIVE_FALLBACK_MS);
    window.addEventListener("scrollend", finish, { once: true });
    target.scrollIntoView({ behavior: "smooth" });
  });
}
