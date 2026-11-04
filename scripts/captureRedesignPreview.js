import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  // 1. Desktop Fullpage
  const ctxDesktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pDesktop = await ctxDesktop.newPage();
  await pDesktop.goto('http://127.0.0.1:3000/?preview=redesign', { waitUntil: 'networkidle' });
  await pDesktop.waitForTimeout(1000);

  await pDesktop.screenshot({
    path: 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/propuesta_visual_desktop_hero.png',
    clip: { x: 0, y: 0, width: 1440, height: 920 }
  });
  console.log('Saved propuesta_visual_desktop_hero.png');

  await pDesktop.screenshot({
    path: 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/propuesta_visual_desktop_full.png',
    fullPage: true
  });
  console.log('Saved propuesta_visual_desktop_full.png');

  // 2. Mobile View
  const ctxMobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const pMobile = await ctxMobile.newPage();
  await pMobile.goto('http://127.0.0.1:3000/?preview=redesign', { waitUntil: 'networkidle' });
  await pMobile.waitForTimeout(800);

  await pMobile.screenshot({
    path: 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/propuesta_visual_mobile_hero.png',
    clip: { x: 0, y: 0, width: 390, height: 844 }
  });
  console.log('Saved propuesta_visual_mobile_hero.png');

  await pMobile.screenshot({
    path: 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/propuesta_visual_mobile_full.png',
    fullPage: true
  });
  console.log('Saved propuesta_visual_mobile_full.png');

  await browser.close();
  console.log('All redesign preview screenshots captured successfully!');
})();

