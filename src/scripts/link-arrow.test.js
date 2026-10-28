import { describe, expect, it } from "vitest";

import { linkArrow } from "./link-arrow.js";

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

  it("points left when going back to a list", () => {
    expect(linkArrow("/work", { back: true })).toBe("←");
  });
});
