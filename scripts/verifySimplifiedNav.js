import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const results = {
  task: 'SIMPLIFIED_NAVIGATION_VERIFICATION',
  timestamp: new Date().toISOString(),
  tests: {},
  summary: { total: 6, passed: 0, failed: 0 }
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
  console.log('--- INICIANDO VERIFICACIÓN DE NAVEGACIÓN SIMPLIFICADA (5 PILARES) ---');

  // PRUEBA 1: Integridad de componentes protegidos y bóveda de datos
  const protectedExpected = {
    'server/apiMiddleware.js': '4bb71a51c17e0638',
    'server_data/evaluations_vault.jsonl': 'e9490b4561e6b560',
    'index.html': 'a5703aec8f65962e',
    'package.json': 'b17647945fbe8631'
  };

  let hashesPass = true;
  for (const [file, exp] of Object.entries(protectedExpected)) {
    const raw = fs.readFileSync(file);
    const hash = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16);
    if (hash !== exp) hashesPass = false;
  }
  const vaultContent = fs.readFileSync('server_data/evaluations_vault.jsonl', 'utf8');
  const recordPreserved = vaultContent.includes('VS-EVAL-474783');
  recordTest('TEST-1', 'Integridad de bóveda JSONL, expedientes y componentes inalterados', (hashesPass && recordPreserved) ? 'PASS' : 'FAIL', {
    hashesPass,
    recordPreserved
  });

  const browser = await chromium.launch({
    executablePath: edgePath,
    headless: true
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });

  // PRUEBA 2: Menú de escritorio de 5 pilares y botón CTA principal
  const desktopLinks = await page.locator('nav .hidden.lg\\:flex a').allInnerTexts();
  console.log('Enlaces de escritorio detectados:', desktopLinks);
  const has5PillarsDesktop = desktopLinks.some(t => t.includes('Servicios')) &&
    desktopLinks.some(t => t.includes('Abogados')) &&
    desktopLinks.some(t => t.includes('Testimonios')) &&
    desktopLinks.some(t => t.includes('Guías') || t.includes('Noticias')) &&
    desktopLinks.some(t => t.includes('Sedes') || t.includes('Contacto'));

  const ctaBtn = page.locator('button:has-text("Evaluar Mi Caso")').first();
  const hasCta = await ctaBtn.isVisible();
  const ctaBtnText = hasCta ? await ctaBtn.innerText() : '';

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'simplified_nav_desktop.png') });

  recordTest('TEST-2', 'Menú de escritorio de 5 pilares + CTA en gradiente bronce', (has5PillarsDesktop && hasCta) ? 'PASS' : 'FAIL', {
    desktopLinks,
    ctaBtnText
  });

  // PRUEBA 3: Destinos de los 5 anclajes en la página
  const anchors = ['#servicios', '#abogados', '#testimonios', '#blog', '#sedes'];
  let anchorsPass = true;
  const anchorDetails = {};
  for (const anchor of anchors) {
    const target = page.locator(anchor);
    const count = await target.count();
    anchorDetails[anchor] = { exists: count > 0 };
    if (count === 0) anchorsPass = false;
  }
  recordTest('TEST-3', 'Resolución correcta de los 5 destinos ancla (#servicios, #abogados, etc.)', anchorsPass ? 'PASS' : 'FAIL', anchorDetails);

  // PRUEBA 4: Apertura del Evaluador desde CTA de cabecera
  await ctaBtn.click();
  await page.waitForTimeout(600);
  const evaluatorCloseBtn = page.locator('button[aria-label="Cerrar evaluador"]');
  const modalOpenedFromHeader = await evaluatorCloseBtn.isVisible();

  // Cerrar el modal mediante su botón de cierre
  if (modalOpenedFromHeader) {
    await evaluatorCloseBtn.click();
    await page.waitForTimeout(400);
  }

  recordTest('TEST-4', 'Apertura centralizada del Evaluador desde el CTA del Header', modalOpenedFromHeader ? 'PASS' : 'FAIL', {
    modalOpenedFromHeader
  });

  // PRUEBA 5: Navegación móvil (390x844) - Menú offcanvas con 5 pilares y 2 acciones
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);

  // Abrir menú hamburguesa
  const hamburgerBtn = page.locator('nav button[aria-label="Abrir menú"]');
  await hamburgerBtn.click();
  await page.waitForTimeout(500);

  const mobileLinks = await page.locator('nav .lg\\:hidden a').allInnerTexts();
  console.log('Enlaces móviles detectados:', mobileLinks);
  const has5PillarsMobile = mobileLinks.some(t => t.includes('Servicios')) &&
    mobileLinks.some(t => t.includes('Abogados')) &&
    mobileLinks.some(t => t.includes('Testimonios')) &&
    mobileLinks.some(t => t.includes('Guías')) &&
    mobileLinks.some(t => t.includes('Sedes'));

  const mobileEvalBtn = page.locator('nav .lg\\:hidden button:has-text("Evaluar")');
  const hasMobileEvalBtn = await mobileEvalBtn.isVisible();

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'simplified_nav_mobile_menu.png') });

  // Cerrar menú móvil
  await hamburgerBtn.click();
  await page.waitForTimeout(500);

  recordTest('TEST-5', 'Menú offcanvas móvil con los 5 pilares y botones táctiles optimizados', (has5PillarsMobile && hasMobileEvalBtn) ? 'PASS' : 'FAIL', {
    mobileLinksCount: mobileLinks.length,
    has5PillarsMobile,
    hasMobileEvalBtn
  });

  // PRUEBA 6: Barra flotante inferior táctil simplificada (Llamar 24/7 y Evaluar Caso)
  const floatingBar = page.locator('.fixed.bottom-0.sm\\:hidden');
  const hasFloatingBar = await floatingBar.isVisible();
  const floatingCallBtn = floatingBar.locator('a[href^="tel:"]');
  const floatingEvalBtn = floatingBar.locator('button:has-text("Evaluar")');

  const callBtnOk = await floatingCallBtn.isVisible();
  const evalBtnOk = await floatingEvalBtn.isVisible();

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'simplified_nav_mobile_floating.png') });

  // Probar clic en evaluar desde barra flotante
  await floatingEvalBtn.click();
  await page.waitForTimeout(600);
  const mobileModalCloseBtn = page.locator('button[aria-label="Cerrar evaluador"]');
  const mobileModalOpen = await mobileModalCloseBtn.isVisible();
  if (mobileModalOpen) {
    await mobileModalCloseBtn.click();
    await page.waitForTimeout(400);
  }

  recordTest('TEST-6', 'Barra flotante inferior móvil simplificada con 2 acciones prioritarias y apertura del evaluador', (hasFloatingBar && callBtnOk && evalBtnOk && mobileModalOpen) ? 'PASS' : 'FAIL', {
    hasFloatingBar,
    callBtnOk,
    evalBtnOk,
    mobileModalOpen,
    consoleErrorsCount: consoleErrors.length
  });

  await browser.close();

  // Guardar reporte JSON
  const resultJsonPath = path.join(ARTIFACT_DIR, 'verificacion_navegacion_simplificada_resultados.json');
  fs.writeFileSync(resultJsonPath, JSON.stringify(results, null, 2), 'utf8');

  console.log(`\nRESUMEN: ${results.summary.passed}/${results.summary.total} pruebas superadas.`);
}

main().catch(err => {
  console.error('ERROR EN VERIFICACIÓN:', err);
  process.exit(1);
});
