import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function extract() {
  const browser = await chromium.launch({ executablePath: edgePath });
  const page = await browser.newPage();
  await page.goto('https://gallardolawyers.com/es', { waitUntil: 'load', timeout: 30000 });

  const data = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors.map(a => ({
      text: a.innerText.trim(),
      href: a.href,
      classes: a.className
    })).filter(a => a.text.length > 0 && !a.href.startsWith('javascript'));
  });

  console.log(`Total enlaces extraídos: ${data.length}`);
  fs.writeFileSync('gallardo_links.json', JSON.stringify(data, null, 2), 'utf8');

  // Find immigration links specifically
  const immLinks = data.filter(d => /inmigra/i.test(d.text) || /inmigra/i.test(d.href));
  console.log('Enlaces de inmigración:', immLinks);

  // Find portal link
  const portalLinks = data.filter(d => /portal/i.test(d.text) || /portal/i.test(d.href) || /client/i.test(d.href));
  console.log('Enlaces de portal:', portalLinks);

  // Find locations links
  const locLinks = data.filter(d => /ubicaci/i.test(d.text) || /miami/i.test(d.text) || /hialeah/i.test(d.text) || /houston/i.test(d.text));
  console.log('Enlaces de ubicaciones:', locLinks);

  await browser.close();
}

extract().catch(console.error);

