import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { initContactSuccess } from "./contact-success.js";

// jsdom does not implement <dialog>.showModal()/close(). This mock covers what the script uses.
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

let success;

beforeEach(() => {
  document.body.innerHTML = `
    <h1 id="contact-title" tabindex="-1">Contact</h1>
    <dialog id="contact-success" aria-labelledby="contact-success-title">
      <svg data-success-lockup aria-hidden="true"><path /><path /><path /></svg>
      <h2 id="contact-success-title">Message sent.</h2>
      <button data-success-close>Close</button>
    </dialog>
  `;
  success = initContactSuccess(dialog(), {
    returnFocus: document.getElementById("contact-title"),
  });
});

afterEach(() => {
  success.destroy();
  document.documentElement.classList.remove("overflow-hidden");
  delete window.matchMedia;
});

const dialog = () => document.getElementById("contact-success");
const closeButton = () => document.querySelector("[data-success-close]");
const isLocked = () =>
  document.documentElement.classList.contains("overflow-hidden");

describe("initContactSuccess", () => {
  it("stays closed until it is opened", () => {
    expect(dialog().open).toBe(false);
    expect(isLocked()).toBe(false);
  });

  it("opens, locks the scroll and focuses the close button", () => {
    success.open();
    expect(dialog().open).toBe(true);
    expect(isLocked()).toBe(true);
    expect(document.activeElement).toBe(closeButton());
  });

  it("closes with the button and returns focus to the title", () => {
    success.open();
    closeButton().click();
    expect(dialog().open).toBe(false);
    expect(isLocked()).toBe(false);
    expect(document.activeElement.id).toBe("contact-title");
  });

  it("closes with Escape", () => {
    success.open();
    dialog().dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(dialog().open).toBe(false);
    expect(document.activeElement.id).toBe("contact-title");
  });

  it("leaves the lockup untouched with reduced motion", () => {
    window.matchMedia = (query) => ({
      matches: query.includes("reduce"),
    });
    success.open();
    document
      .querySelectorAll("[data-success-lockup] path")
      .forEach((path) => expect(path.getAttribute("style")).toBeNull());
  });
});
