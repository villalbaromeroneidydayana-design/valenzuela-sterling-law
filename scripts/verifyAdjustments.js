import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://127.0.0.1:3000/...');
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });

  // 1. Verify Phone number in DOM
  const pageContent = await page.content();
  const phonePresent = pageContent.includes('+1 (314) 618-5666') || pageContent.includes('+13146185666');
  console.log('Central Phone +1 (314) 618-5666 present:', phonePresent);

  // 2. Verify Attorneys section
  const teamSection = page.locator('#abogados');
  await teamSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const attorneyNames = [
    'Jefe (~Lawyer)',
    'LIC. John Alfonso',
    'Amanda Victoria',
    'Omar Shazad',
    'Jessica McCartney',
    'Oficina de Apoyo Legal'
  ];

  for (const name of attorneyNames) {
    const isVisible = await page.locator(`#abogados :text("${name}")`).first().isVisible();
    console.log(`Attorney "${name}" visible:`, isVisible);
  }

  // Screenshot of Attorneys Section
  await teamSection.screenshot({ path: 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/screenshot_abogados.png' });
  console.log('Saved screenshot_abogados.png');

  // 3. Verify Labor Law section
  const laborSection = page.locator('#derecho-laboral');
  await laborSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const laborAreas = [
    'Despidos Injustificados',
    'Salarios No Pagados',
    'Horas Extras No Remuneradas',
    'Discriminación Laboral',
    'Acoso y Represalias Laborales',
    'Compensaciones Laborales'
  ];

  for (const area of laborAreas) {
    const isVisible = await page.locator(`#derecho-laboral :text("${area}")`).first().isVisible();
    console.log(`Labor practice "${area}" visible:`, isVisible);
  }

  // Screenshot of Labor Law Section
  await laborSection.screenshot({ path: 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/screenshot_laboral.png' });
  console.log('Saved screenshot_laboral.png');

  // 4. Test Mobile view
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
  await teamSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await teamSection.screenshot({ path: 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/screenshot_abogados_mobile.png' });
  console.log('Saved screenshot_abogados_mobile.png');

  await browser.close();
  console.log('Verification finished successfully!');
})();
