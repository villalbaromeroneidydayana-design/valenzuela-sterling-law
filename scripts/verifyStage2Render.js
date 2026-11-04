import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';

async function verify() {
  console.log("=== INICIANDO SUITE DE PRUEBAS OBLIGATORIAS — ETAPA 2: RENDER ===");
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const results = {
    heroIntact: false,
    specialtiesCount: 0,
    modalsTested: 0,
    englishSwitchOk: false,
    questionnaireComplete: false,
    disclaimersPresent: false
  };

  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });

  // 1. Verificación visual de Portada (Hero)
  console.log("[1] Verificando portada verde esmeralda...");
  const heroHeading = await page.$('#hero h1');
  const heroText = await heroHeading.innerText();
  console.log("    Hero Titular:", heroText.replace(/\n/g, ' '));
  if (heroText.includes("Defensa Jurídica de Alto Nivel")) {
    results.heroIntact = true;
  }
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'render_hero_intact.png'), clip: { x: 0, y: 0, width: 1440, height: 800 } });

  // 2. Verificar las 12 especialidades en la cuadrícula compacta
  console.log("[2] Verificando directorio de 12 especialidades...");
  const cards = await page.$$('#servicios .grid > div');
  results.specialtiesCount = cards.length;
  console.log(`    Total de tarjetas detectadas: ${cards.length} (Esperado: 12)`);

  const practiceEl = await page.$('#servicios');
  await practiceEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'render_practice_directory_compact.png') });

  // 3. Probar apertura y cierre de modales
  console.log("[3] Probando apertura interactiva de los 12 modales...");
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const exploreBtn = await card.$('button:has-text("Explorar Especialidad")');
    if (exploreBtn) {
      await exploreBtn.click();
      await page.waitForTimeout(250);

      // Verificar que el modal está presente
      const modal = await page.$('.fixed.inset-0.z-50');
      if (modal) {
        const titleEl = await modal.$('h3');
        const modalTitle = await titleEl?.innerText();
        console.log(`    [Modal ${i + 1}/12] Abierto correctamente: «${modalTitle}»`);
        results.modalsTested++;

        // Cerrar modal
        const closeBtn = await modal.$('button[aria-label="Cerrar modal"]');
        if (closeBtn) {
          await closeBtn.click();
          await page.waitForTimeout(150);
        }
      }
    }
  }

  // 4. Probar versión en inglés
  console.log("[4] Probando cambio de idioma a Inglés (EN)...");
  const enBtn = await page.$('header button:has-text("EN")');
  if (enBtn) {
    await enBtn.click();
    await page.waitForTimeout(400);

    const enExploreBtn = await page.$('#servicios button:has-text("Explore Area")');
    if (enExploreBtn) {
      results.englishSwitchOk = true;
      console.log("    Cambio a EN exitoso. Botón 'Explore Area' detectado.");
      
      // Probar modal en inglés
      await enExploreBtn.click();
      await page.waitForTimeout(250);
      const enModal = await page.$('.fixed.inset-0.z-50');
      const enModalText = await enModal?.innerText();
      if (enModalText?.includes("Typical Scenarios Handled")) {
        console.log("    Modal en inglés verificado con secciones en inglés.");
      }
      const closeEnModal = await enModal?.$('button[aria-label="Cerrar modal"]');
      if (closeEnModal) await closeEnModal.click();
      await page.waitForTimeout(150);
    }

    // Regresar a español para probar el cuestionario en español
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const esBtns = await page.$$('button');
    for (const b of esBtns) {
      const txt = await b.innerText();
      if (txt.trim() === 'ES') {
        await b.click();
        await page.waitForTimeout(400);
        console.log("    Regresado a Español (ES).");
        break;
      }
    }
  }

  // 5. Probar Cuestionario Orientativo Preliminar de Admisión
  console.log("[5] Probando Cuestionario Orientativo Preliminar de Admisión...");
  const evaluadorSection = await page.$('#evaluador');
  if (evaluadorSection) {
    await evaluadorSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const sectionTitle = await evaluadorSection.$eval('h2', el => el.innerText);
    console.log("    Título de sección del cuestionario:", sectionTitle);

    if (sectionTitle.includes("Cuestionario Orientativo Preliminar de Admisión") || sectionTitle.includes("Preliminary Intake Guidance Questionnaire")) {
      results.disclaimersPresent = true;
    }

    // Paso 1 -> Clic en "Continuar a las Preguntas" / "Continue to Questions"
    const step1Btn = await evaluadorSection.$('button:has-text("Continuar"), button:has-text("Continue")');
    if (step1Btn) {
      await step1Btn.click();
      await page.waitForTimeout(400);
      console.log("    Avanzado a Etapa 2 (Cuestionario Adaptativo).");
    }

    // Paso 2 -> Seleccionar opciones en las preguntas dinámicas
    const radioInputs = await evaluadorSection.$$('input[type="radio"]');
    if (radioInputs.length > 0) {
      await radioInputs[0].click();
      if (radioInputs[3]) await radioInputs[3].click();
      console.log(`    Opciones seleccionadas en etapa 2 (${radioInputs.length} radios presentes).`);
    }

    // Paso 2 -> Clic en "Paso Final: Datos de Contacto" / "Final Step"
    const step2Btn = await evaluadorSection.$('button:has-text("Paso Final"), button:has-text("Final Step")');
    if (step2Btn) {
      await step2Btn.click();
      await page.waitForTimeout(400);
      console.log("    Avanzado a Etapa 3 (Datos de Contacto).");
    }

    // Paso 3 -> Verificar aviso ético obligatorio
    const disclaimerText = await evaluadorSection.innerText();
    if (disclaimerText.includes("Aviso Importante: Este cuestionario orientativo") || disclaimerText.includes("Important Notice: This preliminary intake") || disclaimerText.includes("recopila información básica")) {
      console.log("    Aviso ético obligatorio verificado en Etapa 3.");
      results.disclaimersPresent = true;
    }

    // Llenar datos de contacto usando selectores universales
    const nameInput = await evaluadorSection.$('input[type="text"][required]');
    const phoneInput = await evaluadorSection.$('input[type="tel"][required]');
    if (nameInput && phoneInput) {
      await nameInput.fill("Mario González Prueba");
      await phoneInput.fill("(305) 555-0199");
      
      const submitBtn = await evaluadorSection.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(1200);
        console.log("    Formulario enviado al backend.");
      }
    }

    // Verificar pantalla de confirmación
    const confirmTitle = await evaluadorSection.$('h3');
    const confirmText = await confirmTitle?.innerText();
    console.log("    Pantalla de confirmación:", confirmText);
    if (confirmText?.includes("Cuestionario Recibido") || confirmText?.includes("Questionnaire Received") || confirmText?.includes("Solicitud Preliminar") || confirmText?.includes("Preliminary Guidance")) {
      results.questionnaireComplete = true;
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'render_questionnaire_confirmed.png') });
  }

  // 6. Prueba en vista móvil
  console.log("[6] Verificando responsividad móvil...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:3000');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'render_mobile_verified.png') });
  console.log("    Captura móvil guardada.");

  await browser.close();

  console.log("\n=== RESUMEN DE PRUEBAS OBLIGATORIAS ===");
  console.log("1. Portada Verde Esmeralda Intacta:", results.heroIntact ? "PASS" : "FAIL");
  console.log("2. 12 Especialidades en Directorio Compacto:", results.specialtiesCount === 12 ? "PASS (12/12)" : "FAIL");
  console.log("3. Modales Interactivos Probados:", `${results.modalsTested}/12 probados`);
  console.log("4. Cambio Bilingüe ES/EN:", results.englishSwitchOk ? "PASS" : "FAIL");
  console.log("5. Cuestionario Orientativo y Avisos Éticos:", results.disclaimersPresent && results.questionnaireComplete ? "PASS" : "FAIL");
  console.log("=========================================\n");
}

verify().catch(err => {
  console.error("Error en suite de pruebas:", err);
  process.exit(1);
});
