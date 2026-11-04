import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';
const PUBLIC_DIR = path.resolve('public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Read the SVG content
const svgPath = path.join(PUBLIC_DIR, 'favicon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await chromium.launch({ executablePath: edgePath });
  const page = await browser.newPage();

  console.log('1. Rendering apple-touch-icon.png (180x180)...');
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 180px;
            height: 180px;
            background: linear-gradient(135deg, #0D3B36 0%, #082622 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-radius: 36px;
          }
          .inner-border {
            position: absolute;
            width: 164px;
            height: 164px;
            border: 1px solid rgba(166, 124, 82, 0.4);
            border-radius: 30px;
            pointer-events: none;
          }
          svg {
            width: 140px;
            height: 140px;
          }
        </style>
      </head>
      <body>
        <div class="inner-border"></div>
        ${svgContent}
      </body>
    </html>
  `);
  const appleTouchPath = path.join(PUBLIC_DIR, 'apple-touch-icon.png');
  await page.screenshot({ path: appleTouchPath, omitBackground: false });
  console.log('Saved apple-touch-icon.png to:', appleTouchPath);

  // Copy to artifact dir for report
  fs.copyFileSync(appleTouchPath, path.join(ARTIFACT_DIR, 'stage4_2_apple_touch_icon.png'));

  console.log('2. Rendering high-res icon for favicon.ico generation (256x256)...');
  await page.setViewportSize({ width: 256, height: 256 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 256px;
            height: 256px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: transparent;
          }
          svg {
            width: 256px;
            height: 256px;
          }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
    </html>
  `);
  const tempIcon256Path = path.join(PUBLIC_DIR, 'temp_icon_256.png');
  await page.screenshot({ path: tempIcon256Path, omitBackground: true });

  console.log('3. Rendering og-card-demo.png (1200x630)...');
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 1200px;
            height: 630px;
            background: #0D3B36;
            background: radial-gradient(circle at 85% 15%, #16564e 0%, #0D3B36 50%, #071f1c 100%);
            color: #F8F9FA;
            font-family: 'Inter', sans-serif;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 60px 70px;
          }
          /* Subtle decorative geometric lines */
          .frame-border {
            position: absolute;
            top: 24px;
            left: 24px;
            right: 24px;
            bottom: 24px;
            border: 1px solid rgba(166, 124, 82, 0.35);
            border-radius: 8px;
            pointer-events: none;
          }
          .frame-corner {
            position: absolute;
            width: 16px;
            height: 16px;
            border: 2px solid #A67C52;
          }
          .tl { top: 20px; left: 20px; border-right: none; border-bottom: none; }
          .tr { top: 20px; right: 20px; border-left: none; border-bottom: none; }
          .bl { bottom: 20px; left: 20px; border-right: none; border-top: none; }
          .br { bottom: 20px; right: 20px; border-left: none; border-top: none; }

          /* Header / Tag */
          .header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .brand-badge {
            display: inline-flex;
            align-items: center;
            gap: 12px;
          }
          .brand-logo-small {
            width: 44px;
            height: 44px;
          }
          .brand-name {
            font-family: 'Playfair Display', serif;
            font-size: 22px;
            font-weight: 600;
            letter-spacing: 0.05em;
            color: #F8F9FA;
          }
          .demo-pill {
            background: rgba(166, 124, 82, 0.18);
            border: 1px solid rgba(166, 124, 82, 0.6);
            color: #E2BC82;
            padding: 8px 16px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }

          /* Main Hero in Card */
          .main-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 50px;
            margin: 20px 0;
          }
          .text-column {
            flex: 1;
          }
          .headline {
            font-family: 'Playfair Display', serif;
            font-size: 50px;
            line-height: 1.15;
            font-weight: 700;
            color: #FFFFFF;
            margin-bottom: 18px;
          }
          .headline span {
            color: #E2BC82;
          }
          .subtext {
            font-size: 20px;
            line-height: 1.5;
            color: #C2D1CD;
            max-width: 620px;
          }

          .icon-column {
            width: 220px;
            height: 220px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(8, 38, 34, 0.6);
            border: 1px solid rgba(166, 124, 82, 0.4);
            border-radius: 28px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }
          .icon-column svg {
            width: 170px;
            height: 170px;
          }

          /* Footer / Disclaimer */
          .footer-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-top: 1px solid rgba(166, 124, 82, 0.25);
            padding-top: 18px;
            font-size: 13px;
            color: #92ACA5;
          }
          .legal-notice {
            font-style: italic;
          }
          .env-tag {
            font-weight: 600;
            color: #A67C52;
            letter-spacing: 0.05em;
          }
        </style>
      </head>
      <body>
        <div class="frame-border"></div>
        <div class="frame-corner tl"></div>
        <div class="frame-corner tr"></div>
        <div class="frame-corner bl"></div>
        <div class="frame-corner br"></div>

        <div class="header-row">
          <div class="brand-badge">
            <div class="brand-logo-small">${svgContent}</div>
            <div class="brand-name">BUFETE DE INMIGRACIÓN EN EE. UU.</div>
          </div>
          <div class="demo-pill">[VERSIÓN DEMOSTRATIVA — ENTORNO DE PRUEBAS]</div>
        </div>

        <div class="main-content">
          <div class="text-column">
            <h1 class="headline">Orientación y Servicios Legales de <span>Inmigración</span></h1>
            <p class="subtext">Plataforma técnica demostrativa para consulta preliminar y análisis de vías migratorias hacia Estados Unidos.</p>
          </div>
          <div class="icon-column">
            ${svgContent}
          </div>
        </div>

        <div class="footer-row">
          <span class="legal-notice">Información preliminar informativa no vinculante. No constituye asesoría jurídica formal ni relación abogado-cliente.</span>
          <span class="env-tag">ENTORNO DEMO &bull; NO PUBLICAR</span>
        </div>
      </body>
    </html>
  `);

  // Wait for fonts to load
  await page.evaluateHandle('document.fonts.ready');
  const ogCardPath = path.join(IMAGES_DIR, 'og-card-demo.png');
  await page.screenshot({ path: ogCardPath, omitBackground: false });
  console.log('Saved og-card-demo.png to:', ogCardPath);

  // Copy to artifact dir for report
  fs.copyFileSync(ogCardPath, path.join(ARTIFACT_DIR, 'stage4_2_og_card_demo.png'));

  // Also render SVG visual preview to artifact directory
  await page.setViewportSize({ width: 256, height: 256 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0; background:#1A202C; display:flex; align-items:center; justify-content:center; height:256px;">
        <div style="width:200px; height:200px;">
          ${svgContent}
        </div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage4_2_favicon_svg.png') });

  await browser.close();

  // Convert temp_icon_256.png into multi-size favicon.ico using python PIL
  console.log('4. Converting 256x256 PNG into multi-size favicon.ico via Python PIL...');
  const pythonScript = `
from PIL import Image
import os

src = r"${tempIcon256Path.replace(/\\/g, '/')}"
dst = r"${path.join(PUBLIC_DIR, 'favicon.ico').replace(/\\/g, '/')}"

img = Image.open(src)
# Save as multi-resolution ICO
img.save(dst, format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print(f"favicon.ico generated successfully at {dst} (Size: {os.path.getsize(dst)} bytes)")

if os.path.exists(src):
    os.remove(src)
`;
  fs.writeFileSync('temp_make_ico.py', pythonScript, 'utf8');
  execSync('python temp_make_ico.py', { stdio: 'inherit' });
  fs.unlinkSync('temp_make_ico.py');

  console.log('All 4 assets generated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
