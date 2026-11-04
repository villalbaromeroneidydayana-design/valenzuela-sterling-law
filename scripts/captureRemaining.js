import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://127.0.0.1:3000');
  await page.waitForTimeout(1000);

  // 1. Ir a sección evaluador en la página directamente
  const evaluadorEl = await page.$('#evaluador');
  if (evaluadorEl) {
    await evaluadorEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Clic en "Continuar a las Preguntas" para pasar a Etapa 2
    const continueBtn = await page.$('#evaluador button:has-text("Continuar a las Preguntas")');
    if (continueBtn) {
      await continueBtn.click();
      await page.waitForTimeout(600);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_adaptive_evaluator.png') });
  }

  // 2. Abrir Modal de Métricas de Conversión
  const telemetryBtn = await page.$('footer button:has-text("Métricas de Conversión")');
  if (telemetryBtn) {
    await telemetryBtn.scrollIntoViewIfNeeded();
    await telemetryBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_telemetry_modal.png') });
  }

  await browser.close();
  console.log("Successfully captured remaining screenshots!");
}

run().catch(console.error);

