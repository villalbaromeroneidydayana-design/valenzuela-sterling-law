import { chromium } from 'playwright';
import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const teamDir = path.resolve('public/images/team');

const attorneysConfig = [
  {
    filename: 'attorney_demo_1',
    roleTag: 'LITIGIO FEDERAL & DEPORTACIÓN',
    roleCode: 'Socio Fundador [DEMO]',
    initials: 'RV',
    accentGrad: 'linear-gradient(135deg, #A67C52 0%, #C59A45 100%)',
    silhouetteType: 'male_director'
  },
  {
    filename: 'attorney_demo_2',
    roleTag: 'VISAS CORPORATIVAS & INVERSIÓN',
    roleCode: 'Socia Principal [DEMO]',
    initials: 'ES',
    accentGrad: 'linear-gradient(135deg, #C59A45 0%, #D4AF37 100%)',
    silhouetteType: 'female_managing'
  },
  {
    filename: 'attorney_demo_3',
    roleTag: 'ASILO POLÍTICO & DERECHOS HUMANOS',
    roleCode: 'Abogado Senior [DEMO]',
    initials: 'CM',
    accentGrad: 'linear-gradient(135deg, #8E6539 0%, #A67C52 100%)',
    silhouetteType: 'male_senior'
  },
  {
    filename: 'attorney_demo_4',
    roleTag: 'PETICIONES FAMILIARES & VAWA',
    roleCode: 'Directora de Departamento [DEMO]',
    initials: 'SA',
    accentGrad: 'linear-gradient(135deg, #A67C52 0%, #E2BC82 100%)',
    silhouetteType: 'female_director'
  }
];

function getSilhouetteSvg(type) {
  if (type.startsWith('female')) {
    return `
      <!-- Stylized Female Professional Silhouette -->
      <path d="M200 480 C180 430, 210 390, 240 375 C240 360, 230 330, 230 300 C220 280, 220 220, 240 190 C260 160, 310 160, 330 190 C350 220, 350 280, 340 300 C340 330, 330 360, 330 375 C360 390, 390 430, 370 480 Z" fill="#09221E" opacity="0.95"/>
      <path d="M250 210 C250 170, 320 170, 320 210 C320 250, 300 270, 285 270 C270 270, 250 250, 250 210 Z" fill="#A67C52" opacity="0.35"/>
      <!-- Executive Collar / Blazer -->
      <path d="M220 480 L260 380 L285 430 L310 380 L350 480 Z" fill="#0D3B36" stroke="#A67C52" stroke-width="2"/>
      <line x1="285" y1="430" x2="285" y2="480" stroke="#C59A45" stroke-width="2"/>
    `;
  } else {
    return `
      <!-- Stylized Male Professional Silhouette -->
      <path d="M180 480 C170 410, 210 380, 240 360 C240 340, 245 320, 245 290 C235 270, 235 210, 255 180 C275 155, 315 155, 335 180 C355 210, 355 270, 345 290 C345 320, 350 340, 350 360 C380 380, 420 410, 410 480 Z" fill="#09221E" opacity="0.95"/>
      <path d="M255 190 C255 160, 325 160, 325 190 C325 240, 310 260, 290 260 C270 260, 255 240, 255 190 Z" fill="#A67C52" opacity="0.35"/>
      <!-- Suit Lapels and Tie -->
      <path d="M220 480 L265 365 L290 410 L315 365 L360 480 Z" fill="#0D3B36" stroke="#A67C52" stroke-width="2"/>
      <polygon points="285,385 295,385 293,450 290,460 287,450" fill="#C59A45" stroke="#A67C52" stroke-width="1"/>
    `;
  }
}

