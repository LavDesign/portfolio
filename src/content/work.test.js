// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { projects } from "../data/projects.js";

const dir = new URL("./work/", import.meta.url);
const files = readdirSync(dir).filter((file) => file.endsWith(".mdx"));
const slugs = files.map((file) => file.replace(/\.mdx$/, ""));

const SECTIONS = [
  "The problem",
  "My role",
  "Process",
  "Key decisions",
  "Honest result",
  "What's pending",
  "What I learned",
];

describe("work collection", () => {
  it("has one MDX file per project and no extras", () => {
    expect([...slugs].sort()).toEqual(
      projects.map((project) => project.slug).sort(),
    );
  });

  it.each(slugs)("%s has the 7 sections in order", (slug) => {
    const source = readFileSync(new URL(`${slug}.mdx`, dir), "utf8");
    const titles = [
      ...source.matchAll(/<CaseSection[^>]*title="([^"]+)"/g),
    ].map((match) => match[1]);
    expect(titles).toEqual(SECTIONS);
  });
});
