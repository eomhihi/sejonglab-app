/**
 * 카카오톡·SNS OG 공유 이미지 (1200×630) 생성
 * 실행: npm run generate:og
 */
import QRCode from "qrcode";
import sharp from "sharp";
import { writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const SITE_URL = "https://sejonglab.com";
const W = 1200;
const H = 630;
const PRIMARY = "#124559";
const SECONDARY = "#598392";
const POLICY = "#002D56";
const SKY = "#0ea5e9";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "public", "images", "og-share.png");

/** 동심원 + QR 영역 (viewBox 300 기준) */
const RING_SIZE = 300;
const QR_PX = 168;

const qrDataUrl = await QRCode.toDataURL(SITE_URL, {
  width: QR_PX,
  margin: 0,
  errorCorrectionLevel: "H",
  color: { dark: POLICY, light: "#ffffff00" },
});

const ringCx = 150;
const ringCy = 150;
const textAiY = 98;
const textPolicyY = 218;
const qrX = ringCx - QR_PX / 2;
const qrY = 118;

const ringBlock = `
  <g transform="translate(${W - 80 - RING_SIZE}, ${(H - RING_SIZE) / 2})">
    <circle cx="${ringCx}" cy="${ringCy}" r="120" fill="none" stroke="url(#bridge-gradient)" stroke-width="8" opacity="0.9"/>
    <circle cx="${ringCx}" cy="${ringCy}" r="100" fill="none" stroke="url(#bridge-gradient-inner)" stroke-width="3" opacity="0.5"/>
    <circle cx="${ringCx}" cy="${ringCy}" r="80" fill="none" stroke="${PRIMARY}" stroke-width="1" opacity="0.25" stroke-dasharray="8 4"/>
    <text x="${ringCx}" y="${textAiY}" text-anchor="middle" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="13" font-weight="700" fill="${PRIMARY}" letter-spacing="0.08em">AI &amp; Data Driven</text>
    <image href="${qrDataUrl}" x="${qrX}" y="${qrY}" width="${QR_PX}" height="${QR_PX}"/>
    <text x="${ringCx}" y="${textPolicyY}" text-anchor="middle" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="22" font-weight="800" fill="${POLICY}">Policy</text>
  </g>
`;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#f0f9ff"/>
      <stop offset="100%" stop-color="#eff6e0"/>
    </linearGradient>
    <linearGradient id="curve-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${PRIMARY}"/>
      <stop offset="50%" stop-color="${SKY}"/>
      <stop offset="100%" stop-color="${SECONDARY}"/>
    </linearGradient>
    <linearGradient id="bridge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${PRIMARY}"/>
      <stop offset="50%" stop-color="${SKY}"/>
      <stop offset="100%" stop-color="${SECONDARY}"/>
    </linearGradient>
    <linearGradient id="bridge-gradient-inner" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${SECONDARY}"/>
      <stop offset="100%" stop-color="${PRIMARY}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <path d="M-80 280 Q 200 200, 420 250 T 900 220 T 1280 260" stroke="url(#curve-gradient-1)" stroke-width="2" fill="none" opacity="0.28"/>
  <path d="M-60 380 Q 280 300, 480 340 T 920 310 T 1320 350" stroke="url(#curve-gradient-1)" stroke-width="1.5" fill="none" opacity="0.18"/>
  <path d="M0 520 Q 220 500, 440 520 T 880 510 T 1200 525" stroke="url(#curve-gradient-1)" stroke-width="2.5" fill="none" opacity="0.1"/>

  <g font-family="Segoe UI, Helvetica Neue, Arial, sans-serif">
    <text x="72" y="248" font-size="64" font-weight="800" fill="${POLICY}" letter-spacing="-0.02em">세종랩</text>
    <line x1="72" y1="272" x2="200" y2="272" stroke="${PRIMARY}" stroke-width="3"/>
    <text x="72" y="318" font-size="28" font-weight="600" fill="${PRIMARY}" letter-spacing="-0.01em">세종정책콘텐츠랩</text>
    <text x="72" y="368" font-size="22" font-weight="500" fill="${SECONDARY}">AI &amp; Data Driven</text>
    <text x="72" y="408" font-size="26" font-weight="800" fill="${POLICY}">Policy</text>
    <text x="72" y="468" font-size="20" font-weight="500" fill="#475569">세종의 미래를 데이터로 설계합니다</text>
  </g>

  ${ringBlock}
</svg>`;

const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
await writeFile(OUT_PATH, pngBuffer);

console.log("Saved:", OUT_PATH, `(${W}x${H})`);
