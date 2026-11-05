import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Abrir página principal
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 2. Abrir Portal del Cliente (Triple Factor)
  await page.click('button:has-text("Portal del Cliente")');
  await page.waitForTimeout(600);
  await page.screenshot({
    path: 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/evidencia_portal_triple_factor.png'
  });
  console.log('Saved evidencia_portal_triple_factor.png');

  // Cerrar portal
  await page.click('button[aria-label="Cerrar"]');
  await page.waitForTimeout(500);

  // 3. Abrir Backoffice del Personal (hacer clic en Personal o en el footer)
  const staffBtn = await page.$('button:has-text("Personal")');
  if (staffBtn) {
    await staffBtn.click();
  } else {
    await page.click('button:has-text("Acceso Personal de la Firma")');
  }
  await page.waitForTimeout(600);

  // Captura del login administrativo
  await page.screenshot({
    path: 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/evidencia_backoffice_login.png'
  });
  console.log('Saved evidencia_backoffice_login.png');

  // Autocompletar credenciales en DEV y entrar
  await page.click('button:has-text("Autocompletar credenciales")');
  await page.waitForTimeout(300);
  await page.click('button:has-text("Ingresar al Backoffice")');
  await page.waitForTimeout(1200);

  // Captura del Dashboard Administrativo con expedientes y claves
  await page.screenshot({
    path: 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/evidencia_backoffice_dashboard.png'
  });
  console.log('Saved evidencia_backoffice_dashboard.png');

  // Hacer clic en "Ficha" de un caso para ver detalle
  await page.click('button:has-text("Ficha")');
  await page.waitForTimeout(600);
  await page.screenshot({
    path: 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/evidencia_backoffice_ficha_caso.png'
  });
  console.log('Saved evidencia_backoffice_ficha_caso.png');

  await browser.close();
  console.log('Todas las capturas completadas.');
})();

