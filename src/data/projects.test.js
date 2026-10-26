import { describe, expect, it } from "vitest";

import { PROJECT_STATUSES, projects } from "./projects.js";

describe("projects", () => {
  it("has at least one project", () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it.each(projects.map((project) => [project.slug, project]))(
    "%s has every required field",
    (_slug, project) => {
      for (const field of ["slug", "name", "statusLabel", "description"]) {
        expect(typeof project[field]).toBe("string");
        expect(project[field].trim()).not.toBe("");
      }
      expect(project.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(project.caseUrl).toBe(`/work/${project.slug}`);
      expect(PROJECT_STATUSES).toContain(project.status);
      expect(Array.isArray(project.tags)).toBe(true);
      expect(project.tags.length).toBeGreaterThan(0);
      expect("image" in project).toBe(true);
    },
  );

  it("uses unique slugs", () => {
    const slugs = projects.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
