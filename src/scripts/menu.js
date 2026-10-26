const SCROLL_LOCK_CLASS = "overflow-hidden";

/**
 * Wires the site menu <dialog> to every [data-menu-open] trigger.
 * Returns a cleanup function that removes the listeners.
 */
export function initMenu(doc = document) {
  const dialog = doc.getElementById("site-menu");
  if (!dialog) return () => {};

  const triggers = [...doc.querySelectorAll("[data-menu-open]")];
  const closeButton = dialog.querySelector("[data-menu-close]");
  let opener = null;

  const setExpanded = (value) => {
    triggers.forEach((trigger) =>
      trigger.setAttribute("aria-expanded", String(value)),
    );
  };

  const open = (event) => {
    if (dialog.open) return;
    opener = event.currentTarget;
    dialog.showModal();
    setExpanded(true);
    doc.documentElement.classList.add(SCROLL_LOCK_CLASS);
    dialog.querySelector("[data-menu-link]")?.focus();
  };

  const close = () => {
    if (dialog.open) dialog.close();
  };

  const onClose = () => {
    setExpanded(false);
    doc.documentElement.classList.remove(SCROLL_LOCK_CLASS);
    opener?.focus();
    opener = null;
  };

  // Handle Escape ourselves so closing always goes through the same path.
  const onKeydown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  triggers.forEach((trigger) => trigger.addEventListener("click", open));
  closeButton?.addEventListener("click", close);
  dialog.addEventListener("keydown", onKeydown);
  dialog.addEventListener("close", onClose);

  return () => {
    triggers.forEach((trigger) => trigger.removeEventListener("click", open));
    closeButton?.removeEventListener("click", close);
    dialog.removeEventListener("keydown", onKeydown);
    dialog.removeEventListener("close", onClose);
  };
}
