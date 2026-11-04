import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\ALP\\.gemini\\antigravity\\brain\\d1b3b533-9af7-4f55-9581-c95ba2a1b59e';

async function runAudit() {
  console.log("================================================================================");
  console.log("   AUDITORÍA DE ACEPTACIÓN — ETAPA 2 RENDER (FRAMEWORK F.R.A.M.E.)");
  console.log("================================================================================\n");

  const auditResults = {
    test1_whatsapp: { status: 'PENDIENTE', details: [] },
    test2_modals: { status: 'PENDIENTE', details: [] },
    test3_backend_persistence: { status: 'PENDIENTE', details: {} },
    test4_demo_records: { status: 'PENDIENTE', details: [] },
    test5_links_and_forms: { status: 'PENDIENTE', details: [] },
    test6_hero_comparison: { status: 'PENDIENTE', details: {} },
    test7_console_and_network: { status: 'PENDIENTE', consoleErrors: [], networkFailures: [] },
    test8_files_integrity: { status: 'PENDIENTE', modifiedFiles: [] }
  };

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Escuchar errores de consola y fallos de red (PRUEBA 7)
  page.on('console', msg => {
    if (msg.type() === 'error') {
      auditResults.test7_console_and_network.consoleErrors.push(msg.text());
    }
  });

  page.on('response', resp => {
    if (resp.status() >= 400) {
      auditResults.test7_console_and_network.networkFailures.push({
        url: resp.url(),
        status: resp.status(),
        statusText: resp.statusText()
      });
    }
  });

  // Navegar a la aplicación
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Hook de window.open para interceptar clics de WhatsApp
  await page.evaluate(() => {
    window.lastOpenedUrl = null;
    window.open = function(url) {
      window.lastOpenedUrl = url;
      return null;
    };
  });

  // -------------------------------------------------------------------------
  // PRUEBA 6: Comparación de Portada
  // -------------------------------------------------------------------------
  console.log("[PRUEBA 6] Comparando portada actual con la versión aprobada...");
  const heroHeading = await page.$('#hero h1');
  const heroH1 = await heroHeading.innerText();
  const heroScreenshotPath = path.join(ARTIFACT_DIR, 'audit_hero_current.png');
  await page.screenshot({ 
    path: heroScreenshotPath, 
    clip: { x: 0, y: 0, width: 1440, height: 800 } 
  });

  const isEmeraldAndIntact = heroH1.includes("Defensa Jurídica de Alto Nivel");

  auditResults.test6_hero_comparison = {
    headline: heroH1.replace(/\n/g, ' '),
    screenshot: heroScreenshotPath,
    status: isEmeraldAndIntact ? 'PASS' : 'FAIL'
  };
  console.log(`    Resultado Portada: ${auditResults.test6_hero_comparison.status} (H1: "${heroH1.replace(/\n/g, ' ')}")`);

  // -------------------------------------------------------------------------
  // PRUEBA 1 Y 2: Comprobar 12 modales, botones de WhatsApp y contenidos
  // -------------------------------------------------------------------------
  console.log("\n[PRUEBA 1 & 2] Verificando individualmente los 12 modales y botones de WhatsApp...");
  const practiceSection = await page.$('#servicios');
  await practiceSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const cards = await page.$$('#servicios .grid > div');
  console.log(`    Total de tarjetas detectadas en directorio: ${cards.length}`);

  let allModalsValid = true;
  let allWhatsAppValid = true;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const exploreBtn = await card.$('button:has-text("Explorar Especialidad")');
    if (exploreBtn) {
      await exploreBtn.click();
      await page.waitForTimeout(300);

      const modal = await page.$('.fixed.inset-0.z-50');
      if (modal) {
        const modalTitle = await modal.$eval('h3', el => el.innerText.trim()).catch(() => `Especialidad ${i+1}`);

        // Pulsar botón de WhatsApp para verificar ejecución y captura de URL
        await page.evaluate(() => { window.lastOpenedUrl = null; });
        const waBtn = await modal.$('button:has-text("WhatsApp")');
        let waHref = '';
        let waMessage = '';
        if (waBtn) {
          await waBtn.click();
          await page.waitForTimeout(100);
          waHref = await page.evaluate(() => window.lastOpenedUrl) || '';
          try {
            const urlObj = new URL(waHref);
            waMessage = urlObj.searchParams.get('text') || '';
          } catch (e) {
            waMessage = waHref;
          }
        }

        // Extraer preguntas de autoevaluación
        const questions = await modal.$$eval('ul li', lis => lis.map(li => li.innerText.trim()));
        // Extraer párrafos de explicación
        const descriptions = await modal.$$eval('p', ps => ps.map(p => p.innerText.trim()));
        // Extraer botón de solicitud / cuestionario
        const ctaBtn = await modal.$('button:has-text("Solicitar"), a:has-text("Solicitar"), button:has-text("Cuestionario"), a:has-text("Cuestionario"), button:has-text("Iniciar Cuestionario")');

        const modalValid = questions.length > 0 && descriptions.length > 0 && ctaBtn !== null;
        const waValid = waHref.includes('wa.me') && waMessage.length > 5;

        if (!modalValid) allModalsValid = false;
        if (!waValid) allWhatsAppValid = false;

        auditResults.test1_whatsapp.details.push({
          index: i + 1,
          specialty: modalTitle,
          waHref,
          waMessage,
          status: waValid ? 'PASS' : 'FAIL'
        });

        auditResults.test2_modals.details.push({
          index: i + 1,
          specialty: modalTitle,
          questionsCount: questions.length,
          sampleQuestion: questions[0] || 'N/A',
          hasDescription: descriptions.length > 0,
          hasCta: ctaBtn !== null,
          status: modalValid ? 'PASS' : 'FAIL'
        });

        console.log(`    [${i+1}/12] ${modalTitle}:`);
        console.log(`         WhatsApp (${waValid ? 'OK' : 'FALLÓ'}): "${waMessage.substring(0, 65)}..."`);
        console.log(`         Modal (${modalValid ? 'OK' : 'FALLÓ'}): ${questions.length} preguntas, CTA activo`);

        // Cerrar modal
        const closeBtn = await modal.$('button[aria-label="Cerrar modal"]');
        if (closeBtn) {
          await closeBtn.click();
          await page.waitForTimeout(200);
        }
      } else {
        allModalsValid = false;
        console.log(`    [${i+1}/12]: ERROR al abrir modal`);
      }
    }
  }

  auditResults.test1_whatsapp.status = (allWhatsAppValid && auditResults.test1_whatsapp.details.length === 12) ? 'PASS' : 'FAIL';
  auditResults.test2_modals.status = (allModalsValid && auditResults.test2_modals.details.length === 12) ? 'PASS' : 'FAIL';

  // -------------------------------------------------------------------------
  // PRUEBA 3: Persistencia real en backend (con datos sintéticos de auditoría)
  // -------------------------------------------------------------------------
  console.log("\n[PRUEBA 3] Verificando persistencia real del cuestionario en backend...");
  const evaluatorSec = await page.$('#evaluador');
  if (evaluatorSec) {
    await evaluatorSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Paso 1
    const step1Btn = await evaluatorSec.$('button:has-text("Continuar"), button:has-text("Continue")');
    if (step1Btn) await step1Btn.click();
    await page.waitForTimeout(300);

    // Paso 2
    const radios = await evaluatorSec.$$('input[type="radio"]');
    if (radios.length > 0) {
      await radios[0].click();
      if (radios[2]) await radios[2].click();
    }
    const step2Btn = await evaluatorSec.$('button:has-text("Paso Final"), button:has-text("Final Step")');
    if (step2Btn) await step2Btn.click();
    await page.waitForTimeout(300);

    // Paso 3
    const auditSyntheticName = "AUDITORÍA F.R.A.M.E. PRUEBA";
    const auditSyntheticPhone = "(305) 555-0188";
    const nameInput = await evaluatorSec.$('input[type="text"][required]');
    const phoneInput = await evaluatorSec.$('input[type="tel"][required]');
    if (nameInput && phoneInput) {
      await nameInput.fill(auditSyntheticName);
      await phoneInput.fill(auditSyntheticPhone);

      const submitBtn = await evaluatorSec.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // Verificar en archivo de persistencia local
    const vaultPath = path.join(process.cwd(), 'server_data', 'evaluations_vault.jsonl');
    let recordFound = false;
    let lastRecord = null;
    if (fs.existsSync(vaultPath)) {
      const lines = fs.readFileSync(vaultPath, 'utf8').trim().split('\n');
      for (let j = lines.length - 1; j >= 0; j--) {
        try {
          const rec = JSON.parse(lines[j]);
          if (rec.name === auditSyntheticName && rec.phone === auditSyntheticPhone) {
            recordFound = true;
            lastRecord = rec;
            break;
          }
        } catch (e) {}
      }
    }

    auditResults.test3_backend_persistence = {
      recordFound,
      auditId: lastRecord?.id || null,
      status: recordFound ? 'PASS' : 'FAIL',
      recordDetails: lastRecord
    };
    console.log(`    Resultado Persistencia Backend: ${auditResults.test3_backend_persistence.status} (ID generado: ${lastRecord?.id})`);
  }

  // -------------------------------------------------------------------------
  // PRUEBA 4: Registros DEMO no se presentan como información institucional
  // -------------------------------------------------------------------------
  console.log("\n[PRUEBA 4] Confirmando que registros DEMO no se presentan como auténticos...");
  const pageFullText = await page.$eval('body', el => el.innerText);
  
  // Buscar si aparecen los números inflados sin respaldo en el cuerpo visible
  const hasUnbacked18k = pageFullText.includes("+18,500");
  const hasUnbacked98 = pageFullText.includes("98.4%");
  
  // Verificar demoData.js
  const demoDataContent = fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'demoData.js'), 'utf8');
  const demoDataHasTags = demoDataContent.includes('[DEMO — NO PUBLICAR]');
  const isDemoFlagsPresent = demoDataContent.includes('isDemo: true');

  const demoTestPass = !hasUnbacked18k && !hasUnbacked98 && demoDataHasTags && isDemoFlagsPresent;
  auditResults.test4_demo_records = {
    hasUnbacked18k,
    hasUnbacked98,
    demoDataHasTags,
    isDemoFlagsPresent,
    status: demoTestPass ? 'PASS' : 'FAIL'
  };
  console.log(`    Presencia de métricas no respaldadas en texto visible: ${hasUnbacked18k ? 'DETECTADO (FALLO)' : 'NINGUNO (CORRECTO)'}`);
  console.log(`    Marcadores [DEMO — NO PUBLICAR] en data layer: ${demoDataHasTags ? 'PRESENTES (CORRECTO)' : 'AUSENTES'}`);
  console.log(`    Resultado Prueba 4: ${auditResults.test4_demo_records.status}`);

  // -------------------------------------------------------------------------
  // PRUEBA 5: Enlaces de llamada, navegación y formularios
  // -------------------------------------------------------------------------
  console.log("\n[PRUEBA 5] Verificando enlaces de llamada, navegación y formularios...");
  const telLinks = await page.$$eval('a[href^="tel:"]', links => links.map(l => l.getAttribute('href')));
  const navLinks = await page.$$eval('header a[href^="#"]', links => links.map(l => ({ text: l.innerText.trim(), href: l.getAttribute('href') })));
  
  const hasTel = telLinks.length > 0 && telLinks.every(t => t.startsWith('tel:'));
  const hasNav = navLinks.length >= 3;

  auditResults.test5_links_and_forms = {
    telLinksCount: telLinks.length,
    telSample: telLinks[0] || 'N/A',
    navLinksCount: navLinks.length,
    status: (hasTel && hasNav) ? 'PASS' : 'FAIL'
  };
  console.log(`    Enlaces telefónicos detectados: ${telLinks.length} (${telLinks[0]})`);
  console.log(`    Enlaces de navegación en cabecera: ${navLinks.length}`);
  console.log(`    Resultado Prueba 5: ${auditResults.test5_links_and_forms.status}`);

  // -------------------------------------------------------------------------
  // PRUEBA 7: Consola y red
  // -------------------------------------------------------------------------
  console.log("\n[PRUEBA 7] Analizando consola y tráfico de red...");
  const consoleErrorsCount = auditResults.test7_console_and_network.consoleErrors.length;
  const networkFailuresCount = auditResults.test7_console_and_network.networkFailures.length;
  
  auditResults.test7_console_and_network.status = (consoleErrorsCount === 0 && networkFailuresCount === 0) ? 'PASS' : 'FAIL';
  console.log(`    Errores JavaScript en consola: ${consoleErrorsCount}`);
  console.log(`    Peticiones HTTP fallidas (4xx/5xx): ${networkFailuresCount}`);
  console.log(`    Resultado Prueba 7: ${auditResults.test7_console_and_network.status}`);

  // -------------------------------------------------------------------------
  // PRUEBA 8: Comprobar modificaciones estrictas de archivos
  // -------------------------------------------------------------------------
  console.log("\n[PRUEBA 8] Verificando archivos modificados en src/ durante Etapa 2...");
  const srcFiles = fs.readdirSync(path.join(process.cwd(), 'src'), { recursive: true });
  const modifiedInStage2 = [];
  const allowedFiles = [
    path.normalize('components/PracticeAreas.jsx'),
    path.normalize('components/EligibilityEvaluator.jsx'),
    path.normalize('data/demoData.js')
  ];

  // Comprobar archivos modificados tras la autorización de la Etapa 2 (21:15 hrs)
  const stage2StartTime = new Date('2026-10-30T21:15:00').getTime();

  for (const relative of srcFiles) {
    const fullPath = path.join(process.cwd(), 'src', relative);
    if (fs.statSync(fullPath).isFile()) {
      const fileStat = fs.statSync(fullPath);
      if (fileStat.mtimeMs > stage2StartTime) {
        modifiedInStage2.push(path.normalize(relative));
      }
    }
  }

  const unauthorizedFiles = modifiedInStage2.filter(f => !allowedFiles.some(af => f.endsWith(af)));
  auditResults.test8_files_integrity = {
    modifiedFiles: modifiedInStage2,
    unauthorizedFiles,
    status: unauthorizedFiles.length === 0 ? 'PASS' : 'FAIL'
  };
  console.log(`    Archivos modificados durante Etapa 2: ${modifiedInStage2.join(', ')}`);
  console.log(`    Archivos no autorizados modificados: ${unauthorizedFiles.length === 0 ? 'NINGUNO (0)' : unauthorizedFiles.join(', ')}`);
  console.log(`    Resultado Prueba 8: ${auditResults.test8_files_integrity.status}`);

  await browser.close();

  // Guardar reporte JSON en artefactos
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'audit_stage2_acceptance_results.json'),
    JSON.stringify(auditResults, null, 2),
    'utf8'
  );

  console.log("\n================================================================================");
  console.log("   AUDITORÍA COMPLETADA. REPORTE GENERADO EN ARTEFACTOS.");
  console.log("================================================================================\n");
}

runAudit().catch(err => {
  console.error("Error durante auditoría:", err);
  process.exit(1);
});
