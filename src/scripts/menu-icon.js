/**
 * Experiment (M6c): morphs the menu icon into the close icon and back.
 * The close control lives inside the <dialog>, on top of the button that opened it, so the
 * two icons play one continuous animation:
 * - menu:open  -> the dialog's icon starts as the menu icon and animates to "close";
 *                 the covered opener icons switch to "close" too, out of sight.
 * - menu:closing -> while the menu panel fades out, every icon animates back to "menu" (the
 *                   reverse), so the dialog's icon and the opener's end up in the same state.
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
    setState(dialogIcons(), "menu");
  };

  doc.addEventListener("menu:open", onOpen);
  doc.addEventListener("menu:closing", onClose);

  return () => {
    doc.removeEventListener("menu:open", onOpen);
    doc.removeEventListener("menu:closing", onClose);
  };
}
