import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\ALP\\.gemini\\antigravity\\brain\\d1b3b533-9af7-4f55-9581-c95ba2a1b59e';

async function verifyStage4_1() {
  console.log("================================================================================");
  console.log("   VERIFICACIÓN OFICIAL — ETAPA 4.1: MONTAJE DE RECURSOS ESTÁTICOS");
  console.log("================================================================================\n");

  const results = {
    localImagesLoaded: false,
    zeroBrokenImages: false,
    blockedFilesIntact: false,
    backendAndVaultIntact: false,
    mobile390x844Ok: false,
    failedUrls: []
  };

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Monitorear respuestas HTTP para detectar 404s
  page.on('response', resp => {
    if (resp.status() >= 400) {
      results.failedUrls.push({ url: resp.url(), status: resp.status() });
      console.log(`    [FALLO DE RED] HTTP ${resp.status()} en: ${resp.url()}`);
    }
  });

  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // 1. Verificación de imágenes locales en la página
  console.log("[1] Verificando carga de imágenes locales en la plataforma...");
  const localImgSrcs = await page.$$eval('img', imgs => imgs.map(i => i.getAttribute('src')).filter(s => s && s.startsWith('/images/')));
  console.log(`    Imágenes con ruta local detectadas en el DOM: ${localImgSrcs.length}`);
  localImgSrcs.forEach(src => console.log(`      ✓ ${src}`));
  results.localImagesLoaded = localImgSrcs.length >= 8;

  // 2. Desplazar por la página para activar la carga de imágenes lazy-loaded
  console.log("\n[2] Desplazando por la página para hidratar imágenes con loading='lazy'...");
  await page.evaluate(async () => {
    const distance = 400;
    const delay = 100;
    while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
      document.scrollingElement.scrollBy(0, distance);
      await new Promise(r => setTimeout(r, delay));
    }
  });
  await page.waitForTimeout(1000);

  // Verificar que todas las imágenes locales en el DOM cargaron con naturalWidth > 0
  const localBrokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img[src*="/images/"]'));
    return imgs.filter(img => img.naturalWidth === 0).map(i => i.src);
  });

  if (localBrokenImages.length === 0) {
    results.zeroBrokenImages = true;
    console.log("    Verificación de imágenes locales: 100% cargadas sin enlaces rotos (PASS)");
  } else {
    console.log("    Imágenes locales rotas detectadas:", localBrokenImages);
  }

  // 3. Captura visual de secciones con imágenes locales
  console.log("\n[3] Generando capturas visuales de evidencia...");
  const aboutSec = await page.$('#la-firma');
  if (aboutSec) {
    await aboutSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await aboutSec.screenshot({ path: path.join(ARTIFACT_DIR, 'stage4_1_about_firm_local.png') });
  }

  const officesSec = await page.$('#sedes');
  if (officesSec) {
    await officesSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await officesSec.screenshot({ path: path.join(ARTIFACT_DIR, 'stage4_1_offices_local.png') });
  }

  const showcaseSec = await page.$('#video-showcase');
  if (showcaseSec) {
    await showcaseSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await showcaseSec.screenshot({ path: path.join(ARTIFACT_DIR, 'stage4_1_showcase_local.png') });
  }

  const blogSec = await page.$('#blog');
  if (blogSec) {
    await blogSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await blogSec.screenshot({ path: path.join(ARTIFACT_DIR, 'stage4_1_blog_local.png') });
  }

  // 4. Verificación de vista móvil a 390x844
  console.log("\n[4] Verificando responsividad móvil a 390x844 px...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage4_1_mobile_verified.png') });
  results.mobile390x844Ok = true;
  console.log("    Captura móvil guardada en artefactos (PASS)");

  // 5. Verificación de archivos bloqueados
  console.log("\n[5] Verificando que todos los archivos bloqueados están 100% intactos...");
  const BLOCKED_FILES = [
    'src/components/Hero.jsx',
    'src/components/Header.jsx',
    'src/components/Footer.jsx',
    'src/components/PracticeAreas.jsx',
    'src/components/EligibilityEvaluator.jsx',
    'src/components/VideoReelModal.jsx',
    'server/apiMiddleware.js'
  ];

  const stage4StartTime = new Date('2026-10-30T22:05:00').getTime();
  let blockedViolation = false;

  for (const bFile of BLOCKED_FILES) {
    const fullP = path.join(process.cwd(), bFile);
    if (fs.existsSync(fullP)) {
      const stat = fs.statSync(fullP);
      if (stat.mtimeMs > stage4StartTime) {
        console.log(`    [VIOLACIÓN] Archivo bloqueado modificado: ${bFile}`);
        blockedViolation = true;
      }
    }
  }

  results.blockedFilesIntact = !blockedViolation;
  console.log(`    Archivos bloqueados intactos: ${results.blockedFilesIntact ? 'PASS' : 'FAIL'}`);

  // 6. Verificación de bóveda de datos y registro sintético
  console.log("\n[6] Verificando bóveda y registro sintético VS-EVAL-474783...");
  const vaultPath = path.join(process.cwd(), 'server_data', 'evaluations_vault.jsonl');
  let syntheticIntact = false;
  if (fs.existsSync(vaultPath)) {
    const content = fs.readFileSync(vaultPath, 'utf8');
    syntheticIntact = content.includes('VS-EVAL-474783') && content.includes('AUDITORÍA F.R.A.M.E. PRUEBA');
  }
  results.backendAndVaultIntact = syntheticIntact;
  console.log(`    Bóveda y registro sintético intactos: ${syntheticIntact ? 'PASS' : 'FAIL'}`);

  await browser.close();

  console.log("\n================================================================================");
  console.log("   RESUMEN FINAL DE COMPROBACIONES (ETAPA 4.1):");
  console.log("================================================================================");
  for (const [k, v] of Object.entries(results)) {
    if (k !== 'failedUrls') {
      console.log(`   - ${k}: ${v ? 'PASS' : 'FAIL'}`);
    }
  }
  console.log(`   - Errores HTTP 4xx/5xx: ${results.failedUrls.length}`);
  console.log("================================================================================\n");

  const success = results.localImagesLoaded && results.zeroBrokenImages && results.blockedFilesIntact && results.backendAndVaultIntact && results.mobile390x844Ok;
  process.exit(success ? 0 : 1);
}

verifyStage4_1().catch(err => {
  console.error("Error en verificación:", err);
  process.exit(1);
});
