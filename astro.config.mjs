// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  // The production URL. Canonicals, og:url, og:image, the Person JSON-LD, the sitemap and
  // robots.txt all read it from here (Astro.site).
  site: "https://lavdesign.vercel.app",

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    mdx(),
    // The 404 is noindex, so it stays out of the sitemap.
    sitemap({ filter: (page) => !/\/404\/?$/.test(new URL(page).pathname) }),
  ],

  devToolbar: {
    enabled: false,
  },
});
