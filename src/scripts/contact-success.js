import { gsap } from "gsap";

const SCROLL_LOCK_CLASS = "overflow-hidden";

// lav-lockup-dark.svg has no groups: its first two paths are the symbol (the white tile and the
// brand tile with the five petals cut out), the next nine the wordmark letters and the rest the
// tagline letters.
const SYMBOL_PATH_COUNT = 2;
const WORDMARK_PATH_COUNT = 9;

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/**
 * Wires the contact success <dialog>. Opening locks the page scroll, focuses the close button
 * and plays the lockup intro: the symbol fades and scales in first, then the wordmark and the
 * tagline fade in.
 * Only opacity and scale move, and the props are cleared at the end, so the final state is the
 * official logo. Closing (button or Escape) releases the scroll and focuses `returnFocus`.
 * Returns { open, destroy }.
 */
export function initContactSuccess(dialog, { returnFocus } = {}) {
  const doc = dialog.ownerDocument;
  const closeButton = dialog.querySelector("[data-success-close]");
  const paths = [...dialog.querySelectorAll("[data-success-lockup] path")];
  const symbol = paths.slice(0, SYMBOL_PATH_COUNT);
  const wordmark = paths.slice(
    SYMBOL_PATH_COUNT,
    SYMBOL_PATH_COUNT + WORDMARK_PATH_COUNT,
  );
  const tagline = paths.slice(SYMBOL_PATH_COUNT + WORDMARK_PATH_COUNT);
  let intro = null;

  const stopIntro = () => {
    intro?.kill();
    intro = null;
    gsap.set(paths, { clearProps: "opacity,transform" });
  };

  const playIntro = () => {
    if (prefersReducedMotion() || !paths.length) return;
    intro = gsap
      .timeline({ onComplete: stopIntro })
      .from(symbol, {
        opacity: 0,
        scale: 0.85,
        // Both symbol paths share the same box, so they scale around one center.
        transformOrigin: "50% 50%",
        duration: 0.5,
        ease: "power3.out",
      })
      .from(wordmark, { opacity: 0, duration: 0.3, ease: "power1.out" }, 0.4)
      .from(tagline, { opacity: 0, duration: 0.3, ease: "power1.out" }, 0.65);
  };

  const open = () => {
    if (dialog.open) return;
    dialog.showModal();
    doc.documentElement.classList.add(SCROLL_LOCK_CLASS);
    closeButton?.focus();
    playIntro();
  };

  const close = () => {
    if (dialog.open) dialog.close();
  };

  // Also runs when the browser closes the dialog on its own.
  const onClose = () => {
    stopIntro();
    doc.documentElement.classList.remove(SCROLL_LOCK_CLASS);
    returnFocus?.focus();
  };

  const onKeydown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  closeButton?.addEventListener("click", close);
  dialog.addEventListener("keydown", onKeydown);
  dialog.addEventListener("close", onClose);

  return {
    open,
    destroy: () => {
      stopIntro();
      closeButton?.removeEventListener("click", close);
      dialog.removeEventListener("keydown", onKeydown);
      dialog.removeEventListener("close", onClose);
    },
  };
}
