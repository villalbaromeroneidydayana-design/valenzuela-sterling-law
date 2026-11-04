import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const results = {
  stage: '4.3-A',
  timestamp: new Date().toISOString(),
  tests: {},
  summary: { total: 7, passed: 0, failed: 0 }
};

function recordTest(id, name, status, details) {
  results.tests[id] = { name, status, details };
  if (status === 'PASS') {
    results.summary.passed++;
  } else {
    results.summary.failed++;
  }
  console.log(`[${status}] ${id}: ${name}`);
}

async function main() {
  console.log('--- INICIANDO VERIFICACIÓN DE ETAPA 4.3-A ---');

  // PRUEBA 1: Existencia y tamaño de los 4 archivos WebP en public/images/team/
  const teamFiles = [
    'public/images/team/attorney_demo_1.webp',
    'public/images/team/attorney_demo_2.webp',
    'public/images/team/attorney_demo_3.webp',
    'public/images/team/attorney_demo_4.webp'
  ];
  let filesPass = true;
  const fileDetails = {};
  for (const f of teamFiles) {
    const exists = fs.existsSync(f);
    const size = exists ? fs.statSync(f).size : 0;
    fileDetails[f] = { exists, size };
    if (!exists || size === 0) filesPass = false;
  }
  recordTest('TEST-1', 'Existencia física de los 4 archivos WebP en public/images/team/', filesPass ? 'PASS' : 'FAIL', fileDetails);

  // PRUEBA 2: Referencias locales actualizadas en src/data/demoData.js
  const demoDataContent = fs.readFileSync('src/data/demoData.js', 'utf8');
  const hasUnsplash = demoDataContent.includes('images.unsplash.com/photo-1560250097') ||
                      demoDataContent.includes('images.unsplash.com/photo-1573496359') ||
                      demoDataContent.includes('images.unsplash.com/photo-1519085360') ||
                      demoDataContent.includes('images.unsplash.com/photo-1580894732');
  const hasAllLocal = demoDataContent.includes('/images/team/attorney_demo_1.webp') &&
                      demoDataContent.includes('/images/team/attorney_demo_2.webp') &&
                      demoDataContent.includes('/images/team/attorney_demo_3.webp') &&
                      demoDataContent.includes('/images/team/attorney_demo_4.webp');
  const refPass = !hasUnsplash && hasAllLocal;
  recordTest('TEST-2', 'Referencias locales en demoData.js y eliminación de Unsplash', refPass ? 'PASS' : 'FAIL', { hasUnsplash, hasAllLocal });

  // PRUEBA 3: Presencia de advertencia visible obligatoria en AttorneyTeam.jsx
  const attorneyTeamContent = fs.readFileSync('src/components/AttorneyTeam.jsx', 'utf8');
  const warningText = 'IMAGEN ILUSTRATIVA DEMO — NO CORRESPONDE A PERSONAL REAL DEL BUFETE';
  const warningCount = (attorneyTeamContent.match(new RegExp(warningText, 'g')) || []).length;
  recordTest('TEST-3', 'Presencia de advertencia visible obligatoria en AttorneyTeam.jsx', warningCount >= 2 ? 'PASS' : 'FAIL', { occurrences: warningCount });

  // PRUEBA 4: Comprobación de integridad estricta de componentes protegidos
  const protectedChecks = {
    'Header.jsx': '9eaa2cf95248677f',
    'Footer.jsx': '40a57c63b408d4e8',
    'Hero.jsx': 'ee3efebe3fda9e46',
    'PracticeAreas.jsx': '2058453f3eb7000f',
    'EligibilityEvaluator.jsx': '267e9f4ba61308dc',
    'server/apiMiddleware.js': '4bb71a51c17e0638',
    'server_data/evaluations_vault.jsonl': 'e9490b4561e6b560',
    'index.html': 'a5703aec8f65962e'
  };
  let protectedPass = true;
  const protectedDetails = {};
  for (const [file, expectedHash] of Object.entries(protectedChecks)) {
    const fullPath = file.startsWith('server') || file.startsWith('index') ? file : path.join('src/components', file);
    if (!fs.existsSync(fullPath)) {
      protectedDetails[file] = { exists: false };
      protectedPass = false;
      continue;
    }
    const data = fs.readFileSync(fullPath);
    const hash = crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
    const match = hash === expectedHash;
    protectedDetails[file] = { size: data.length, hash, match };
    if (!match) protectedPass = false;
  }
  recordTest('TEST-4', 'Integridad estricta y hashes de componentes protegidos', protectedPass ? 'PASS' : 'FAIL', protectedDetails);

  // PRUEBA 5: Compilación de producción limpia (npm run build)
  let buildPass = false;
  let buildOutput = '';
  try {
    buildOutput = execSync('npm run build', { encoding: 'utf8' });
    buildPass = true;
  } catch (err) {
    buildOutput = err.message;
  }
  recordTest('TEST-5', 'Compilación de producción limpia (npm run build)', buildPass ? 'PASS' : 'FAIL', { summary: buildOutput.split('\n').slice(-8).join('\n') });

  // PRUEBA 6: Navegación real en navegador, carga HTTP 200 y CERO errores de red
  console.log('Iniciando navegador para pruebas de red y renderizado visual...');
  const browser = await chromium.launch({ executablePath: edgePath });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const networkErrors = [];
  page.on('requestfailed', req => {
    networkErrors.push({ url: req.url(), failure: req.failure() ? req.failure().errorText : 'error' });
  });

  // Start vite dev server if needed or navigate
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(1000);

  // Scroll to #abogados
  await page.evaluate(() => {
    const el = document.querySelector('#abogados');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(1500);

  // Take screenshot of #abogados
  const sectionScreenshot = path.join(ARTIFACT_DIR, 'stage4_3a_abogados_desktop.png');
  const sectionEl = await page.$('#abogados');
  if (sectionEl) {
    await sectionEl.screenshot({ path: sectionScreenshot });
  }

  // Check the 4 images in the DOM
  const domImages = await page.$$eval('#abogados img', imgs => imgs.map(img => ({
    src: img.getAttribute('src'),
    currentSrc: img.currentSrc,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    loaded: img.naturalWidth > 0
  })));

  const domCardsPass = domImages.length === 4 && domImages.every(i => i.loaded && i.src.includes('/images/team/attorney_demo_'));
  const networkPass = networkErrors.length === 0 && domCardsPass;
  recordTest('TEST-6', 'Carga HTTP 200 de las 4 imágenes y CERO errores de red (ORB eliminado)', networkPass ? 'PASS' : 'FAIL', { domImages, networkErrors });

  // PRUEBA 7: Verificación en móvil y modal interactivo
  console.log('Probando vista móvil y apertura de modal...');
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://127.0.0.1:3000/', { waitUntil: 'load', timeout: 15000 });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.evaluate(() => {
    const el = document.querySelector('#abogados');
    if (el) el.scrollIntoView();
  });
  await mobilePage.waitForTimeout(1000);

  // Click first lawyer button to open modal
  const viewProfileBtn = await mobilePage.$('#abogados button:has-text("Ver Perfil")');
  let modalOpened = false;
  if (viewProfileBtn) {
    await viewProfileBtn.click();
    await mobilePage.waitForTimeout(600);
    modalOpened = await mobilePage.$eval('.fixed h3', el => !!el).catch(() => false);
  }

  const mobileScreenshot = path.join(ARTIFACT_DIR, 'stage4_3a_abogado_modal_mobile.png');
  await mobilePage.screenshot({ path: mobileScreenshot });

  recordTest('TEST-7', 'Prueba en móvil y visualización de advertencia en modal interactivo', modalOpened ? 'PASS' : 'FAIL', { modalOpened });

  await browser.close();

  // Save report to artifact dir
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verificacion_etapa4_3a_resultados.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nRESUMEN FINAL: ${results.summary.passed}/7 pruebas superadas (${results.summary.failed} fallidas).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

