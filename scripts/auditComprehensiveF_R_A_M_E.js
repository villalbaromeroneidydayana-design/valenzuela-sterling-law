import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function audit() {
  console.log('--- INICIANDO AUDITORÍA GENERAL F.R.A.M.E. ---');
  const browser = await chromium.launch({ executablePath: edgePath });

  const auditData = {
    timestamp: new Date().toISOString(),
    consoleLogs: [],
    consoleErrors: [],
    failedRequests: [],
    sections: [],
    images: [],
    buttons: [],
    links: [],
    interactions: {},
    responsive: {}
  };

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    auditData.consoleLogs.push({ type, text });
    if (type === 'error') {
      auditData.consoleErrors.push(text);
    }
  });

  page.on('requestfailed', request => {
    auditData.failedRequests.push({
      url: request.url(),
      failure: request.failure() ? request.failure().errorText : 'Unknown'
    });
  });

  console.log('Cargando http://127.0.0.1:3000/ ...');
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Scroll through entire page to trigger lazy loading of images
  await page.evaluate(async () => {
    const distance = 400;
    const delay = 100;
    while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
      document.scrollingElement.scrollBy(0, distance);
      await new Promise(r => setTimeout(r, delay));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);

  // Desktop full screenshot
  const desktopFullScreenshot = path.join(ARTIFACT_DIR, 'audit_desktop_full.png');
  await page.screenshot({ path: desktopFullScreenshot, fullPage: true });
  console.log('Captura desktop guardada.');

  // Extract all sections and details
  auditData.sections = await page.evaluate(() => {
    const elements = document.querySelectorAll('header, section, footer');
    return Array.from(elements).map((el, i) => {
      const heading = el.querySelector('h1, h2, h3, h4');
      return {
        index: i + 1,
        id: el.id || '(sin id)',
        tag: el.tagName.toLowerCase(),
        heading: heading ? heading.innerText.trim() : '(sin encabezado)',
        textLength: el.innerText.trim().length,
        buttons: el.querySelectorAll('button').length,
        links: el.querySelectorAll('a').length,
        images: el.querySelectorAll('img').length
      };
    });
  });

  // Extract all images
  auditData.images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt') || '',
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      isBroken: img.naturalWidth === 0
    }));
  });

  // Test FAQ Accordion click
  console.log('Probando acordeón de FAQs...');
  const faqBtn = await page.$('#faqs button[aria-controls^="faq-answer"]');
  if (faqBtn) {
    const beforeExp = await faqBtn.getAttribute('aria-expanded');
    await faqBtn.click();
    await page.waitForTimeout(400);
    const afterExp = await faqBtn.getAttribute('aria-expanded');
    auditData.interactions.faq = { toggled: beforeExp !== afterExp, beforeExp, afterExp };
  }

  // Test Language Switch
  console.log('Probando cambio de idioma...');
  const enBtn = await page.$('header button:has-text("EN")');
  if (enBtn) {
    await enBtn.click();
    await page.waitForTimeout(500);
    const enH1 = await page.$eval('h1', el => el.innerText).catch(() => '');
    auditData.interactions.langSwitch = { toEn: true, enH1 };
    const esBtn = await page.$('header button:has-text("ES")');
    if (esBtn) await esBtn.click();
    await page.waitForTimeout(300);
  }

  // Test Practice Areas Modal (click card 1)
  console.log('Probando apertura de modal de Especialidad...');
  const practiceCard = await page.$('#especialidades article button');
  if (practiceCard) {
    await practiceCard.click();
    await page.waitForTimeout(600);
    const modalHeader = await page.$eval('.fixed h3, .fixed h2', el => el.innerText).catch(() => null);
    auditData.interactions.practiceModal = { opened: !!modalHeader, modalHeader };

    // Take screenshot of practice modal
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_practice_modal.png') });

    // Close modal
    const closeBtn = await page.$('button[aria-label="Cerrar modal"], .fixed button:has-text("✕")');
    if (closeBtn) {
      await closeBtn.click();
      await page.waitForTimeout(400);
    }
  }

  // Mobile Audit
  console.log('Cargando vista móvil (375x812)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://127.0.0.1:3000/', { waitUntil: 'load', timeout: 15000 });
  await mobilePage.waitForTimeout(1500);

  const mobileFullScreenshot = path.join(ARTIFACT_DIR, 'audit_mobile_full.png');
  await mobilePage.screenshot({ path: mobileFullScreenshot, fullPage: true });
  console.log('Captura mobile guardada.');

  await browser.close();

  // Save JSON
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'auditoria_general_frame_data.json'), JSON.stringify(auditData, null, 2), 'utf8');
  console.log('Auditoría ejecutada con éxito!');
}

audit().catch(err => {
  console.error(err);
  process.exit(1);
});
