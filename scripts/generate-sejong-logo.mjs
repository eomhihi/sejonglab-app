/**
 * SEJONG LAB 로고 lockup PNG 생성
 * 실행: npm run dev (별도 터미널) → npm run generate:logo
 */
import puppeteer from "puppeteer-core";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "brand");
const BASE_URL = process.env.LOGO_EXPORT_URL ?? "http://localhost:3003";
const EXPORT_PATH = "/brand/logo-export";

const EXPORTS = [
  { id: "logo-topbar", file: "sejong-logo-dark-text.png", omitBackground: false },
  { id: "logo-footer", file: "sejong-logo-light-text.png", omitBackground: false },
  { id: "logo-topbar-transparent", file: "sejong-logo-dark-text-transparent.png", omitBackground: true },
  { id: "logo-footer-transparent", file: "sejong-logo-light-text-transparent.png", omitBackground: true },
];

const BROWSER_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

function resolveBrowserPath() {
  for (const candidate of BROWSER_CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(
    "Chrome/Edge not found. Set PUPPETEER_EXECUTABLE_PATH to your browser executable.",
  );
}

async function waitForServer(url, attempts = 30) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) return;
    } catch {
      // dev server not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Dev server not reachable at ${url}. Run "npm run dev" first.`);
}

await mkdir(OUT_DIR, { recursive: true });
await waitForServer(`${BASE_URL}${EXPORT_PATH}`);

const browser = await puppeteer.launch({
  headless: true,
  executablePath: resolveBrowserPath(),
});
const page = await browser.newPage();
await page.setViewport({ width: 2400, height: 1600, deviceScaleFactor: 1 });

await page.goto(`${BASE_URL}${EXPORT_PATH}`, { waitUntil: "networkidle0", timeout: 60000 });
await page.waitForSelector('[data-logo-ready="true"]', { timeout: 60000 });
await page.waitForFunction(
  () => document.querySelectorAll('[data-lockup-ready="true"]').length === 4,
  { timeout: 60000 },
);
await new Promise((r) => setTimeout(r, 500));

for (const item of EXPORTS) {
  const el = await page.$(`#${item.id}`);
  if (!el) {
    console.warn("Missing element:", item.id);
    continue;
  }

  const outPath = join(OUT_DIR, item.file);
  await el.screenshot({
    path: outPath,
    omitBackground: item.omitBackground,
    type: "png",
  });
  console.log("Saved:", outPath);
}

await browser.close();
console.log("\nDone. Files in public/brand/");
