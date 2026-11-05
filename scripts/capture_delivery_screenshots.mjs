import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';
const baseUrl = 'http://127.0.0.1:3000';

async function capture() {
  console.log('--- Capturando Vistas de Entrega (Desktop y Móvil) ---');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  // 1. Desktop - Dashboard Admin
  const pageDesk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageDesk.goto(baseUrl, { waitUntil: 'networkidle' });

  await pageDesk.click('button[title*="Acceso administrativo"]');
  await pageDesk.waitForTimeout(600);

  await pageDesk.fill('input[placeholder*="admin@valenzuelasterling.com"]', 'admin@valenzuelasterling.com');
  await pageDesk.fill('input[placeholder="••••••••••••"]', 'V&S-Legal#2026$ProtectVault!');
  await pageDesk.click('button:has-text("Ingresar al Backoffice")');
  await pageDesk.waitForTimeout(1000);

  await pageDesk.click('button:has-text("VS-TEST-2026-9001")');
  await pageDesk.waitForTimeout(600);

  await pageDesk.screenshot({
    path: path.join(ARTIFACT_DIR, 'entrega_admin_dashboard_desktop.png'),
    fullPage: false
  });
  console.log('Captura tomada: entrega_admin_dashboard_desktop.png');

  // 2. Móvil - Portal de Cliente
  const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pageMobile.goto(baseUrl, { waitUntil: 'networkidle' });

  // Abrir menú hamburguesa en móvil si es necesario
  const hamburger = pageMobile.locator('header button:has(svg.lucide-menu)').first();
  if (await hamburger.isVisible()) {
    await hamburger.click();
    await pageMobile.waitForTimeout(400);
  }

  // Clic en Portal del Cliente
  const portalBtn = pageMobile.locator('button:has-text("Portal del Cliente"):visible').first();
  await portalBtn.click();
  await pageMobile.waitForTimeout(600);

  // Rellenar Triple Factor
  await pageMobile.fill('input[placeholder*="VS-CAS-"]', 'VS-TEST-2026-9001');
  await pageMobile.fill('input[type="password"]', 'PRUEBA-9001');
  await pageMobile.fill('input[placeholder*="Primer apellido"]', 'Méndez');
  await pageMobile.click('button:has-text("Consultar Mi Expediente")');
  await pageMobile.waitForTimeout(1200);

  await pageMobile.screenshot({
    path: path.join(ARTIFACT_DIR, 'entrega_portal_cliente_mobile.png'),
    fullPage: false
  });
  console.log('Captura tomada: entrega_portal_cliente_mobile.png');

  await browser.close();
  console.log('Todas las capturas se generaron exitosamente.');
}

capture().catch(e => {
  console.error('Error al capturar:', e);
  process.exit(1);
});
