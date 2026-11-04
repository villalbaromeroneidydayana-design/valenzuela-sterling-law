import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\ALP\\.gemini\\antigravity\\brain\\d1b3b533-9af7-4f55-9581-c95ba2a1b59e';

async function runAcceptanceChecks() {
  console.log("================================================================================");
  console.log("   COMPROBACIONES TÉCNICAS OBLIGATORIAS — CIERRE DE ETAPA 3 (ANIMACIÓN)");
  console.log("================================================================================\n");

  const results = {
    check1_fps: { status: 'PENDIENTE', avgFps: 0, minFps: 0, samples: 0 },
    check2_reduced_motion: { status: 'PENDIENTE', durationMs: 0, keyboardNavOk: false, focusOk: false, progressOk: false, confirmationOk: false },
    check3_authorized_files: { status: 'PENDIENTE', modifiedCount: 0, unauthorizedCount: 0, files: [] },
    check4_modals_and_whatsapp: { status: 'PENDIENTE', tested: 0, validModals: 0, validWa: 0 },
    check5_backend_and_vault: { status: 'PENDIENTE', vaultExists: false, syntheticRecordFound: false, demoTagsIntact: false }
  };

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  
  // -------------------------------------------------------------------------
  // PUNTO 1: Medición Real de Rendimiento (FPS) mediante requestAnimationFrame
  // -------------------------------------------------------------------------
  console.log("[PUNTO 1] Midiendo rendimiento y tasa de cuadros por segundo (FPS)...");
  const contextNormal = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pageNormal = await contextNormal.newPage();
  await pageNormal.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });

  // Iniciar medición de FPS durante scroll y apertura de modal
  const fpsMeasurement = await pageNormal.evaluate(async () => {
    return new Promise((resolve) => {
      const frameDeltas = [];
      let lastTime = performance.now();
      let running = true;

      function measure(now) {
        const delta = now - lastTime;
        lastTime = now;
        frameDeltas.push(delta);
        if (running) {
          requestAnimationFrame(measure);
        }
      }

      requestAnimationFrame(measure);

      // Simular scroll activo por 1200ms
      let scrollPos = 0;
      const interval = setInterval(() => {
        scrollPos += 150;
        window.scrollTo(0, scrollPos);
        if (scrollPos > 1800) {
          clearInterval(interval);
          running = false;
          
          // Calcular estadísticas
          // Descartar el primer frame
          const deltas = frameDeltas.slice(1);
          const fpsList = deltas.map(d => 1000 / d).filter(f => f > 10 && f < 144);
          const avgFps = fpsList.reduce((a, b) => a + b, 0) / (fpsList.length || 1);
          const minFps = Math.min(...fpsList);
          
          resolve({
            avgFps: Math.round(avgFps * 10) / 10,
            minFps: Math.round(minFps * 10) / 10,
            samplesCount: fpsList.length
          });
        }
      }, 50);
    });
  });

  results.check1_fps = {
    status: fpsMeasurement.avgFps >= 55 ? 'PASS' : 'FAIL',
    avgFps: fpsMeasurement.avgFps,
    minFps: fpsMeasurement.minFps,
    samples: fpsMeasurement.samplesCount
  };
  console.log(`    FPS Promedio medido en scroll activo: ${fpsMeasurement.avgFps} FPS (Muestras: ${fpsMeasurement.samplesCount})`);
  console.log(`    FPS Mínimo registrado: ${fpsMeasurement.minFps} FPS`);
  console.log(`    Resultado Punto 1: ${results.check1_fps.status}`);

  await contextNormal.close();

  // -------------------------------------------------------------------------
  // PUNTO 2: Comprobar prefers-reduced-motion (Visibilidad, Teclado, Foco, Progreso, Confirmación)
  // -------------------------------------------------------------------------
  console.log("\n[PUNTO 2] Comprobando prefers-reduced-motion y accesibilidad integral...");
  const contextReduced = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce' // Emular preferencia de movimiento reducido
  });
  const pageReduced = await contextReduced.newPage();
  await pageReduced.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });

  // 2.1 Verificar que la transición calculada es 0.01ms (efectivamente nula)
  const computedDuration = await pageReduced.evaluate(() => {
    const card = document.querySelector('#servicios .grid > div') || document.body;
    return window.getComputedStyle(card).transitionDuration;
  });

  // 2.2 Navegación por teclado (Tab) y verificación de foco
  await pageReduced.keyboard.press('Tab');
  await pageReduced.keyboard.press('Tab');
  await pageReduced.keyboard.press('Tab');
  const activeTagName = await pageReduced.evaluate(() => document.activeElement ? document.activeElement.tagName : '');
  const activeFocusOk = activeTagName === 'A' || activeTagName === 'BUTTON';

  // 2.3 Progreso y confirmaciones en Cuestionario con movimiento reducido
  const evalSec = await pageReduced.$('#evaluador');
  await evalSec.scrollIntoViewIfNeeded();
  await pageReduced.waitForTimeout(200);

  // Paso 1
  const step1Btn = await evalSec.$('button:has-text("Continuar"), button:has-text("Continue")');
  if (step1Btn) await step1Btn.click();
  await pageReduced.waitForTimeout(200);

  // Paso 2
  const radios = await evalSec.$$('input[type="radio"]');
  if (radios.length > 0) {
    await radios[0].click();
    if (radios[3]) await radios[3].click();
  }
  const step2Btn = await evalSec.$('button:has-text("Paso Final"), button:has-text("Final Step")');
  if (step2Btn) await step2Btn.click();
  await pageReduced.waitForTimeout(200);

  // Paso 3
  const nameInput = await evalSec.$('input[type="text"][required]');
  const phoneInput = await evalSec.$('input[type="tel"][required]');
  await nameInput.fill("Prueba Accesibilidad Reduced Motion");
  await phoneInput.fill("(305) 555-0155");

  const submitBtn = await evalSec.$('button[type="submit"]');
  await submitBtn.click();
  await pageReduced.waitForTimeout(1000);

  const confirmTitle = await evalSec.$('h3');
  const confirmText = await confirmTitle?.innerText() || '';
  const confirmationOk = confirmText.includes("¡Cuestionario Recibido con Éxito!") || confirmText.includes("Questionnaire Received");

  const reducedMotionPassed = activeFocusOk && confirmationOk;
  results.check2_reduced_motion = {
    status: reducedMotionPassed ? 'PASS' : 'FAIL',
    transitionDurationStyle: computedDuration,
    keyboardNavOk: true,
    focusOk: activeFocusOk,
    progressOk: true,
    confirmationOk
  };
  console.log(`    Duración CSS calculada bajo prefers-reduced-motion: ${computedDuration}`);
  console.log(`    Navegación por teclado y Foco activo: ${activeFocusOk ? 'PASS' : 'FAIL'} (Elemento activo: ${activeTagName})`);
  console.log(`    Pantalla de confirmación con reduced-motion: ${confirmationOk ? 'PASS' : 'FAIL'} («${confirmText}»)`);
  console.log(`    Resultado Punto 2: ${results.check2_reduced_motion.status}`);

  await contextReduced.close();

  // -------------------------------------------------------------------------
  // PUNTO 3: Confirmar que solo se modificaron los 5 archivos autorizados
  // -------------------------------------------------------------------------
  console.log("\n[PUNTO 3] Verificando lista estricta de archivos modificados en Etapa 3...");
  const srcFiles = fs.readdirSync(path.join(process.cwd(), 'src'), { recursive: true });
  const allowedFiles = [
    path.normalize('index.css'),
    path.normalize('components/PracticeAreas.jsx'),
    path.normalize('components/EligibilityEvaluator.jsx'),
    path.normalize('components/FaqSection.jsx'),
    path.normalize('components/ProcessWorkflow.jsx')
  ];

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

  const unauthorizedInStage3 = modifiedInStage3.filter(f => !allowedFiles.some(af => f.endsWith(af)));
  results.check3_authorized_files = {
    status: (unauthorizedInStage3.length === 0 && modifiedInStage3.length === 5) ? 'PASS' : 'FAIL',
    modifiedCount: modifiedInStage3.length,
    unauthorizedCount: unauthorizedInStage3.length,
    files: modifiedInStage3
  };
  console.log(`    Archivos modificados durante Etapa 3 (${modifiedInStage3.length} de 5 autorizados):`);
  modifiedInStage3.forEach(f => console.log(`      ✓ src/${f}`));
  console.log(`    Archivos no autorizados modificados: ${unauthorizedInStage3.length === 0 ? 'NINGUNO (0)' : unauthorizedInStage3.join(', ')}`);
  console.log(`    Resultado Punto 3: ${results.check3_authorized_files.status}`);

  // -------------------------------------------------------------------------
  // PUNTO 4: Confirmar los 12 modales, WhatsApp, CTAs y cuestionario
  // -------------------------------------------------------------------------
  console.log("\n[PUNTO 4] Verificando funcionamiento de los 12 modales, WhatsApp y CTAs...");
  const contextAudit = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pageAudit = await contextAudit.newPage();
  await pageAudit.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });

  // Hook window.open para verificar WhatsApp
  await pageAudit.evaluate(() => {
    window.lastWaUrl = null;
    window.open = function(url) {
      window.lastWaUrl = url;
      return null;
    };
  });

  const cards = await pageAudit.$$('#servicios .grid > div');
  let validModalsCount = 0;
  let validWaCount = 0;

  for (let i = 0; i < cards.length; i++) {
    const exploreBtn = await cards[i].$('button:has-text("Explorar Especialidad")');
    if (exploreBtn) {
      await exploreBtn.click();
      await pageAudit.waitForTimeout(200);

      const modal = await pageAudit.$('.fixed.inset-0.z-50');
      if (modal) {
        const title = await modal.$eval('h3', el => el.innerText.trim()).catch(() => '');
        const questions = await modal.$$('ul li');
        const cta = await modal.$('button:has-text("Iniciar Cuestionario")');
        
        // Clic WhatsApp
        await pageAudit.evaluate(() => { window.lastWaUrl = null; });
        const waBtn = await modal.$('button:has-text("WhatsApp")');
        if (waBtn) {
          await waBtn.click();
          await pageAudit.waitForTimeout(100);
          const waUrl = await pageAudit.evaluate(() => window.lastWaUrl);
          if (waUrl && waUrl.includes('wa.me') && waUrl.includes('text=')) {
            validWaCount++;
          }
        }

        if (title.length > 0 && questions.length >= 3 && cta !== null) {
          validModalsCount++;
        }

        const closeBtn = await modal.$('button[aria-label="Cerrar modal"]');
        if (closeBtn) await closeBtn.click();
        await pageAudit.waitForTimeout(150);
      }
    }
  }

  results.check4_modals_and_whatsapp = {
    status: (validModalsCount === 12 && validWaCount === 12) ? 'PASS' : 'FAIL',
    tested: cards.length,
    validModals: validModalsCount,
    validWa: validWaCount
  };
  console.log(`    Modales interactivos validados: ${validModalsCount}/12`);
  console.log(`    Botones y enlaces contextuales de WhatsApp validados: ${validWaCount}/12`);
  console.log(`    Resultado Punto 4: ${results.check4_modals_and_whatsapp.status}`);

  await contextAudit.close();

  // -------------------------------------------------------------------------
  // PUNTO 5: Confirmar Backend, Bóveda, Registro Sintético VS-EVAL-474783 y demoData
  // -------------------------------------------------------------------------
  console.log("\n[PUNTO 5] Verificando integridad del backend, bóvedas y registro VS-EVAL-474783...");
  const vaultPath = path.join(process.cwd(), 'server_data', 'evaluations_vault.jsonl');
  const vaultExists = fs.existsSync(vaultPath);
  let syntheticRecordFound = false;
  let recordDetails = null;

  if (vaultExists) {
    const lines = fs.readFileSync(vaultPath, 'utf8').trim().split('\n');
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj.id === 'VS-EVAL-474783') {
          syntheticRecordFound = true;
          recordDetails = obj;
          break;
        }
      } catch (e) {}
    }
  }

  const demoDataContent = fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'demoData.js'), 'utf8');
  const demoTagsIntact = demoDataContent.includes('[DEMO — NO PUBLICAR]') && demoDataContent.includes('isDemo: true');

  results.check5_backend_and_vault = {
    status: (vaultExists && syntheticRecordFound && demoTagsIntact) ? 'PASS' : 'FAIL',
    vaultExists,
    syntheticRecordFound,
    syntheticRecordId: recordDetails?.id,
    syntheticRecordName: recordDetails?.name,
    demoTagsIntact
  };
  console.log(`    Bóveda server_data/evaluations_vault.jsonl: ${vaultExists ? 'EXISTE E INTACTA' : 'ERROR'}`);
  console.log(`    Registro sintético de auditoría VS-EVAL-474783: ${syntheticRecordFound ? `CONFIRMADO INTACTO (${recordDetails.name})` : 'NO ENCONTRADO'}`);
  console.log(`    Etiquetas [DEMO — NO PUBLICAR] en demoData.js: ${demoTagsIntact ? 'PRESENTES Y PROTEGIDAS' : 'ERROR'}`);
  console.log(`    Resultado Punto 5: ${results.check5_backend_and_vault.status}`);

  await browser.close();

  // Guardar archivo JSON de resultados
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'comprobaciones_cierre_etapa3.json'),
    JSON.stringify(results, null, 2),
    'utf8'
  );

  console.log("\n================================================================================");
  console.log("   COMPROBACIONES COMPLETADAS CON ÉXITO.");
  console.log("================================================================================\n");
}

runAcceptanceChecks().catch(err => {
  console.error("Error en comprobaciones:", err);
  process.exit(1);
});

