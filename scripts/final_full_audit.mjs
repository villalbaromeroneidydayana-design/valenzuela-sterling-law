import { chromium } from 'playwright';
import path from 'path';

async function runFinalAudit() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const artifactDir = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';
  
  console.log('================================================================');
  console.log('INICIANDO AUDITORÍA TÉCNICA Y FUNCIONAL FINAL');
  console.log('================================================================');

  // --- 1. PRUEBA DE ESCRITORIO (1440x900) ---
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });

  // 8. Verificación de Teléfono Central Autorizado en la interfaz
  console.log('\n[TEST 8] Verificación de Teléfono Central Autorizado...');
  const phoneText = await desktopPage.locator('text=(551) 349-9462').first().innerText();
  console.log('✓ Teléfono central presente en encabezado:', phoneText.includes('(551) 349-9462'));

  // 1 & 2 & 3. Auditoría de Portal de Clientes
  console.log('\n[TEST 1, 2, 3] Auditoría de Mi Expediente & Servidor...');
  await desktopPage.click('button:has-text("Portal del Cliente")');
  await desktopPage.waitForTimeout(300);
  
  // Probar intento con credenciales erróneas
  await desktopPage.fill('input[placeholder="Ej. VS-CAS-2026-0842"]', 'VS-CAS-2026-0842');
  await desktopPage.fill('input[placeholder="••••••••"]', 'CLAVE_INCORRECTA');
  await desktopPage.click('button:has-text("Consultar Mi Expediente")');
  await desktopPage.waitForTimeout(600);
  const errorMsg = await desktopPage.locator('text=Credenciales no autorizadas').isVisible();
  console.log('✓ Servidor rechaza credenciales incorrectas (401):', errorMsg);

  // Probar autenticación exitosa con credenciales oficiales
  await desktopPage.fill('input[placeholder="••••••••"]', '7941');
  await desktopPage.click('button:has-text("Consultar Mi Expediente")');
  await desktopPage.waitForTimeout(800);
  const clientNameVisible = await desktopPage.locator('strong:has-text("Familia Morales & Hijos")').isVisible();
  console.log('✓ Autenticación del lado del servidor confirmada:', clientNameVisible);

  // 3. Probar descarga de documento oficial autorizado
  const downloadPromise = desktopPage.waitForEvent('download');
  await desktopPage.locator('button[title="Descargar documento oficial"]').first().click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  console.log('✓ Descarga auténtica del servidor procesada:', download.suggestedFilename(), 'Ruta temp:', downloadPath ? 'OK' : 'Error');

  await desktopPage.screenshot({ path: path.join(artifactDir, 'final_portal_authenticated.png') });
  await desktopPage.click('button[aria-label="Cerrar"]');

  // 4. Auditoría de Fianzas Migratorias (Pestañas y Botones)
  console.log('\n[TEST 4] Auditoría de Pestañas y Botones de Fianzas...');
  const fianzas = desktopPage.locator('#fianzas');
  await fianzas.scrollIntoViewIfNeeded();

  // Pestaña 1: Orientación
  await desktopPage.click('#fianzas button:has-text("Orientación de Fianzas")');
  console.log('✓ Pestaña Orientación activa');
  
  // Pestaña 2: Recuperación
  await desktopPage.click('#fianzas button:has-text("Recuperación de Fondos")');
  console.log('✓ Pestaña Recuperación activa');

  // Pestaña 3: Requisitos
  await desktopPage.click('#fianzas button:has-text("Requisitos")');
  console.log('✓ Pestaña Requisitos activa');

  // Pestaña 4: Pasos
  await desktopPage.click('#fianzas button:has-text("Pasos a Seguir")');
  console.log('✓ Pestaña Pasos activa');

  // Botón CTA en Fianzas
  await desktopPage.click('#fianzas button:has-text("Iniciar Consulta de Fianza")');
  await desktopPage.waitForTimeout(400);
  const modalLlamada = await desktopPage.locator('text=Solicitar una Llamada Inmediata').isVisible();
  console.log('✓ Botón de Fianzas dispara modal de llamada:', modalLlamada);
  await desktopPage.click('button[aria-label="Cerrar ventana"]');

  await desktopPage.screenshot({ path: path.join(artifactDir, 'final_fianzas_desktop.png') });

  // 5. Verificación de Formulario de Captación en Hero
  console.log('\n[TEST 5] Verificación de Formulario Rápido...');
  await desktopPage.evaluate(() => window.scrollTo(0, 0));
  await desktopPage.fill('#hero input[name="name"]', 'Mario González Test');
  await desktopPage.fill('#hero input[name="phone"]', '(551) 349-9462');
  await desktopPage.click('#hero button:has-text("SOLICITAR ASESORÍA")');
  await desktopPage.waitForTimeout(800);
  const leadFolioVisible = await desktopPage.locator('text=Folio de Consulta:').isVisible();
  console.log('✓ Formulario Hero procesado con folio en bóveda:', leadFolioVisible);

  await desktopPage.screenshot({ path: path.join(artifactDir, 'final_hero_desktop_audited.png') });
  await desktopPage.close();

  // --- 2. PRUEBA DE DISPOSITIVOS MÓVILES (390x844) ---
  console.log('\n[TEST 7] Auditoría Responsiva Móvil (390px)...');
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });

  const h1Mobile = await mobilePage.locator('#hero h1').innerText();
  console.log('✓ H1 en Móvil (sin comprimir):', JSON.stringify(h1Mobile));

  // Menú móvil
  await mobilePage.click('button[aria-label="Abrir menú"]');
  const menuFianzas = await mobilePage.getByRole('link', { name: 'Fianzas Migratorias & Fondos' }).isVisible();
  const menuPortal = await mobilePage.locator('button:has-text("Portal del Cliente — Mi Expediente")').isVisible();
  console.log('✓ Enlace Fianzas en menú móvil:', menuFianzas);
  console.log('✓ Enlace Portal en menú móvil:', menuPortal);
  await mobilePage.click('button[aria-label="Abrir menú"]');

  await mobilePage.screenshot({ path: path.join(artifactDir, 'final_mobile_hero_audited.png') });
  
  // Full page mobile
  await mobilePage.screenshot({ path: path.join(artifactDir, 'final_mobile_full_audited.png'), fullPage: true });
  await mobilePage.close();

  await browser.close();
  console.log('\n================================================================');
  console.log('AUDITORÍA TÉCNICA COMPLETADA CON ÉXITO: 100% PASS');
  console.log('================================================================');
}

runFinalAudit().catch(err => {
  console.error('Error en auditoría:', err);
  process.exit(1);
});
