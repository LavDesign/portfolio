// robots.txt is generated so the sitemap URL comes from `site` in astro.config.mjs.
export function GET({ site }) {
  const sitemap = new URL("/sitemap-index.xml", site);
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
