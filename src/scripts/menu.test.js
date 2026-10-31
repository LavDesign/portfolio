import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

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
      <button id="close-icon" data-menu-close aria-label="Close menu">—</button>
      <button id="close-text" data-menu-close>CLOSE</button>
      <div data-menu-panel>
        <a href="/" data-menu-link>Home</a>
        <a href="/work" data-menu-link>Work</a>
        <a href="https://www.linkedin.com/" id="external">LinkedIn</a>
      </div>
    </dialog>
  `;
  cleanup = initMenu();
});

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("overflow-hidden");
  delete window.HTMLElement.prototype.animate;
  delete window.matchMedia;
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
    document.getElementById("close-text").click();

    expect(dialog().open).toBe(false);
    expect(topbar.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(topbar);
  });

  it("closes with the icon button in the opener's spot", () => {
    const rail = document.getElementById("rail");
    rail.click();
    document.getElementById("close-icon").click();

    expect(dialog().open).toBe(false);
    expect(rail.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(rail);
  });

  it("marks a tap or click open so the focus ring stays hidden", () => {
    const rail = document.getElementById("rail");
    rail.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));

    expect(dialog().hasAttribute("data-pointer-open")).toBe(true);
    expect(document.activeElement).toBe(document.querySelector('[href="/"]'));

    dialog().dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
    );
    expect(dialog().hasAttribute("data-pointer-open")).toBe(false);
  });

  it("keeps the focus ring when the keyboard opens the menu", () => {
    const rail = document.getElementById("rail");
    rail.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 0 }));

    expect(dialog().hasAttribute("data-pointer-open")).toBe(false);
    expect(document.activeElement).toBe(document.querySelector('[href="/"]'));
  });

  it("dispatches menu:open and menu:close on the document", () => {
    const events = [];
    const record = (event) => events.push(event.type);
    document.addEventListener("menu:open", record);
    document.addEventListener("menu:close", record);

    document.getElementById("rail").click();
    pressEscape();

    document.removeEventListener("menu:open", record);
    document.removeEventListener("menu:close", record);
    expect(events).toEqual(["menu:open", "menu:close"]);
  });
});

// jsdom has no Web Animations: each animate() call returns an animation whose end the test
// triggers with finishAnimation().
const animations = [];
const mockAnimations = () => {
  animations.length = 0;
  window.HTMLElement.prototype.animate = vi.fn(function (keyframes, options) {
    let resolve;
    const animation = {
      keyframes,
      options,
      finished: new Promise((done) => (resolve = done)),
      cancel: vi.fn(),
      finish: () => resolve(animation),
    };
    animations.push(animation);
    return animation;
  });
};
const finishAnimation = async () => {
  animations.at(-1).finish();
  await Promise.resolve();
  await Promise.resolve();
};
const reduceMotion = () => {
  window.matchMedia = (query) => ({
    matches: query === "(prefers-reduced-motion: reduce)",
  });
};
// Returns whether the menu prevented the click. The document then prevents it anyway, so
// jsdom never attempts a real navigation.
const click = (el, init = {}) => {
  let prevented = false;
  const settle = (event) => {
    prevented = event.defaultPrevented;
    event.preventDefault();
  };
  document.addEventListener("click", settle, { once: true });
  el.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
      ...init,
    }),
  );
  return prevented;
};

describe("menu motion", () => {
  beforeEach(() => {
    mockAnimations();
    document.getElementById("rail").click();
  });

  it("fades the panel in when it opens", () => {
    const [opening] = animations;
    expect(opening.keyframes.map((frame) => frame.opacity)).toEqual([0, 1]);
    expect(opening.options).toMatchObject({
      duration: 280,
      easing: "ease-out",
    });
  });

  it("lets an internal link navigate right away, with the menu still open", () => {
    // Not prevented: the browser navigates and the view transition fades the menu out.
    expect(click(document.querySelector('[href="/work"]'))).toBe(false);
    expect(dialog().open).toBe(true);
    expect(animations).toHaveLength(1);
  });

  it("only closes, with its animation, when the link is the current page", async () => {
    expect(click(document.querySelector('[href="/"]'))).toBe(true);
    expect(animations.at(-1).keyframes.at(-1).opacity).toBe(0);
    expect(dialog().open).toBe(true);

    await finishAnimation();
    expect(dialog().open).toBe(false);
  });

  it("closes when the page comes back from the back/forward cache", () => {
    window.dispatchEvent(
      new PageTransitionEvent("pageshow", { persisted: true }),
    );
    expect(dialog().open).toBe(false);
  });

  it("leaves no menu link focused when the page comes back from the cache", () => {
    dialog().close();
    const work = document.querySelector('[href="/work"]');
    work.focus();
    window.dispatchEvent(
      new PageTransitionEvent("pageshow", { persisted: true }),
    );
    expect(document.activeElement).not.toBe(work);
  });

  it("leaves modified clicks and external links to the browser", () => {
    const work = document.querySelector('[href="/work"]');
    for (const init of [
      { metaKey: true },
      { ctrlKey: true },
      { shiftKey: true },
      { button: 1 },
    ]) {
      expect(click(work, init)).toBe(false);
    }
    expect(click(document.getElementById("external"))).toBe(false);
    expect(dialog().open).toBe(true);
    expect(animations).toHaveLength(1);
  });

  it("animates Escape before closing the dialog", async () => {
    const cancel = new Event("cancel", { cancelable: true });
    dialog().dispatchEvent(cancel);

    expect(cancel.defaultPrevented).toBe(true);
    expect(animations.at(-1).keyframes.at(-1).opacity).toBe(0);
    expect(dialog().open).toBe(true);
    expect(document.documentElement.classList.contains("overflow-hidden")).toBe(
      true,
    );

    await finishAnimation();
    expect(dialog().open).toBe(false);
    expect(document.documentElement.classList.contains("overflow-hidden")).toBe(
      false,
    );
    expect(document.activeElement).toBe(document.getElementById("rail"));
  });

  it("reverses from where the panel is when reopened mid-close", async () => {
    pressEscape();
    const closing = animations.at(-1);
    document.getElementById("rail").click();

    expect(closing.cancel).toHaveBeenCalled();
    expect(animations.at(-1).keyframes.at(-1).opacity).toBe(1);
    // The stale closing animation must not close the reopened menu.
    closing.finish();
    await Promise.resolve();
    expect(dialog().open).toBe(true);
  });
});

describe("menu with reduced motion", () => {
  beforeEach(() => {
    mockAnimations();
    reduceMotion();
    document.getElementById("rail").click();
  });

  it("opens and closes without animating", () => {
    expect(dialog().open).toBe(true);
    pressEscape();

    expect(animations).toHaveLength(0);
    expect(dialog().open).toBe(false);
  });

  it("closes at once when the link is the current page", () => {
    expect(click(document.querySelector('[href="/"]'))).toBe(true);
    expect(animations).toHaveLength(0);
    expect(dialog().open).toBe(false);
  });
});
