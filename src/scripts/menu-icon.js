/**
 * Experiment (M6c): morphs the menu icon into the close icon and back.
 * The close control lives inside the <dialog>, on top of the button that opened it, so the
 * two icons play one continuous animation:
 * - menu:open  -> the dialog's icon starts as the menu icon and animates to "close";
 *                 the covered opener icons switch to "close" too, out of sight.
 * - menu:close -> the dialog is gone; the opener icons animate back to "menu" (the reverse).
 * CSS owns the timing (MenuIcon.astro), so focus and opening are never delayed, and closing
 * mid-animation simply reverses from wherever the transition is.
 * Returns a cleanup function.
 */
export function initMenuIcon(doc = document) {
  const dialogIcons = () => doc.querySelectorAll("#site-menu [data-menu-icon]");
  const openerIcons = () =>
    doc.querySelectorAll("[data-menu-open] [data-menu-icon]");

  const setState = (icons, state) =>
    icons.forEach((icon) => {
      icon.dataset.state = state;
    });

  const onOpen = () => {
    dialogIcons().forEach((icon) => {
      // Render one frame as the menu icon (matching the opener), then transition.
      icon.dataset.state = "menu";
      void icon.offsetWidth;
      icon.dataset.state = "close";
    });
    setState(openerIcons(), "close");
  };

  const onClose = () => {
    setState(openerIcons(), "menu");
    // Hidden with the dialog, so this resets without a visible transition.
    setState(dialogIcons(), "menu");
  };

  doc.addEventListener("menu:open", onOpen);
  doc.addEventListener("menu:close", onClose);

  return () => {
    doc.removeEventListener("menu:open", onOpen);
    doc.removeEventListener("menu:close", onClose);
  };
}
