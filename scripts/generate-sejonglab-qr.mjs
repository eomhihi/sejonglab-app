/**
 * 세종랩 사이트 QR 코드 이미지 생성
 * 실행: npm run generate:qr
 */
import QRCode from "qrcode";
import { writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const SITE_URL = "https://sejonglab.com"; // src/lib/sejonglab-url.ts 와 동일 URL 유지
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "images");

const options = {
  width: 512,
  margin: 2,
  color: { dark: "#124559", light: "#ffffff" },
};

const pngPath = join(OUT_DIR, "sejonglab-qr.png");
const svgPath = join(OUT_DIR, "sejonglab-qr.svg");

await QRCode.toFile(pngPath, SITE_URL, options);
const svg = await QRCode.toString(SITE_URL, { ...options, type: "svg" });
await writeFile(svgPath, svg, "utf8");

console.log("Saved:", pngPath);
console.log("Saved:", svgPath);
