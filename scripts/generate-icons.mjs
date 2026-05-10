#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC_ICONS = join(ROOT, "public", "icons");
const APP_DIR = join(ROOT, "src", "app");

const NAVY = "#15293a";
const CREAM = "#f7f3eb";
const GOLD = "#b08a3e";

function fullBleedSvg(size) {
  const cx = size / 2;
  const w = size * 0.62;
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const stroke = Math.max(8, size * 0.028);
  const yMid = cx;
  const yTop = cx - size * 0.115;
  const yBot = cx + size * 0.115;
  const amp = size * 0.038;
  const path = (y) =>
    `M ${x0} ${y} Q ${x0 + w * 0.25} ${y - amp}, ${cx} ${y} T ${x1} ${y}`;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${NAVY}"/>
  <path d="${path(yTop)}" stroke="${CREAM}" stroke-width="${stroke}" stroke-linecap="round" fill="none" opacity="0.55"/>
  <path d="${path(yMid)}" stroke="${CREAM}" stroke-width="${stroke}" stroke-linecap="round" fill="none"/>
  <path d="${path(yBot)}" stroke="${GOLD}" stroke-width="${stroke}" stroke-linecap="round" fill="none"/>
</svg>`.trim();
}

function maskableSvg(size) {
  const cx = size / 2;
  const innerSize = size * 0.62;
  const w = innerSize * 0.85;
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const stroke = Math.max(6, size * 0.022);
  const amp = size * 0.026;
  const path = (y) =>
    `M ${x0} ${y} Q ${x0 + w * 0.25} ${y - amp}, ${cx} ${y} T ${x1} ${y}`;
  const yMid = cx;
  const yTop = cx - size * 0.075;
  const yBot = cx + size * 0.075;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${NAVY}"/>
  <path d="${path(yTop)}" stroke="${CREAM}" stroke-width="${stroke}" stroke-linecap="round" fill="none" opacity="0.55"/>
  <path d="${path(yMid)}" stroke="${CREAM}" stroke-width="${stroke}" stroke-linecap="round" fill="none"/>
  <path d="${path(yBot)}" stroke="${GOLD}" stroke-width="${stroke}" stroke-linecap="round" fill="none"/>
</svg>`.trim();
}

async function renderPng(svg, size, outPath) {
  const buf = Buffer.from(svg);
  await sharp(buf).resize(size, size).png().toFile(outPath);
  console.log("✓", outPath.replace(ROOT + "/", ""));
}

async function main() {
  await mkdir(PUBLIC_ICONS, { recursive: true });

  await renderPng(fullBleedSvg(192), 192, join(PUBLIC_ICONS, "icon-192.png"));
  await renderPng(fullBleedSvg(512), 512, join(PUBLIC_ICONS, "icon-512.png"));
  await renderPng(
    maskableSvg(512),
    512,
    join(PUBLIC_ICONS, "icon-maskable-512.png"),
  );
  await renderPng(
    fullBleedSvg(180),
    180,
    join(PUBLIC_ICONS, "apple-icon-180.png"),
  );

  await renderPng(fullBleedSvg(32), 32, join(APP_DIR, "icon.png"));
  await renderPng(
    fullBleedSvg(180),
    180,
    join(APP_DIR, "apple-icon.png"),
  );

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