async function main() {
  console.log('Iniciando renderizado de las 4 imágenes ilustrativas de abogados...');
  const browser = await chromium.launch({ executablePath: edgePath });
  const page = await browser.newPage({ viewport: { width: 800, height: 1000 } });

  for (const cfg of attorneysConfig) {
    console.log(`Renderizando ${cfg.filename}...`);
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 800px;
            height: 1000px;
            background: radial-gradient(circle at 50% 30%, #124842 0%, #0D3B36 50%, #061c19 100%);
            color: #F8F9FA;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 50px;
          }
          .border-frame {
            position: absolute;
            inset: 20px;
            border: 1px solid rgba(166, 124, 82, 0.4);
            border-radius: 12px;
            pointer-events: none;
          }
          .corner {
            position: absolute;
            width: 16px;
            height: 16px;
            border: 2px solid #A67C52;
          }
          .c-tl { top: 16px; left: 16px; border-right: none; border-bottom: none; }
          .c-tr { top: 16px; right: 16px; border-left: none; border-bottom: none; }
          .c-bl { bottom: 16px; left: 16px; border-right: none; border-top: none; }
          .c-br { bottom: 16px; right: 16px; border-left: none; border-top: none; }

          /* Header tag */
          .header-badge {
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 10;
          }
          .firm-tag {
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.15em;
            color: #A67C52;
            text-transform: uppercase;
          }
          .demo-pill {
            background: rgba(166, 124, 82, 0.2);
            border: 1px solid #A67C52;
            color: #F3E5AB;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            padding: 6px 14px;
            border-radius: 9999px;
            text-transform: uppercase;
          }

          /* Center graphic */
          .center-visual {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
          }
          .silhouette-box {
            width: 580px;
            height: 600px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .silhouette-box svg {
            width: 100%;
            height: 100%;
          }

          /* Initials stamp */
          .initials-stamp {
            position: absolute;
            top: 260px;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(8, 38, 34, 0.85);
            border: 2px solid #A67C52;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 800;
            color: #E2BC82;
            letter-spacing: 0.05em;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          }

          /* Bottom banner */
          .bottom-card {
            background: rgba(8, 38, 34, 0.88);
            border: 1px solid rgba(166, 124, 82, 0.5);
            border-radius: 12px;
            padding: 24px 30px;
            backdrop-filter: blur(8px);
            z-index: 10;
            text-align: center;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
          }
          .role-tag {
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.12em;
            color: #E2BC82;
            text-transform: uppercase;
            margin-bottom: 6px;
          }
          .role-code {
            font-size: 24px;
            font-weight: 700;
            color: #FFFFFF;
            margin-bottom: 10px;
          }
          .watermark-text {
            font-size: 12px;
            color: #92ACA5;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            border-top: 1px solid rgba(166, 124, 82, 0.25);
            padding-top: 10px;
            margin-top: 8px;
          }
          .watermark-strong {
            color: #C59A45;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="border-frame"></div>
        <div class="corner c-tl"></div>
        <div class="corner c-tr"></div>
        <div class="corner c-bl"></div>
        <div class="corner c-br"></div>

        <div class="header-badge">
          <div class="firm-tag">BUFETE INMIGRACIÓN EE. UU.</div>
          <div class="demo-pill">RECURSO DEMO</div>
        </div>

        <div class="center-visual">
          <div class="silhouette-box">
            <svg viewBox="0 0 580 500">
              <defs>
                <radialGradient id="haloGrad" cx="50%" cy="40%" r="50%">
                  <stop offset="0%" stop-color="#195C54" stop-opacity="0.6"/>
                  <stop offset="100%" stop-color="#0D3B36" stop-opacity="0"/>
                </radialGradient>
              </defs>
              <circle cx="290" cy="250" r="190" fill="url(#haloGrad)"/>
              <circle cx="290" cy="250" r="188" fill="none" stroke="#A67C52" stroke-width="1" stroke-dasharray="4,4" opacity="0.4"/>
              ${getSilhouetteSvg(cfg.silhouetteType)}
            </svg>
            <div class="initials-stamp">${cfg.initials}</div>
          </div>
        </div>

        <div class="bottom-card">
          <div class="role-tag">${cfg.roleTag}</div>
          <div class="role-code">${cfg.roleCode}</div>
          <div class="watermark-text">
            <span class="watermark-strong">IMAGEN ILUSTRATIVA DEMO</span> &bull; NO CORRESPONDE A PERSONAL REAL DEL BUFETE
          </div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(html);
    const tempPng = path.join(teamDir, `${cfg.filename}.png`);
    await page.screenshot({ path: tempPng });

    // Convert to optimized WebP using Python Pillow
    const webpPath = path.join(teamDir, `${cfg.filename}.webp`);
    const pyScript = `
from PIL import Image
import os

png_path = r"${tempPng.replace(/\\/g, '/')}"
webp_path = r"${webpPath.replace(/\\/g, '/')}"

im = Image.open(png_path)
im.save(webp_path, 'WEBP', quality=85, method=6)
print(f"Generado {webp_path}: {os.path.getsize(webp_path)} bytes")

if os.path.exists(png_path):
    os.remove(png_path)
`;
    fs.writeFileSync('temp_convert_webp.py', pyScript, 'utf8');
    execSync('python temp_convert_webp.py', { stdio: 'inherit' });
    fs.unlinkSync('temp_convert_webp.py');

    // Also copy to artifacts dir for review
    fs.copyFileSync(webpPath, path.join(ARTIFACT_DIR, `${cfg.filename}.webp`));
  }

  await browser.close();
  console.log('Las 4 imágenes WebP han sido generadas e instaladas con éxito.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

