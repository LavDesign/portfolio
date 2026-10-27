// Generates public/og.png (1200x630): the dark lockup centered on the site background.
// Run with: node scripts/generate-og.mjs
import { readFileSync } from "node:fs";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
const BACKGROUND = "#121212";
// The lockup spans about 60% of the image width.
const LOCKUP_WIDTH = Math.round(WIDTH * 0.6);

const source = new URL(
  "../src/assets/brand/lav-lockup-dark.svg",
  import.meta.url,
);
const output = new URL("../public/og.png", import.meta.url);

const svg = readFileSync(source);
const { width: svgWidth } = await sharp(svg).metadata();

// Render the vector at 2x the target size, then downscale for clean edges.
const lockup = await sharp(svg, { density: (72 * LOCKUP_WIDTH * 2) / svgWidth })
  .resize({ width: LOCKUP_WIDTH })
  .png()
  .toBuffer();

const info = await sharp({
  create: { width: WIDTH, height: HEIGHT, channels: 4, background: BACKGROUND },
})
  .composite([{ input: lockup, gravity: "center" }])
  .png()
  .toFile(output.pathname);

console.log(`public/og.png: ${info.width}x${info.height}, ${info.size} bytes`);
