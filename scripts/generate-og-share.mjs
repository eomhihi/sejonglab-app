/**
 * 카카오톡·SNS OG 공유 이미지 (1200×630) — 디자인 원본 리사이즈
 * 실행: npm run generate:og
 */
import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const W = 1200;
const H = 630;

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(__dirname, "..", "public", "images", "og-share-source.png");
const OUT = join(__dirname, "..", "public", "images", "og-share.png");

await sharp(SOURCE)
  .resize(W, H, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .png()
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log("Saved:", OUT, `(${meta.width}x${meta.height})`);
