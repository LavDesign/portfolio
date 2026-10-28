// Turns a PNG capture of any width (a 1440 browser capture, a 2x or 4x Figma export...)
// into the WebP versions the site uses: src/assets/captures/<name>-full-<width>.webp.
// Widths default to 1440 and 960; pass others as a comma list (mobile screens: 480,320).
// Images are only ever reduced: a width wider than the source becomes the source's own width.
// Run with: node scripts/process-captures.mjs <path/to/capture.png> <name> [widths]
// The source PNG is only read; keep it outside the repo.
import { mkdirSync, statSync } from "node:fs";
import sharp from "sharp";

const DEFAULT_WIDTHS = "1440,960";
const QUALITY = 80;

const [source, name, widthList = DEFAULT_WIDTHS] = process.argv.slice(2);
const requested = widthList.split(",").map(Number);
if (
  !source ||
  !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name ?? "") ||
  !requested.every((width) => Number.isInteger(width) && width > 0)
) {
  console.error(
    "Usage: node scripts/process-captures.mjs <capture.png> <name> [width,width...]",
  );
  process.exit(1);
}

const outDir = new URL("../src/assets/captures/", import.meta.url);
mkdirSync(outDir, { recursive: true });

const { width: sourceWidth, height: sourceHeight } =
  await sharp(source).metadata();
console.log(`${source}: ${sourceWidth}x${sourceHeight}`);

const widths = [
  ...new Set(requested.map((width) => Math.min(width, sourceWidth))),
];
for (const width of requested.filter((width) => width > sourceWidth)) {
  console.warn(
    `${width}w is wider than the source: kept at ${sourceWidth}w instead.`,
  );
}

for (const width of widths) {
  const output = new URL(`${name}-full-${width}.webp`, outDir);
  const info = await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(output.pathname);
  const kb = (statSync(output).size / 1024).toFixed(1);
  console.log(
    `src/assets/captures/${name}-full-${width}.webp: ${info.width}x${info.height}, ${kb} KB`,
  );
}
