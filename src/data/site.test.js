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
  const schema = personSchema("https://example.com/");

  it("names the person and links the site, LinkedIn and GitHub", () => {
    expect(schema).toMatchObject({
      "@type": "Person",
      name: owner.name,
      alternateName: "LAV Design",
      jobTitle: "Digital Experience Builder",
      url: "https://example.com/",
    });
    const hrefs = social
      .filter((link) => link.label !== "Email")
      .map((link) => link.href);
    expect(schema.sameAs).toEqual(hrefs);
  });

  it("has no contact or location data", () => {
    for (const key of ["address", "telephone", "email", "homeLocation"]) {
      expect(schema).not.toHaveProperty(key);
    }
  });
});
