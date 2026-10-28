import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createRailStatus } from "./rail-status.js";

// jsdom has no Web Animations API; this minimal mock records animations per element.
const animations = new WeakMap();
const mockAnimate = function () {
  const animation = {
    finished: new Promise(() => {}),
    cancel: vi.fn(),
  };
  animations.set(this, [...(animations.get(this) ?? []), animation]);
  return animation;
};

let el;

beforeEach(() => {
  document.body.innerHTML = `<p data-rail-status>© 2026</p>`;
  el = document.querySelector("[data-rail-status]");
});

afterEach(() => {
  delete Element.prototype.animate;
  delete Element.prototype.getAnimations;
});

// Text a reader would get: outgoing digits are aria-hidden.
const visibleText = () => {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
  return clone.textContent;
};

describe("rail status", () => {
  it("shows the chapter in ink and restores the default text", () => {
    const rail = createRailStatus(el, 4);
    rail.set(0);
    expect(el.textContent).toBe("CH.1 / 4");
    expect(el.hasAttribute("data-active")).toBe(true);

    rail.set(null);
    expect(el.textContent).toBe("© 2026");
    expect(el.hasAttribute("data-active")).toBe(false);
  });

  it("swaps instantly when animations aren't available", () => {
    const rail = createRailStatus(el, 4);
    rail.set(0);
    rail.set(2);
    expect(el.textContent).toBe("CH.3 / 4");
  });

  it("rolls only the digit and settles fast changes on the right chapter", () => {
    Element.prototype.animate = mockAnimate;
    Element.prototype.getAnimations = function () {
      return animations.get(this) ?? [];
    };
    const rail = createRailStatus(el, 4);
    rail.set(0);
    rail.set(1);
    rail.set(2);
    rail.set(3);

    const slot = el.querySelector("span");
    // At most the outgoing digit and the incoming one: no stacked rolls.
    expect(slot.children.length).toBe(2);
    expect(slot.lastElementChild.textContent).toBe("4");
    expect(visibleText()).toBe("CH.4 / 4");
    // "CH." and "/ 4" stay as plain text around the rolling slot.
    expect(el.firstChild.textContent).toBe("CH.");
    expect(el.lastChild.textContent).toBe(" / 4");
  });

  it("ignores repeated values", () => {
    Element.prototype.animate = vi.fn(mockAnimate);
    Element.prototype.getAnimations = () => [];
    const rail = createRailStatus(el, 4);
    rail.set(1);
    rail.set(1);
    expect(Element.prototype.animate).not.toHaveBeenCalled();
  });
});
