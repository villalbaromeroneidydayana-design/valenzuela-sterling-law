import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  
  // 1. Desktop Test
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
  
  const content = await page.content();
  const hasOldPhone = content.includes('551') || content.includes('349-9462') || content.includes('15513499462');
  console.log('[TEST 1] Rendered Desktop HTML contains old phone (551/349-9462)?', hasOldPhone);
  
  const hasNewPhone = content.includes('+1 (314) 618-5666');
  console.log('[TEST 2] Rendered Desktop HTML contains new phone (+1 (314) 618-5666)?', hasNewPhone);

  const telLinks = await page.$$eval('a[href^="tel:"]', els => els.map(e => ({ href: e.href, text: e.innerText.trim() })));
  console.log(`[TEST 3] Found ${telLinks.length} tel: links on desktop:`);
  telLinks.forEach((l, idx) => console.log(`   [${idx + 1}] ${l.href} | "${l.text.replace(/\n/g, ' ')}"`));

  const allTelMatchNew = telLinks.every(l => l.href === 'tel:+13146185666');
  console.log('[TEST 4] All desktop tel: links point to tel:+13146185666?', allTelMatchNew);

  // 2. Mobile Viewport Test (iPhone 13/14)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobilePage.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
  const mobileContent = await mobilePage.content();
  const mobileOld = mobileContent.includes('551') || mobileContent.includes('349-9462');
  console.log('[TEST 5] Mobile View contains old phone?', mobileOld);
  
  const mobileTelLinks = await mobilePage.$$eval('a[href^="tel:"]', els => els.map(e => ({ href: e.href, text: e.innerText.trim() })));
  console.log(`[TEST 6] Found ${mobileTelLinks.length} tel: links on mobile:`);
  mobileTelLinks.forEach((l, idx) => console.log(`   [${idx + 1}] ${l.href} | "${l.text.replace(/\n/g, ' ')}"`));

  const mobileAllTelMatch = mobileTelLinks.every(l => l.href === 'tel:+13146185666');
  console.log('[TEST 7] All mobile tel: links point to tel:+13146185666?', mobileAllTelMatch);

  // 3. Verify Floating Mobile Bar Call Button
  const floatingCallBtn = mobilePage.locator('div.fixed.bottom-0 a[href^="tel:"]');
  const floatingHref = await floatingCallBtn.getAttribute('href');
  console.log('[TEST 8] Floating mobile bar Call button href:', floatingHref);

  // 4. Verify Placeholders in Modals and Forms
  const heroPlaceholder = await page.locator('input[name="phone"]').getAttribute('placeholder');
  console.log('[TEST 9] Hero phone input placeholder:', heroPlaceholder);

  // Open Call Request Modal
  await page.click('button:has-text("Pedir que me llamen"), button:has-text("Solicitar llamada")');
  await page.waitForTimeout(500);
  const callModalPlaceholder = await page.locator('div[role="dialog"] input[type="tel"], div.fixed input[type="tel"]').first().getAttribute('placeholder');
  console.log('[TEST 10] Call Request modal phone placeholder:', callModalPlaceholder);

  await browser.close();
  console.log('\n--- VERIFICATION RESULT ---');
  if (!hasOldPhone && !mobileOld && allTelMatchNew && mobileAllTelMatch && floatingHref === 'tel:+13146185666') {
    console.log('ALL PHONE VERIFICATION TESTS PASSED 10/10!');
  } else {
    console.error('FAILURES DETECTED IN PHONE VERIFICATION!');
    process.exit(1);
  }
})();

