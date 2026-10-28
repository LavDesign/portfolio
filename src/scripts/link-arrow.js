/**
 * The arrow a text link carries, from its href: "↓" for an anchor on the same page, "↗" for
 * an external site, "→" for another page, and "←" when `back` returns to a list.
 * Header, menu overlay and social links are fixed navigation and carry no arrow.
 */
export function linkArrow(href, { back = false } = {}) {
  if (back) return "←";
  if (href.startsWith("#")) return "↓";
  if (isExternal(href)) return "↗";
  return "→";
}

/** True for links that leave the site (another origin or mailto:). */
export function isExternal(href) {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
}
