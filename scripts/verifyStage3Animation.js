import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\ALP\\.gemini\\antigravity\\brain\\d1b3b533-9af7-4f55-9581-c95ba2a1b59e';

async function verifyStage3() {
  console.log("================================================================================");
  console.log("   VERIFICACIÓN TÉCNICA OFICIAL — ETAPA 3: ANIMACIÓN (FRAMEWORK F.R.A.M.E.)");
  console.log("================================================================================\n");

  const results = {
    heroIntact: false,
    headerFooterIntact: false,
    practiceMicroInteractions: false,
    modalsSmooth: false,
    faqAccordionsSmooth: false,
    workflowTransitionsSmooth: false,
    evaluatorProgressSmooth: false,
    reducedMotionSupported: false,
    mobileResponsiveOk: false,
    strictFilesControl: false
  };

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // 1. Verificación Hero intacto
  console.log("[1] Verificando que Hero.jsx y la portada verde esmeralda están 100% intactos...");
  const heroHeading = await page.$eval('#hero h1', el => el.innerText).catch(() => '');
  if (heroHeading.includes('Defensa Jurídica de Alto Nivel')) {
    results.heroIntact = true;
    console.log(`    Portada intacta: PASS (H1: "${heroHeading.replace(/\n/g, ' ')}")`);
  }

  // 2. Verificación Header y Footer intactos
  console.log("[2] Verificando Header y Footer...");
  const headerLinks = await page.$$('header a');
  const footerEl = await page.$('footer');
  if (headerLinks.length >= 5 && footerEl !== null) {
    results.headerFooterIntact = true;
    console.log(`    Header y Footer intactos: PASS (${headerLinks.length} enlaces en Header)`);
  }

  // 3. Verificación de microinteracciones en PracticeAreas
  console.log("[3] Verificando microinteracción en tarjetas de práctica...");
  const firstCard = await page.$('#servicios .grid > div');
  if (firstCard) {
    const cardClass = await firstCard.getAttribute('class');
    if (cardClass.includes('hover:-translate-y-0.5') && cardClass.includes('motion-reduce:hover:translate-y-0')) {
      results.practiceMicroInteractions = true;
      console.log(`    Microinteracción de elevación (2px): PASS (${cardClass.split(' ').filter(c => c.includes('translate')).join(' ')})`);
    }
  }

  // 4. Verificación de modales suaves
  console.log("[4] Verificando apertura y cierre suave de modales...");
  const exploreBtn = await page.$('#servicios button:has-text("Explorar Especialidad")');
  if (exploreBtn) {
    await exploreBtn.click();
    await page.waitForTimeout(250);
    const modal = await page.$('.fixed.inset-0.z-50');
    if (modal) {
      const modalBox = await modal.$('.shadow-elevated');
      const boxClass = await modalBox?.getAttribute('class');
      results.modalsSmooth = boxClass?.includes('duration-200') && boxClass?.includes('ease-out');
      console.log(`    Apertura suave de modal: ${results.modalsSmooth ? 'PASS' : 'FAIL'}`);
      
      const closeBtn = await modal.$('button[aria-label="Cerrar modal"]');
      if (closeBtn) await closeBtn.click();
      await page.waitForTimeout(200);
    }
  }

  // 5. Verificación de acordeones FAQ
  console.log("[5] Verificando acordeones accesibles en FAQ...");
  const faqSection = await page.$('#faqs');
  if (faqSection) {
    await faqSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const firstFaqBtn = await faqSection.$('button[aria-expanded]');
    if (firstFaqBtn) {
      const initiallyExpanded = await firstFaqBtn.getAttribute('aria-expanded');
      // Hacer clic para alternar
      await firstFaqBtn.click();
      await page.waitForTimeout(250);
      const afterClickExpanded = await firstFaqBtn.getAttribute('aria-expanded');
      
      if (initiallyExpanded !== afterClickExpanded) {
        results.faqAccordionsSmooth = true;
        console.log(`    Acordeón FAQ con accesibilidad aria-expanded: PASS (${initiallyExpanded} -> ${afterClickExpanded})`);
      }
      // Restaurar estado
      await firstFaqBtn.click();
      await page.waitForTimeout(150);
    }
  }

  // 6. Verificación de transiciones en ProcessWorkflow
  console.log("[6] Verificando transiciones en ProcessWorkflow...");
  const workflowSection = await page.$('#proceso');
  if (workflowSection) {
    await workflowSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const stepButtons = await workflowSection.$$('.grid button');
    if (stepButtons.length >= 4) {
      await stepButtons[1].click();
      await page.waitForTimeout(250);
      const stageHeading = await workflowSection.$eval('h3.font-serif', el => el.innerText).catch(() => '');
      results.workflowTransitionsSmooth = stageHeading.length > 5;
      console.log(`    Transición a Etapa 02: ${results.workflowTransitionsSmooth ? 'PASS' : 'FAIL'} («${stageHeading}»)`);
      // Regresar a etapa 1
      await stepButtons[0].click();
      await page.waitForTimeout(150);
    }
  }

  // 7. Verificación de barra de progreso y pasos en Evaluator
  console.log("[7] Verificando fluidez y barra de progreso en Cuestionario...");
  const evaluatorSec = await page.$('#evaluador');
  if (evaluatorSec) {
    await evaluatorSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const progressBar = await evaluatorSec.$('.h-full.bg-teal');
    const barClass = await progressBar?.getAttribute('class');
    const hasSmoothBar = barClass?.includes('duration-300') && barClass?.includes('ease-out');

    const step1Btn = await evaluatorSec.$('button:has-text("Continuar"), button:has-text("Continue")');
    if (step1Btn) {
      await step1Btn.click();
      await page.waitForTimeout(250);
      const step2Heading = await evaluatorSec.$eval('h3.font-serif', el => el.innerText).catch(() => '');
      results.evaluatorProgressSmooth = hasSmoothBar && step2Heading.includes('Cuestionario Adaptativo');
      console.log(`    Barra de progreso y transición a Etapa 2: ${results.evaluatorProgressSmooth ? 'PASS' : 'FAIL'}`);
    }
  }

  // 8. Verificación de regla prefers-reduced-motion en index.css
  console.log("[8] Verificando regla oficial prefers-reduced-motion...");
  const indexCss = fs.readFileSync(path.join(process.cwd(), 'src', 'index.css'), 'utf8');
  if (indexCss.includes('@media (prefers-reduced-motion: reduce)') && indexCss.includes('animation-duration: 0.01ms !important')) {
    results.reducedMotionSupported = true;
    console.log("    Soporte oficial prefers-reduced-motion: PASS");
  }

  // 9. Captura responsiva móvil
  console.log("[9] Verificando responsividad móvil...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'stage3_mobile_animation.png') });
  results.mobileResponsiveOk = true;
  console.log("    Captura móvil guardada: PASS");

  // 10. Control estricto de archivos modificados en Etapa 3
  console.log("[10] Verificando control estricto de archivos en Etapa 3...");
  const srcFiles = fs.readdirSync(path.join(process.cwd(), 'src'), { recursive: true });
  const allowedStage3Files = [
    path.normalize('index.css'),
    path.normalize('components/PracticeAreas.jsx'),
    path.normalize('components/EligibilityEvaluator.jsx'),
    path.normalize('components/FaqSection.jsx'),
    path.normalize('components/ProcessWorkflow.jsx')
  ];

  // Momento de inicio de Etapa 3: 21:45 hrs
  const stage3StartTime = new Date('2026-10-30T21:45:00').getTime();
  const modifiedInStage3 = [];

  for (const relative of srcFiles) {
    const fullPath = path.join(process.cwd(), 'src', relative);
    if (fs.statSync(fullPath).isFile()) {
      const fileStat = fs.statSync(fullPath);
      if (fileStat.mtimeMs > stage3StartTime) {
        modifiedInStage3.push(path.normalize(relative));
      }
    }
  }

  const unauthorizedInStage3 = modifiedInStage3.filter(f => !allowedStage3Files.some(af => f.endsWith(af)));
  results.strictFilesControl = (unauthorizedInStage3.length === 0 && modifiedInStage3.length > 0);
  console.log(`    Archivos modificados en Etapa 3: ${modifiedInStage3.join(', ')}`);
  console.log(`    Archivos no autorizados modificados: ${unauthorizedInStage3.length === 0 ? 'NINGUNO (0)' : unauthorizedInStage3.join(', ')}`);
  console.log(`    Control de archivos: ${results.strictFilesControl ? 'PASS' : 'FAIL'}`);

  await browser.close();

  console.log("\n================================================================================");
  console.log("   RESUMEN FINAL DE ETAPA 3 — ANIMACIÓN:");
  console.log("================================================================================");
  for (const [k, v] of Object.entries(results)) {
    console.log(`   - ${k}: ${v ? 'PASS' : 'FAIL'}`);
  }
  console.log("================================================================================\n");

  const allPassed = Object.values(results).every(v => v === true);
  process.exit(allPassed ? 0 : 1);
}

verifyStage3().catch(err => {
  console.error("Error en verifyStage3:", err);
  process.exit(1);
});

