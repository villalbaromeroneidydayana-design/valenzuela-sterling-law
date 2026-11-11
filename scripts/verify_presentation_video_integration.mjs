import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = {};

  // 1. DESKTOP TEST
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Tab 1: Hablar con Asesor
  const tab1Button = page.locator('button:has-text("Hablar con Asesor")').first();
  await tab1Button.click();
  await page.waitForTimeout(600);

  // Hero Presentation Video Checks
  const heroVideo = page.locator('div:has(button:has-text("Hablar con Asesor")) video').first();
  await heroVideo.waitFor({ state: 'attached', timeout: 5000 });

  const heroVideoMeta = await heroVideo.evaluate((v) => ({
    currentSrc: v.currentSrc,
    paused: v.paused,
    muted: v.muted,
    loop: v.loop,
    videoWidth: v.videoWidth,
    videoHeight: v.videoHeight,
    aspectRatio: (v.videoWidth / v.videoHeight).toFixed(3),
    readyState: v.readyState
  }));

  // Toggle sound
  const soundButton = page.locator('button:has-text("Activar audio")').first();
  await soundButton.click();
  await page.waitForTimeout(400);

  const heroVideoAfterUnmute = await heroVideo.evaluate((v) => ({
    muted: v.muted
  }));

  // Direct Call & WhatsApp buttons
  const callBtn = page.locator('a[href^="tel:+13146185666"]').first();
  const waBtn = page.locator('a[href^="https://wa.me/13146185666"]').first();
  const callHref = await callBtn.getAttribute('href');
  const waHref = await waBtn.getAttribute('href');

  // Screenshot Tab 1 Desktop
  const screenshotTab1Desktop = path.resolve('C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/evidencia_presentacion_video_tab1_desktop.png');
  await page.screenshot({ path: screenshotTab1Desktop });

  // Tab 2: Dejar mis Datos
  const tab2Button = page.locator('button:has-text("Dejar mis Datos")').first();
  await tab2Button.click();
  await page.waitForTimeout(400);

  const formFields = await page.evaluate(() => {
    return {
      nameInput: !!document.querySelector('input[name="name"]'),
      phoneInput: !!document.querySelector('input[name="phone"]'),
      emailInput: !!document.querySelector('input[name="email"]'),
      caseSelect: !!document.querySelector('select[name="caseType"]'),
      submitButton: !!document.querySelector('button[type="submit"]')
    };
  });

  const screenshotTab2Desktop = path.resolve('C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/evidencia_presentacion_video_tab2_desktop.png');
  await page.screenshot({ path: screenshotTab2Desktop });

  // Section Video Showcase (Corporate Tour 16:9)
  const showcaseSection = page.locator('#video-showcase');
  await showcaseSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const tourVideo = showcaseSection.locator('video').first();
  const tourVideoMeta = await tourVideo.evaluate((v) => ({
    currentSrc: v.currentSrc,
    paused: v.paused,
    muted: v.muted,
    loop: v.loop,
    videoWidth: v.videoWidth,
    videoHeight: v.videoHeight,
    aspectRatio: (v.videoWidth / v.videoHeight).toFixed(3),
    readyState: v.readyState
  }));

  const screenshotTourDesktop = path.resolve('C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/evidencia_tour_corporativo_coexistencia.png');
  await showcaseSection.screenshot({ path: screenshotTourDesktop });

  // 2. MOBILE TEST
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobilePage.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  const mobileTab1 = mobilePage.locator('button:has-text("Hablar con Asesor")').first();
  await mobileTab1.click();
  await mobilePage.waitForTimeout(500);

  const mobileHeroVideo = mobilePage.locator('div:has(button:has-text("Hablar con Asesor")) video').first();
  const mobileHeroVideoMeta = await mobileHeroVideo.evaluate((v) => ({
    videoWidth: v.videoWidth,
    videoHeight: v.videoHeight,
    paused: v.paused,
    muted: v.muted
  }));

  const screenshotTab1Mobile = path.resolve('C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/evidencia_presentacion_video_tab1_mobile.png');
  await mobilePage.screenshot({ path: screenshotTab1Mobile });

  const mobileTab2 = mobilePage.locator('button:has-text("Dejar mis Datos")').first();
  await mobileTab2.click();
  await mobilePage.waitForTimeout(400);

  const screenshotTab2Mobile = path.resolve('C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/evidencia_presentacion_video_tab2_mobile.png');
  await mobilePage.screenshot({ path: screenshotTab2Mobile });

  results.desktop = {
    heroPresentationVideo: heroVideoMeta,
    unmutedAfterClick: !heroVideoAfterUnmute.muted,
    callLink: callHref,
    whatsAppLink: waHref,
    formIntact: formFields,
    corporateTourVideo: tourVideoMeta
  };
  results.mobile = {
    heroPresentationVideo: mobileHeroVideoMeta
  };

  console.log('VERIFICATION_RESULTS:', JSON.stringify(results, null, 2));

  await browser.close();
})();
