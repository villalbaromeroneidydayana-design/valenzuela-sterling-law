import { chromium } from 'playwright';
import path from 'path';

const artifactsDir = 'C:\\Users\\ALP\\.gemini\\antigravity\\brain\\d1b3b533-9af7-4f55-9581-c95ba2a1b59e';
const baseUrl = 'http://127.0.0.1:3000';

async function capture() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  
  // 1. Mobile viewport - Portal del cliente con modal de firma
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(baseUrl);
  await mobilePage.waitForLoadState('networkidle');

  // Abrir portal desde mobile
  await mobilePage.click('button:has-text("Portal del Cliente"):visible');
  await mobilePage.waitForTimeout(600);

  // Usar botón rápido DEV de Caso Test A o llenar formulario
  const testAButton = mobilePage.locator('button:has-text("Caso Test A (Méndez)")');
  if (await testAButton.count() > 0) {
    await testAButton.click();
  } else {
    await mobilePage.fill('input[placeholder*="VS-CAS"]', 'VS-TEST-2026-9001');
    await mobilePage.fill('input[type="password"]', 'PRUEBA-9001');
    await mobilePage.fill('input[placeholder*="apellido"]', 'Méndez');
  }

  await mobilePage.click('button:has-text("Consultar Mi Expediente"):visible');
  await mobilePage.waitForSelector('text=Expediente Verificado');
  await mobilePage.waitForTimeout(800);

  // Capturar vista del cliente con aviso de firma y documentos
  await mobilePage.screenshot({ path: path.join(artifactsDir, 'evidencia_firma_portal_cliente_mobile.png') });
  console.log('Capturada: evidencia_firma_portal_cliente_mobile.png');

  // Si hay botón de firmar documento, hacer clic para abrir el canvas
  const signBtn = mobilePage.locator('button:has-text("Firmar Documento"):visible').first();
  if (await signBtn.count() > 0) {
    await signBtn.click();
    await mobilePage.waitForSelector('canvas');
    await mobilePage.waitForTimeout(500);

    // Simular un trazo manuscrito realista en el canvas
    const canvas = mobilePage.locator('canvas').first();
    const box = await canvas.boundingBox();
    if (box) {
      await mobilePage.mouse.move(box.x + 50, box.y + 60);
      await mobilePage.mouse.down();
      await mobilePage.mouse.move(box.x + 100, box.y + 35);
      await mobilePage.mouse.move(box.x + 140, box.y + 75);
      await mobilePage.mouse.move(box.x + 190, box.y + 40);
      await mobilePage.mouse.move(box.x + 230, box.y + 85);
      await mobilePage.mouse.move(box.x + 280, box.y + 45);
      await mobilePage.mouse.up();
    }
    // Marcar checkbox de conformidad
    const modalCheckbox = mobilePage.locator('label:has-text("certifico que he leído") input[type="checkbox"]').first();
    if (await modalCheckbox.count() > 0) {
      await modalCheckbox.click();
    }
    await mobilePage.waitForTimeout(400);

    await mobilePage.screenshot({ path: path.join(artifactsDir, 'evidencia_firma_canvas_mobile.png') });
    console.log('Capturada: evidencia_firma_canvas_mobile.png');
  }

  // 2. Desktop viewport - Panel administrativo mostrando estado de firma y documentos
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(baseUrl);
  await desktopPage.waitForLoadState('networkidle');

  // Abrir panel administrativo
  await desktopPage.click('button[title*="administrativo"]');
  await desktopPage.waitForTimeout(600);
  await desktopPage.fill('input[placeholder*="admin@valenzuelasterling.com"]', 'admin@valenzuelasterling.com');
  await desktopPage.fill('input[type="password"]', 'V&S-Legal#2026$ProtectVault!');
  await desktopPage.click('button:has-text("Ingresar al Backoffice"):visible');
  await desktopPage.waitForSelector('text=Control de Expedientes');
  await desktopPage.waitForTimeout(800);

  // Seleccionar caso 9001
  await desktopPage.click('button:has-text("VS-TEST-2026-9001"):visible');
  await desktopPage.waitForTimeout(800);

  await desktopPage.screenshot({ path: path.join(artifactsDir, 'evidencia_firma_admin_dashboard_desktop.png') });
  console.log('Capturada: evidencia_firma_admin_dashboard_desktop.png');

  await browser.close();
}

capture().catch(err => {
  console.error('Error al capturar pantallas:', err);
  process.exit(1);
});
