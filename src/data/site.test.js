import { describe, expect, it } from "vitest";

import { owner, pageTitle, personSchema, social } from "./site.js";

describe("pageTitle", () => {
  it("builds the Home title", () => {
    expect(pageTitle()).toBe(
      "Luis Aguilar Vargas — Digital Experience Builder | LAV Design",
    );
  });

  it("builds a page title", () => {
    expect(pageTitle("Work")).toBe("Work — Luis Aguilar Vargas | LAV Design");
  });
});

describe("personSchema", () => {
  it("names the person and links LinkedIn and GitHub", () => {
    expect(personSchema).toMatchObject({
      "@type": "Person",
      name: owner.name,
      alternateName: "LAV Design",
      jobTitle: "Digital Experience Builder",
    });
    const hrefs = social
      .filter((link) => link.label !== "Email")
      .map((link) => link.href);
    expect(personSchema.sameAs).toEqual(hrefs);
  });

  it("has no contact or location data", () => {
    for (const key of ["address", "telephone", "email", "homeLocation"]) {
      expect(personSchema).not.toHaveProperty(key);
    }
  });
});
