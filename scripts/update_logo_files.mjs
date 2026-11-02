import fs from "fs";
import path from "path";
import sharp from "sharp";

const srcFile = "C:/Users/eomhi/.gemini/antigravity-ide/brain/971ab520-ef5f-4f0a-87eb-2f4ad7d9460a/.user_uploaded/media_1791333727424.png";
const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, "public");
const brandDir = path.join(publicDir, "brand");

if (!fs.existsSync(brandDir)) {
  fs.mkdirSync(brandDir, { recursive: true });
}

// 1. Copy raw file
fs.copyFileSync(srcFile, path.join(publicDir, "sejong-lab-logo.png"));
fs.copyFileSync(srcFile, path.join(brandDir, "sejong-logo-dark-text.png"));
fs.copyFileSync(srcFile, path.join(brandDir, "sejong-logo-light-text.png"));

// 2. Generate SVG wrapper
const pngBuf = fs.readFileSync(srcFile);
const base64Png = pngBuf.toString("base64");
const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="531" height="168" viewBox="0 0 531 168">
  <image width="531" height="168" href="data:image/png;base64,${base64Png}"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, "sejong-lab-logo.svg"), svgContent, "utf8");

// 3. Generate Transparent & Light variants
async function processVariants() {
  const image = sharp(srcFile);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  // Dark text transparent (white background removed)
  const darkTransparentData = Buffer.from(data);
  for (let i = 0; i < darkTransparentData.length; i += 4) {
    const r = darkTransparentData[i];
    const g = darkTransparentData[i + 1];
    const b = darkTransparentData[i + 2];
    if (r > 240 && g > 240 && b > 240) {
      darkTransparentData[i + 3] = 0;
    }
  }

  await sharp(darkTransparentData, {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .png()
    .toFile(path.join(brandDir, "sejong-logo-dark-text-transparent.png"));

  // Light text transparent (dark text -> white, for dark header/footer)
  const lightTransparentData = Buffer.from(darkTransparentData);
  for (let i = 0; i < lightTransparentData.length; i += 4) {
    if (lightTransparentData[i + 3] > 0) {
      const r = lightTransparentData[i];
      const g = lightTransparentData[i + 1];
      const b = lightTransparentData[i + 2];
      // Main dark navy letters (SEJONG LAB)
      if (r < 60 && g < 60 && b < 60) {
        lightTransparentData[i] = 255;
        lightTransparentData[i + 1] = 255;
        lightTransparentData[i + 2] = 255;
      }
      // Subtext (Research Data)
      else if (r > 150 && g > 150 && b > 150) {
        lightTransparentData[i] = 220;
        lightTransparentData[i + 1] = 220;
        lightTransparentData[i + 2] = 220;
      }
    }
  }

  await sharp(lightTransparentData, {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .png()
    .toFile(path.join(brandDir, "sejong-logo-light-text-transparent.png"));

  console.log("All logo assets updated successfully!");
}

processVariants();
