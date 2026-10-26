import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { initMenu } from "./menu.js";

// jsdom does not implement <dialog>.showModal()/close(). This mock covers what menu.js relies on.
beforeAll(() => {
  const proto = window.HTMLDialogElement.prototype;
  if (typeof proto.showModal !== "function") {
    proto.showModal = function () {
      this.setAttribute("open", "");
    };
  }
  if (typeof proto.close !== "function") {
    proto.close = function () {
      if (!this.hasAttribute("open")) return;
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
});

let cleanup;

beforeEach(() => {
  document.body.innerHTML = `
    <button id="rail" data-menu-open aria-expanded="false" aria-controls="site-menu">Menu</button>
    <button id="topbar" data-menu-open aria-expanded="false" aria-controls="site-menu">Menu</button>
    <dialog id="site-menu">
      <button data-menu-close>CLOSE</button>
      <a href="/" data-menu-link>Home</a>
      <a href="/work" data-menu-link>Work</a>
    </dialog>
  `;
  cleanup = initMenu();
});

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("overflow-hidden");
});

const dialog = () => document.getElementById("site-menu");
const pressEscape = () =>
  dialog().dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );

describe("menu", () => {
  it("opens, expands the triggers, locks scroll and focuses the first link", () => {
    const rail = document.getElementById("rail");
    rail.click();

    expect(dialog().open).toBe(true);
    expect(rail.getAttribute("aria-expanded")).toBe("true");
    expect(
      document.getElementById("topbar").getAttribute("aria-expanded"),
    ).toBe("true");
    expect(document.documentElement.classList.contains("overflow-hidden")).toBe(
      true,
    );
    expect(document.activeElement).toBe(document.querySelector('[href="/"]'));
  });

  it("closes with Escape and returns focus to the trigger", () => {
    const rail = document.getElementById("rail");
    rail.focus();
    rail.click();
    pressEscape();

    expect(dialog().open).toBe(false);
    expect(rail.getAttribute("aria-expanded")).toBe("false");
    expect(document.documentElement.classList.contains("overflow-hidden")).toBe(
      false,
    );
    expect(document.activeElement).toBe(rail);
  });

  it("closes with CLOSE and returns focus to the trigger that opened it", () => {
    const topbar = document.getElementById("topbar");
    topbar.click();
    document.querySelector("[data-menu-close]").click();

    expect(dialog().open).toBe(false);
    expect(topbar.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(topbar);
  });
});
