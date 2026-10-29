import { describe, expect, it } from "vitest";

import { isExternal, linkArrow, opensInNewTab } from "./link-arrow.js";

describe("link arrow", () => {
  it("points down for an anchor on the same page", () => {
    expect(linkArrow("#work")).toBe("↓");
  });

  it("points out for external links", () => {
    expect(linkArrow("https://github.com/LavDesign")).toBe("↗");
    expect(linkArrow("//example.com")).toBe("↗");
    expect(linkArrow("mailto:hello@example.com")).toBe("↗");
  });

  it("points right for another page of the site", () => {
    expect(linkArrow("/work/vetegram")).toBe("→");
    expect(linkArrow("/contact?type=hire")).toBe("→");
  });

  it("tells external links from internal ones", () => {
    expect(isExternal("https://www.figma.com/proto/abc")).toBe(true);
    expect(isExternal("/contact?type=hire")).toBe(false);
    expect(isExternal("#work")).toBe(false);
  });

  it("opens other sites in a new tab, but not mailto or internal links", () => {
    expect(opensInNewTab("https://github.com/LavDesign")).toBe(true);
    expect(opensInNewTab("mailto:lavdesign.luis@gmail.com")).toBe(false);
    expect(opensInNewTab("/contact")).toBe(false);
  });

  it("points left when going back to a list", () => {
    expect(linkArrow("/work", { back: true })).toBe("←");
  });
});
