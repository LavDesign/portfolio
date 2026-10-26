import { describe, expect, it } from "vitest";

import { ai } from "./ai.js";

describe("ai", () => {
  it("has 3 principles, each with a title and text", () => {
    expect(ai.principles).toHaveLength(3);
    for (const principle of ai.principles) {
      expect(principle.title.trim()).not.toBe("");
      expect(principle.text.trim()).not.toBe("");
    }
  });

  it("has an intro and a closing line", () => {
    expect(ai.intro.trim()).not.toBe("");
    expect(ai.closing.trim()).not.toBe("");
  });
});
