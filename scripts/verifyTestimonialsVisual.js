import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  
  // 1. Desktop Check
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });

  const testSection = desktopPage.locator('#testimonios');
  await testSection.scrollIntoViewIfNeeded();
  await desktopPage.waitForTimeout(1000);

  // Take screenshot
  await testSection.screenshot({
    path: 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/screenshot_testimonios_desktop.png'
  });
  console.log('Saved screenshot_testimonios_desktop.png');

  // Verify images loaded without error
  const images = await desktopPage.locator('#testimonios img').all();
  console.log(`Found ${images.length} testimonial images.`);
  for (let i = 0; i < images.length; i++) {
    const naturalWidth = await images[i].evaluate(img => img.naturalWidth);
    const naturalHeight = await images[i].evaluate(img => img.naturalHeight);
    const src = await images[i].getAttribute('src');
    console.log(`Image ${i + 1} (${src}): ${naturalWidth}x${naturalHeight}`);
  }

  // 2. Mobile Check
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });

  const mobileSection = mobilePage.locator('#testimonios');
  await mobileSection.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(1000);

  await mobileSection.screenshot({
    path: 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e/screenshot_testimonios_mobile.png'
  });
  console.log('Saved screenshot_testimonios_mobile.png');

  await browser.close();
  console.log('All testimonial visual checks completed successfully!');
})();

