import { chromium } from 'playwright';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  const b = await chromium.launch({ executablePath: edgePath });
  const p = await b.newPage();

  // Lawyers page structure
  await p.goto('https://gallardolawyers.com/es/abogados', { waitUntil: 'load', timeout: 30000 });
  const lawyers = await p.$$eval('h2, h3, h4, strong', els => els.map(e => e.innerText.trim()).filter(t => t.length > 5 && t.length < 60));

  // Portal structure
  await p.goto('https://gallardolawyers.com/es/portal-del-cliente', { waitUntil: 'load', timeout: 30000 });
  const portalText = await p.$eval('body', el => el.innerText.slice(0, 800));

  // Videos structure
  await p.goto('https://gallardolawyers.com/es/videos', { waitUntil: 'load', timeout: 30000 });
  const videoFrames = await p.$$eval('iframe', els => els.map(e => e.getAttribute('src')));
  const videoHeadings = await p.$$eval('h2, h3, h4', els => els.map(e => e.innerText.trim()).filter(Boolean));

  console.log('--- LAWYERS ---');
  console.log(JSON.stringify(lawyers.slice(0, 15), null, 2));

  console.log('--- PORTAL ---');
  console.log(portalText.replace(/\n+/g, ' '));

  console.log('--- VIDEOS IFRAMES ---');
  console.log(JSON.stringify(videoFrames, null, 2));
  console.log('--- VIDEOS HEADINGS ---');
  console.log(JSON.stringify(videoHeadings.slice(0, 15), null, 2));

  await b.close();
}

main().catch(console.error);

