import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { scrollToWork } = vi.hoisted(() => ({ scrollToWork: vi.fn() }));
vi.mock("./chapters.js", () => ({ scrollToWork }));

import { initScrollHint } from "./scroll-hint.js";

let link;
let target;

const setReducedMotion = (reduce) => {
  window.matchMedia = (query) => ({
    matches: reduce && query === "(prefers-reduced-motion: reduce)",
  });
};

beforeEach(() => {
  document.body.innerHTML = `
    <a href="#work" data-scroll-hint>Scroll to see selected work</a>
    <section id="work"></section>`;
  link = document.querySelector("[data-scroll-hint]");
  target = document.querySelector("#work");
  target.scrollIntoView = vi.fn();
  scrollToWork.mockReset();
  setReducedMotion(false);
  initScrollHint();
});

afterEach(() => {
  delete window.matchMedia;
  vi.useRealTimers();
});

describe("scroll hint", () => {
  it("glides with Lenis when it's running and focuses Ch.1 when it lands", () => {
    scrollToWork.mockImplementation((onComplete) => {
      onComplete();
      return true;
    });
    link.click();

    expect(target.scrollIntoView).not.toHaveBeenCalled();
    expect(target.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(target);
  });

  it("falls back to native smooth scrolling and focuses on scrollend", () => {
    scrollToWork.mockReturnValue(false);
    link.click();

    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
    expect(document.activeElement).not.toBe(target);

    window.dispatchEvent(new Event("scrollend"));
    expect(document.activeElement).toBe(target);
  });

  it("still focuses Ch.1 if scrollend never fires", () => {
    vi.useFakeTimers();
    scrollToWork.mockReturnValue(false);
    link.click();

    vi.advanceTimersByTime(1500);
    expect(document.activeElement).toBe(target);
  });

  it("jumps at once with reduced motion", () => {
    setReducedMotion(true);
    link.click();

    expect(scrollToWork).not.toHaveBeenCalled();
    expect(target.scrollIntoView).toHaveBeenCalledWith();
    expect(document.activeElement).toBe(target);
  });
});
