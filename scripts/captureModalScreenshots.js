import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';

async function capture() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("Navigating to app...");
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });

  // 1. Screenshot de Servicios / Directorio
  console.log("Capturing practice directory...");
  const serviciosEl = await page.$('#servicios');
  if (serviciosEl) {
    await serviciosEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_practice_directory.png') });
  }

  // 2. Abrir Modal de Especialidad (clic en "Ver Especialidad")
  console.log("Opening practice modal...");
  const detailBtn = await page.$('#servicios button:has-text("Ver Especialidad")');
  if (detailBtn) {
    await detailBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_practice_interactive_modal.png') });

    // Cerrar modal de especialidad
    const closeBtn = await page.$('button[aria-label="Cerrar modal"]');
    if (closeBtn) await closeBtn.click();
    await page.waitForTimeout(300);
  }

  // 3. Abrir Evaluador Adaptativo (clic en "Evaluar Caso" de la primera especialidad)
  console.log("Opening adaptive evaluator...");
  const evalBtn = await page.$('#servicios button:has-text("Evaluar Caso")');
  if (evalBtn) {
    await evalBtn.click();
    await page.waitForTimeout(400);

    // Avanzar a Etapa 2 (preguntas dinámicas)
    const nextBtn = await page.$('button:has-text("Continuar a las Preguntas")');
    if (nextBtn) {
      await nextBtn.click();
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_adaptive_evaluator.png') });

    // Cerrar evaluador
    const closeEval = await page.$('button[aria-label="Cerrar evaluador"]');
    if (closeEval) await closeEval.click();
    await page.waitForTimeout(300);
  }

  // 4. Abrir Modal de Métricas de Conversión (Live)
  console.log("Opening telemetry modal...");
  const telemetryLink = await page.$('button:has-text("Métricas de Conversión (Live)")');
  if (telemetryLink) {
    await telemetryLink.scrollIntoViewIfNeeded();
    await telemetryLink.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_telemetry_modal.png') });
  }

  await browser.close();
  console.log("Screenshots captured successfully!");
}

capture().catch(err => {
  console.error("Capture error:", err);
  process.exit(1);
});

