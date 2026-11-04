import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const results = {
  stage: '4.3-B',
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
  console.log('--- INICIANDO VERIFICACIÓN DE ETAPA 4.3-B ---');

  // PRUEBA 1: Existencia de src/components/BlogArticleModal.jsx y controles de accesibilidad
  const modalPath = 'src/components/BlogArticleModal.jsx';
  const modalExists = fs.existsSync(modalPath);
  let modalContent = '';
  let a11yPass = false;
  if (modalExists) {
    modalContent = fs.readFileSync(modalPath, 'utf8');
    const hasRoleDialog = modalContent.includes('role="dialog"');
    const hasAriaModal = modalContent.includes('aria-modal="true"');
    const hasEscapeKey = modalContent.includes('Escape') || modalContent.includes('keydown');
    const hasDisclaimer = modalContent.includes('Aviso Legal e Informativo') || modalContent.includes('Legal & Informational Disclaimer');
    const hasPalette = modalContent.includes('teal') || modalContent.includes('bronze');
    a11yPass = hasRoleDialog && hasAriaModal && hasEscapeKey && hasDisclaimer && hasPalette;
  }
  recordTest('TEST-1', 'Creación y accesibilidad de BlogArticleModal.jsx', (modalExists && a11yPass) ? 'PASS' : 'FAIL', {
    modalExists,
    hasRoleDialog: modalContent.includes('role="dialog"'),
    hasAriaModal: modalContent.includes('aria-modal="true"'),
    hasEscapeKey: modalContent.includes('Escape'),
    hasDisclaimer: modalContent.includes('Aviso Legal'),
  });

  // PRUEBA 2: Contenido profundo y secciones legales completas en BLOG_POSTS (demoData.js)
  const demoDataContent = fs.readFileSync('src/data/demoData.js', 'utf8');
  const has3Posts = demoDataContent.includes('cambios-asilo-2026') &&
                    demoDataContent.includes('guia-visa-eb2-niw') &&
                    demoDataContent.includes('evitar-errores-peticion-familiar');
  const hasSections = demoDataContent.includes('sectionsEs') && demoDataContent.includes('sectionsEn');
  const hasOct2026 = demoDataContent.includes('Octubre 2026');
  const contentPass = has3Posts && hasSections && hasOct2026;
  recordTest('TEST-2', 'Integridad y profundidad de los 3 artículos en demoData.js', contentPass ? 'PASS' : 'FAIL', {
    has3Posts,
    hasSections,
    hasOct2026
  });

  // PRUEBA 3: Integración de BlogPreview y App.jsx con disparador del modal
  const blogPreviewContent = fs.readFileSync('src/components/BlogPreview.jsx', 'utf8');
  const appContent = fs.readFileSync('src/App.jsx', 'utf8');
  const hasButtonText = blogPreviewContent.includes('Leer artículo completo');
  const hasAppModal = appContent.includes('selectedBlogArticle') && appContent.includes('BlogArticleModal');
  recordTest('TEST-3', 'Vinculación de eventos y botón "Leer artículo completo" en BlogPreview y App.jsx', (hasButtonText && hasAppModal) ? 'PASS' : 'FAIL', {
    hasButtonText,
    hasAppModal
  });

  // PRUEBA 4: Hash integrity check de componentes protegidos
  const protectedExpected = {
    'src/components/Header.jsx': '9eaa2cf95248677f',
    'src/components/Footer.jsx': '40a57c63b408d4e8',
    'src/components/Hero.jsx': 'ee3efebe3fda9e46',
    'src/components/PracticeAreas.jsx': '2058453f3eb7000f',
    'src/components/EligibilityEvaluator.jsx': '267e9f4ba61308dc',
    'src/components/AttorneyTeam.jsx': 'a95b9056e4d1f1b2',
    'server/apiMiddleware.js': '4bb71a51c17e0638',
    'server_data/evaluations_vault.jsonl': 'e9490b4561e6b560',
    'index.html': 'a5703aec8f65962e',
    'package.json': 'b17647945fbe8631'
  };

  let hashesPass = true;
  const hashResults = {};
  for (const [file, exp] of Object.entries(protectedExpected)) {
    const raw = fs.readFileSync(file);
    const hash = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16);
    hashResults[file] = { actual: hash, expected: exp, match: hash === exp };
    if (hash !== exp) hashesPass = false;
  }

  // Comprobar registro sintético
  const vaultContent = fs.readFileSync('server_data/evaluations_vault.jsonl', 'utf8');
  const recordPreserved = vaultContent.includes('VS-EVAL-474783');
  recordTest('TEST-4', 'Integridad criptográfica de 10 archivos protegidos y bóveda', (hashesPass && recordPreserved) ? 'PASS' : 'FAIL', {
    hashResults,
    recordPreserved
  });

  // PRUEBAS DE NAVEGADOR CON PLAYWRIGHT Y EDGE
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

  // Scroll a la sección blog
  await page.evaluate(() => {
    const el = document.getElementById('blog');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(1000);

  // PRUEBA 5: Apertura del modal, verificación de contenido del artículo y captura Desktop
  const readButtons = page.locator('#blog button:has-text("Leer artículo completo")');
  const count = await readButtons.count();
  console.log(`Botones "Leer artículo completo" encontrados: ${count}`);

  let modalOpensDesktop = false;
  let modalHasAllFields = false;

  if (count >= 1) {
    await readButtons.first().click();
    await page.waitForTimeout(800);

    const dialog = page.locator('[role="dialog"]');
    modalOpensDesktop = await dialog.isVisible();

    // Validar título, autor, fecha, imagen, subtítulos y aviso legal
    const titleText = await dialog.locator('h2').first().textContent();
    const fullDialogText = await dialog.textContent();
    const hasAuthor = fullDialogText.includes('Redacción Jurídica');
    const hasDate = fullDialogText.includes('2026');
    const headingsCount = await dialog.locator('h3').count();
    const hasSectionsHeadings = headingsCount >= 3;
    const hasDisclaimerText = fullDialogText.includes('Aviso Legal e Informativo');

    console.log(`TEST-5 Diagnostico:`, {
      titleText: Boolean(titleText),
      hasAuthor,
      hasDate,
      headingsCount,
      hasSectionsHeadings,
      hasDisclaimerText
    });

    modalHasAllFields = Boolean(titleText) && hasAuthor && hasDate && hasSectionsHeadings && hasDisclaimerText;

    const desktopModalShot = path.join(ARTIFACT_DIR, 'stage4_3b_blog_modal_desktop.png');
    await page.screenshot({ path: desktopModalShot, fullPage: false });
    console.log(`Captura guardada: ${desktopModalShot}`);
  }

  recordTest('TEST-5', 'Apertura funcional en Desktop con título, autor, fecha, secciones y disclaimer', (modalOpensDesktop && modalHasAllFields) ? 'PASS' : 'FAIL', {
    modalOpensDesktop,
    modalHasAllFields
  });

  // PRUEBA 6: Cierre del modal con tecla Escape y reapertura con botón Cerrar
  let closeEscapeWorks = false;
  let closeBtnWorks = false;

  // Presionar Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  const dialogAfterEscape = page.locator('[role="dialog"]');
  closeEscapeWorks = !(await dialogAfterEscape.isVisible());

  // Reabrir segundo artículo y cerrar con botón "Cerrar"
  if (count >= 2) {
    await readButtons.nth(1).click();
    await page.waitForTimeout(500);
    const closeBtn = page.locator('[role="dialog"] button:has-text("Cerrar")');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
      closeBtnWorks = !(await page.locator('[role="dialog"]').isVisible());
    }
  }

  recordTest('TEST-6', 'Cierre accesible mediante tecla Escape y botón Cerrar', (closeEscapeWorks && closeBtnWorks) ? 'PASS' : 'FAIL', {
    closeEscapeWorks,
    closeBtnWorks
  });

  // PRUEBA 7: Adaptabilidad móvil (390x844) y captura Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    const el = document.getElementById('blog');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(500);

  const mobileReadBtn = page.locator('#blog button:has-text("Leer artículo completo")').first();
  await mobileReadBtn.click();
  await page.waitForTimeout(800);

  const mobileDialog = page.locator('[role="dialog"]');
  const mobileModalVisible = await mobileDialog.isVisible();

  const mobileModalShot = path.join(ARTIFACT_DIR, 'stage4_3b_blog_modal_mobile.png');
  await page.screenshot({ path: mobileModalShot, fullPage: false });
  console.log(`Captura guardada: ${mobileModalShot}`);

  recordTest('TEST-7', 'Adaptabilidad y visualización correcta en vista móvil (390x844)', mobileModalVisible ? 'PASS' : 'FAIL', {
    mobileModalVisible,
    consoleErrorsCount: consoleErrors.length
  });

  await browser.close();

  // Guardar archivo JSON de resultados
  const resultJsonPath = path.join(ARTIFACT_DIR, 'verificacion_etapa4_3b_resultados.json');
  fs.writeFileSync(resultJsonPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Resultados guardados en: ${resultJsonPath}`);
  console.log(`\nRESUMEN FINAL: ${results.summary.passed}/${results.summary.total} pruebas superadas.`);
}

main().catch(err => {
  console.error('ERROR EN VERIFICACIÓN:', err);
  process.exit(1);
});
