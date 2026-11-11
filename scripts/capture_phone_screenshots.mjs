import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  
  // 1. Desktop Screenshot: Header & Hero
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'evidencia_telefono_desktop_hero.png') });
  console.log('Saved evidencia_telefono_desktop_hero.png');

  // 2. Desktop Screenshot: Office Locations
  const officesSec = page.locator('#sedes');
  if (await officesSec.count() > 0) {
    await officesSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'evidencia_telefono_sedes.png') });
    console.log('Saved evidencia_telefono_sedes.png');
  }

  // 3. Desktop Screenshot: Footer
  const footerSec = page.locator('footer');
  await footerSec.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'evidencia_telefono_footer.png') });
  console.log('Saved evidencia_telefono_footer.png');

  // 4. Mobile Screenshot: Floating Bar & Hero
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobilePage.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'evidencia_telefono_mobile.png') });
  console.log('Saved evidencia_telefono_mobile.png');

  await browser.close();
  console.log('Screenshots captured successfully.');
})();

