import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  
  // 1. Desktop Test (1440x900)
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  console.log('Navigating to http://127.0.0.1:3000/ ...');
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });

  // Pestaña 1: Hablar con Asesor
  console.log('\n--- VERIFICANDO PESTAÑA 1 (HABLAR CON ASESOR) ---');
  const advisorBtn = page.locator('button:has-text("Hablar con Asesor")');
  await advisorBtn.click();
  await page.waitForTimeout(600);

  // Check 9:16 Video
  const videoEl = page.locator('#hero video');
  const videoState = await videoEl.evaluate(v => ({
    src: v.currentSrc,
    paused: v.paused,
    muted: v.muted,
    loop: v.loop,
    videoWidth: v.videoWidth,
    videoHeight: v.videoHeight
  }));
  console.log('[TEST 1] Video vertical en Hero:', videoState);

  // Check Call and WhatsApp Buttons
  const callBtn = page.locator('#hero a[href^="tel:"]').first();
  const callHref = await callBtn.getAttribute('href');
  console.log('[TEST 2] Botón Llamar href:', callHref);

  const waBtn = page.locator('#hero a[href*="wa.me"]').first();
  const waHref = await waBtn.getAttribute('href');
  console.log('[TEST 3] Botón WhatsApp href:', waHref);

  // Check 3 pillars pills
  const pillsText = await page.locator('#hero div:has-text("🏛️ Inmigración")').first().innerText();
  console.log('[TEST 4] Pastillas de 3 áreas detectadas:', pillsText.replace(/\n/g, ' '));

  // Take Desktop Screenshot Tab 1
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'evidencia_hero_tab1_asesor_desktop.png') });
  console.log('[EVIDENCE] Saved evidencia_hero_tab1_asesor_desktop.png');

  // Pestaña 2: Dejar mis Datos
  console.log('\n--- VERIFICANDO PESTAÑA 2 (DEJAR MIS DATOS) ---');
  const formTabBtn = page.locator('button:has-text("Dejar mis Datos")');
  await formTabBtn.click();
  await page.waitForTimeout(600);

  const nameInput = page.locator('#hero input[name="name"]');
  const phoneInput = page.locator('#hero input[name="phone"]');
  const submitBtn = page.locator('#hero button[type="submit"]');

  const hasForm = await nameInput.isVisible() && await phoneInput.isVisible() && await submitBtn.isVisible();
  console.log('[TEST 5] Formulario confidencial visible y completo:', hasForm);

  // Take Desktop Screenshot Tab 2
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'evidencia_hero_tab2_formulario_desktop.png') });
  console.log('[EVIDENCE] Saved evidencia_hero_tab2_formulario_desktop.png');

  // 2. Mobile Viewport Test (iPhone 13/14: 390x844)
  console.log('\n--- VERIFICANDO VISTA MÓVIL ---');
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobilePage.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });

  // Mobile Tab 1
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'evidencia_hero_tab1_asesor_mobile.png') });
  console.log('[EVIDENCE] Saved evidencia_hero_tab1_asesor_mobile.png');

  // Mobile Tab 2
  await mobilePage.locator('button:has-text("Dejar mis Datos")').click();
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'evidencia_hero_tab2_formulario_mobile.png') });
  console.log('[EVIDENCE] Saved evidencia_hero_tab2_formulario_mobile.png');

  await browser.close();

  const success = callHref === 'tel:+13146185666' && waHref.includes('wa.me/13146185666') && hasForm && !videoState.paused;
  console.log('\n--- RESULTADO FINAL DE VALIDACIÓN ---');
  if (success) {
    console.log('>>> TODAS LAS PRUEBAS DEL SELECTOR DUAL PASARON 100% EXITOSAMENTE <<<');
  } else {
    console.error('>>> FALLOS EN LA VERIFICACIÓN <<<');
    process.exit(1);
  }
})();

