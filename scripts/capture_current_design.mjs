import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  // 1. Desktop Fullpage
  const ctxDesktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pDesktop = await ctxDesktop.newPage();
  await pDesktop.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
  await pDesktop.waitForTimeout(1000);

  await pDesktop.screenshot({
    path: 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/diseno_final_azul_hero.png',
    clip: { x: 0, y: 0, width: 1440, height: 920 }
  });

  await pDesktop.screenshot({
    path: 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/diseno_final_azul_desktop.png',
    fullPage: true
  });

  // 2. Mobile View
  const ctxMobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const pMobile = await ctxMobile.newPage();
  await pMobile.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
  await pMobile.waitForTimeout(800);

  await pMobile.screenshot({
    path: 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/diseno_final_azul_mobile.png',
    clip: { x: 0, y: 0, width: 390, height: 844 }
  });

  await browser.close();
  console.log('Screenshots captured!');
})();

