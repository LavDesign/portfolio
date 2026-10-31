const SCROLL_LOCK_CLASS = "overflow-hidden";
// Set on the dialog while it was opened by tap or click and no key has been pressed since.
const POINTER_OPEN_ATTR = "data-pointer-open";

// The menu panel's two states and how it moves between them (subtle: 8px and a fade).
const SHOWN = { opacity: 1, transform: "translateY(0px)" };
const HIDDEN = { opacity: 0, transform: "translateY(8px)" };
const OPEN_MOTION = { duration: 280, easing: "ease-out" };
const CLOSE_MOTION = { duration: 220, easing: "ease-in" };

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const normalizePath = (path) => path.replace(/\/+$/, "") || "/";

/**
 * Wires the site menu <dialog> to every [data-menu-open] trigger.
 * Opening and closing animate the [data-menu-panel]; the dialog only closes (and the page
 * scroll is only released) once the closing animation ends. Menu links navigate right away,
 * with the menu still open: the page's cross-document view transition (global.css) fades it
 * into the next page. A link to the current page only closes the menu.
 * Dispatches "menu:open" when it opens, "menu:closing" when the closing animation starts and
 * "menu:close" once the dialog is closed, on the document, so other scripts can react.
 * Returns a cleanup function that removes the listeners.
 */
export function initMenu(doc = document) {
  const dialog = doc.getElementById("site-menu");
  if (!dialog) return () => {};

  const panel = dialog.querySelector("[data-menu-panel]");
  const triggers = [...doc.querySelectorAll("[data-menu-open]")];
  const closeButtons = [...dialog.querySelectorAll("[data-menu-close]")];
  const links = [...dialog.querySelectorAll("[data-menu-link]")];
  let opener = null;
  let closing = false;
  // Bumped on every open and close, so a stale animation or timer never acts on a newer one.
  let run = 0;
  let motion = null;

  const setExpanded = (value) => {
    triggers.forEach((trigger) =>
      trigger.setAttribute("aria-expanded", String(value)),
    );
  };

  const stopMotion = () => {
    motion?.cancel();
    motion = null;
  };

  // Moves the panel to `to`. Mid-animation it starts from wherever the panel is right now,
  // with the duration scaled to the distance left, so reversing never jumps.
  // Returns the animation, or null when the change should be immediate.
  const animatePanel = (to, timing) => {
    if (
      !panel ||
      typeof panel.animate !== "function" ||
      prefersReducedMotion()
    ) {
      stopMotion();
      return null;
    }
    let from = to === SHOWN ? HIDDEN : SHOWN;
    if (motion) {
      const style = getComputedStyle(panel);
      from = { opacity: Number(style.opacity), transform: style.transform };
      if (from.transform === "none") from.transform = SHOWN.transform;
    }
    const distance = Math.abs(to.opacity - from.opacity);
    stopMotion();
    motion = panel.animate([from, to], {
      ...timing,
      duration: timing.duration * distance,
      fill: "forwards",
    });
    return motion;
  };

  const open = (event) => {
    if (dialog.open && !closing) return;
    opener = event?.currentTarget ?? opener;
    closing = false;
    run += 1;
    // A tap or click reports detail > 0; Enter or Space on the button reports 0. WebKit shows
    // the focus ring on the scripted focus below even after a tap, so a pointer open hides it
    // (MenuOverlay.astro) until the first key press.
    dialog.toggleAttribute(POINTER_OPEN_ATTR, (event?.detail ?? 0) > 0);
    if (!dialog.open) dialog.showModal();
    setExpanded(true);
    doc.documentElement.classList.add(SCROLL_LOCK_CLASS);
    doc.dispatchEvent(new CustomEvent("menu:open"));
    dialog.querySelector("[data-menu-link]")?.focus();

    const current = run;
    animatePanel(SHOWN, OPEN_MOTION)
      ?.finished.then(() => {
        if (current === run) stopMotion();
      })
      .catch(() => {});
  };

  // Plays the closing animation, then closes the dialog.
  const close = () => {
    if (!dialog.open || closing) return;
    closing = true;
    run += 1;
    doc.dispatchEvent(new CustomEvent("menu:closing"));

    const current = run;
    const finish = () => {
      if (current === run && closing && dialog.open) dialog.close();
    };
    const animation = animatePanel(HIDDEN, CLOSE_MOTION);
    if (!animation) {
      finish();
      return;
    }
    animation.finished.then(finish).catch(() => {});
  };

  // Also runs when the browser closes the dialog on its own (an uncancelable Escape).
  const onClose = () => {
    stopMotion();
    const wasClosing = closing;
    closing = false;
    run += 1;
    if (!wasClosing) doc.dispatchEvent(new CustomEvent("menu:closing"));
    dialog.removeAttribute(POINTER_OPEN_ATTR);
    setExpanded(false);
    doc.documentElement.classList.remove(SCROLL_LOCK_CLASS);
    doc.dispatchEvent(new CustomEvent("menu:close"));
    opener?.focus();
    opener = null;
  };

  // Menu links leave the menu open on purpose. If the browser later restores this page from
  // its back/forward cache, it comes back closed, and the link tapped to leave keeps no focus.
  const onPageShow = (event) => {
    if (!event.persisted) return;
    if (dialog.open) dialog.close();
    if (doc.activeElement?.matches("[data-menu-link]"))
      doc.activeElement.blur();
  };

  const onCloseButton = () => close();

  // Escape animates too. The keydown is handled first so repeated Escapes are never turned
  // into an instant close; "cancel" covers other close requests (Android's back gesture).
  const onKeydown = (event) => {
    // Any key means the keyboard is in use: the focus ring shows again.
    dialog.removeAttribute(POINTER_OPEN_ATTR);
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };
  const onCancel = (event) => {
    event.preventDefault();
    close();
  };

  // A plain click on a link to the current page only closes the menu (animated). Any other
  // link, and modified clicks (new tab or window), are left to the browser.
  const onLinkClick = (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const link = event.currentTarget;
    if (link.target && link.target !== "_self") return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;

    const isCurrentPage =
      normalizePath(url.pathname) === normalizePath(window.location.pathname) &&
      url.search === window.location.search &&
      !url.hash;
    if (!isCurrentPage) return;

    event.preventDefault();
    close();
  };

  triggers.forEach((trigger) => trigger.addEventListener("click", open));
  closeButtons.forEach((button) =>
    button.addEventListener("click", onCloseButton),
  );
  links.forEach((link) => link.addEventListener("click", onLinkClick));
  dialog.addEventListener("keydown", onKeydown);
  dialog.addEventListener("cancel", onCancel);
  dialog.addEventListener("close", onClose);
  window.addEventListener("pageshow", onPageShow);

  return () => {
    triggers.forEach((trigger) => trigger.removeEventListener("click", open));
    closeButtons.forEach((button) =>
      button.removeEventListener("click", onCloseButton),
    );
    links.forEach((link) => link.removeEventListener("click", onLinkClick));
    dialog.removeEventListener("keydown", onKeydown);
    dialog.removeEventListener("cancel", onCancel);
    dialog.removeEventListener("close", onClose);
    window.removeEventListener("pageshow", onPageShow);
  };
}
