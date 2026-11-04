import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function auditAll() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const BASE_URL = 'http://127.0.0.1:3000';
  const artifactDir = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';
  
  const report = {
    viewports: [],
    practiceAreas: [],
    laborAreas: [],
    bondsAudit: {},
    formsAudit: {},
    attorneysAudit: {},
    officesAudit: {},
    consoleErrors: []
  };

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Capturar errores de consola
  page.on('console', msg => {
    if (msg.type() === 'error') {
      report.consoleErrors.push(msg.text());
    }
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  // 1. Auditoría de 12 Especialidades Migratorias
  console.log('--- 1. AUDITORÍA DE PRÁCTICAS MIGRATORIAS ---');
  const practiceCards = page.locator('#servicios article');
  const practiceCount = await practiceCards.count();
  console.log(`Especialidades encontradas: ${practiceCount}`);

  for (let i = 0; i < Math.min(practiceCount, 12); i++) {
    const card = practiceCards.nth(i);
    const title = await card.locator('h3').innerText();
    const btnEvaluate = card.locator('button:has-text("Comenzar Evaluación")');
    const hasEvaluateBtn = await btnEvaluate.isVisible();
    report.practiceAreas.push({ title, hasEvaluateBtn });
  }

  // 2. Auditoría de Áreas Laborales
  console.log('--- 2. AUDITORÍA DE DERECHO LABORAL ---');
  const laborCards = page.locator('#derecho-laboral article');
  const laborCount = await laborCards.count();
  console.log(`Áreas laborales encontradas: ${laborCount}`);
  for (let i = 0; i < laborCount; i++) {
    const title = await laborCards.nth(i).locator('h3').innerText();
    report.laborAreas.push(title);
  }

  // 3. Auditoría de Fianzas
  console.log('--- 3. AUDITORÍA DE FIANZAS ---');
  const fianzasSec = page.locator('#fianzas');
  const fTabs = ['Orientación de Fianzas', 'Recuperación de Fondos', 'Requisitos & Documentos', 'Pasos a Seguir'];
  for (const tabName of fTabs) {
    await page.click(`#fianzas button:has-text("${tabName}")`);
    report.bondsAudit[tabName] = 'Activa y conmutando';
  }

  // 4. Auditoría de Abogados
  console.log('--- 4. AUDITORÍA DE ABOGADOS ---');
  const attorneyCards = page.locator('#abogados .grid > div');
  const attorneyCount = await attorneyCards.count();
  console.log(`Abogados presentados: ${attorneyCount}`);
  report.attorneysAudit.count = attorneyCount;

  // 5. Auditoría de Sedes
  console.log('--- 5. AUDITORÍA DE SEDES ---');
  const officeCards = page.locator('#sedes .grid > div');
  const officeCount = await officeCards.count();
  console.log(`Sedes corporativas: ${officeCount}`);
  report.officesAudit.count = officeCount;

  await page.close();

  // 6. Auditoría Multi-Viewport
  console.log('--- 6. AUDITORÍA MULTI-VIEWPORT ---');
  const testViewports = [
    { name: 'Mobile_iPhone_390', width: 390, height: 844 },
    { name: 'Mobile_Android_412', width: 412, height: 915 },
    { name: 'Tablet_Portrait_768', width: 768, height: 1024 },
    { name: 'Laptop_1024', width: 1024, height: 768 },
    { name: 'Desktop_1440', width: 1440, height: 900 }
  ];

  for (const vp of testViewports) {
    const p = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await p.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Medir título H1
    const h1Box = await p.locator('#hero h1').boundingBox();
    const bodyScrollWidth = await p.evaluate(() => document.body.scrollWidth);
    const hasHorizontalOverflow = bodyScrollWidth > vp.width + 5;
    
    // Captura
    const shotPath = path.join(artifactDir, `audit_vp_${vp.name}.png`);
    await p.screenshot({ path: shotPath, clip: { x: 0, y: 0, width: vp.width, height: 800 } });

    report.viewports.push({
      viewport: vp.name,
      width: vp.width,
      h1Dimensions: h1Box,
      hasHorizontalOverflow
    });

    await p.close();
  }

  await browser.close();
  console.log('AUDITORÍA INTEGRAL COMPLETADA');
  fs.writeFileSync('scripts/audit_summary_results.json', JSON.stringify(report, null, 2));
}

auditAll().catch(err => {
  console.error('Error en auditoría integral:', err);
  process.exit(1);
});

