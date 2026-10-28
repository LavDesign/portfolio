import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Case study bodies only. Name, order, status, description and tags live in src/data/projects.js.
// Each entry's id is its filename, which must match a project slug.
const work = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/work" }),
  schema: z.object({
    // Leave empty until approved; the page shows "—".
    role: z.string().default(""),
    year: z.string().default(""),
    // Optional; shown in the meta row only when set.
    credits: z.string().default(""),
    links: z
      .array(
        z.object({
          label: z.string().min(1),
          // Absolute URL, or an internal path such as "/contact?type=hire".
          href: z.union([z.url(), z.string().regex(/^\/(?!\/)/)]),
        }),
      )
      .default([]),
  }),
});

export const collections = { work };
