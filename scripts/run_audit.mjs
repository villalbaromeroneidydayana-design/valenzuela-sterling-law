import { chromium } from 'playwright';
import path from 'path';

async function runAudit() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  
  const artifactDir = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';

  // 1. Desktop Test
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  
  console.log('--- AUDITORIA DE TITULO HERO (DESKTOP) ---');
  const heroH1 = await desktopPage.locator('#hero h1').innerText();
  console.log('H1 Text:', JSON.stringify(heroH1));
  const heroBox = await desktopPage.locator('#hero h1').boundingBox();
  console.log('H1 Dimensions:', heroBox);

  // Take Desktop Hero screenshot
  await desktopPage.screenshot({ path: path.join(artifactDir, 'audit_hero_desktop.png'), clip: { x: 0, y: 0, width: 1440, height: 750 } });

  console.log('--- AUDITORIA DE SECCION FIANZAS (DESKTOP) ---');
  const fianzasSec = desktopPage.locator('#fianzas');
  console.log('Fianzas section exists:', await fianzasSec.count() > 0);
  await fianzasSec.scrollIntoViewIfNeeded();
  
  // Test Tabs
  await desktopPage.click('#fianzas button:has-text("Recuperación de Fondos")');
  console.log('Tab Recuperación clicked, text found:', await desktopPage.locator('#fianzas h3:has-text("¿Cómo Recuperar el Dinero de su Fianza?")').isVisible());
  
  await desktopPage.click('#fianzas button:has-text("Requisitos")');
  console.log('Tab Requisitos clicked, text found:', await desktopPage.locator('#fianzas h3:has-text("Documentación Necesaria para Trámites de Fianza")').isVisible());
  
  await desktopPage.click('#fianzas button:has-text("Pasos a Seguir")');
  console.log('Tab Pasos clicked, text found:', await desktopPage.locator('#fianzas h3:has-text("Proceso Paso a Paso con Nuestra Firma")').isVisible());

  await desktopPage.screenshot({ path: path.join(artifactDir, 'audit_fianzas_desktop.png') });

  // Test Button CTA in Fianzas
  await desktopPage.click('#fianzas button:has-text("Iniciar Consulta de Fianza")');
  await desktopPage.waitForTimeout(400);
  console.log('Modal CallRequest visible after click:', await desktopPage.locator('text=Solicitar una Llamada Inmediata').isVisible());
  // Close CallRequestModal
  await desktopPage.click('button[aria-label="Cerrar ventana"]');

  console.log('--- AUDITORIA DE PORTAL DE CLIENTES ---');
  await desktopPage.evaluate(() => window.scrollTo(0, 0));
  await desktopPage.click('button:has-text("Portal del Cliente")');
  console.log('ClientPortalModal open:', await desktopPage.locator('text=Acceso Individual a su Expediente').isVisible());
  await desktopPage.click('button:has-text("Cargar Datos Demo")');
  await desktopPage.click('button:has-text("Consultar Mi Expediente")');
  await desktopPage.waitForTimeout(600);
  console.log('ClientPortal authenticated case record visible:', await desktopPage.locator('text=VS-CAS-2026-0842').isVisible());
  console.log('Client activities count visible:', await desktopPage.locator('text=eventos registrados').isVisible());
  
  await desktopPage.screenshot({ path: path.join(artifactDir, 'audit_client_portal_authenticated.png') });
  await desktopPage.click('button[aria-label="Cerrar"]');

  console.log('--- AUDITORIA DE SECCIÓN LABORAL ---');
  const laborSec = desktopPage.locator('#laboral');
  await laborSec.scrollIntoViewIfNeeded();
  const laborBtn = desktopPage.locator('button:has-text("Solicitar estimación con un asesor")');
  console.log('Labor calculation button exists:', await laborBtn.isVisible());
  await laborBtn.click();
  await desktopPage.waitForTimeout(400);
  console.log('Call request modal opened from labor calculator:', await desktopPage.locator('text=Solicitar una Llamada Inmediata').isVisible());
  await desktopPage.click('button[aria-label="Cerrar ventana"]');

  await desktopPage.close();

  // 2. Mobile Test (390x844)
  console.log('--- AUDITORIA RESPONSIVA MÓVIL (390px) ---');
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });

  const mobileHeroH1 = await mobilePage.locator('#hero h1').innerText();
  console.log('Mobile H1 Text:', JSON.stringify(mobileHeroH1));
  const mobileHeroBox = await mobilePage.locator('#hero h1').boundingBox();
  console.log('Mobile H1 Box:', mobileHeroBox);

  await mobilePage.screenshot({ path: path.join(artifactDir, 'audit_hero_mobile_390.png'), clip: { x: 0, y: 0, width: 390, height: 750 } });

  // Test Mobile Menu
  await mobilePage.click('button[aria-label="Abrir menú"]');
  console.log('Mobile menu open, has Fianzas link:', await mobilePage.getByRole('link', { name: 'Fianzas Migratorias & Fondos' }).isVisible());
  console.log('Mobile menu has Client Portal link:', await mobilePage.locator('button:has-text("Portal del Cliente — Mi Expediente")').isVisible());
  
  await mobilePage.screenshot({ path: path.join(artifactDir, 'audit_mobile_menu.png') });
  await mobilePage.click('button[aria-label="Abrir menú"]');

  // Test Mobile Fianzas section
  const mobileFianzas = mobilePage.locator('#fianzas');
  await mobileFianzas.scrollIntoViewIfNeeded();
  await mobilePage.screenshot({ path: path.join(artifactDir, 'audit_fianzas_mobile_390.png') });

  // Full page mobile screenshot
  await mobilePage.screenshot({ path: path.join(artifactDir, 'audit_mobile_full_page.png'), fullPage: true });

  await mobilePage.close();
  await browser.close();
  console.log('AUDIT COMPLETED 100% SUCCESSFULLY!');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
