import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { initMenuIcon } from "./menu-icon.js";

const icon = (id) =>
  `<span id="${id}" data-menu-icon data-state="menu"></span>`;

let cleanup;

beforeEach(() => {
  document.body.innerHTML = `
    <button data-menu-open>${icon("rail")}</button>
    <button data-menu-open>${icon("topbar")}</button>
    <dialog id="site-menu"><button data-menu-close>${icon("close")}</button></dialog>
  `;
  cleanup = initMenuIcon();
});

afterEach(() => cleanup());

const state = (id) => document.getElementById(id).dataset.state;
const emit = (type) => document.dispatchEvent(new CustomEvent(type));

describe("menu icon", () => {
  it("morphs every icon to the close state when the menu opens", () => {
    emit("menu:open");
    expect([state("close"), state("rail"), state("topbar")]).toEqual([
      "close",
      "close",
      "close",
    ]);
  });

  it("returns every icon to the menu state when the menu closes", () => {
    emit("menu:open");
    emit("menu:closing");
    expect([state("close"), state("rail"), state("topbar")]).toEqual([
      "menu",
      "menu",
      "menu",
    ]);
  });

  it("ends consistent when closed and reopened quickly", () => {
    emit("menu:open");
    emit("menu:closing");
    emit("menu:open");
    expect(state("close")).toBe("close");
    emit("menu:closing");
    expect(state("rail")).toBe("menu");
  });
});
