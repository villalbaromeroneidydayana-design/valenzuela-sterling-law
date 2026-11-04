import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function captureMore() {
  const browser = await chromium.launch({ executablePath: edgePath });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  console.log('Capturando Hub de Inmigración...');
  await page.goto('https://gallardolawyers.com/es/inmigracion/abogados-de-inmigracion-en-miami', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'gallardo_inmigracion_hub.png'), fullPage: true });

  console.log('Capturando Portal del Cliente...');
  await page.goto('https://gallardolawyers.com/es/portal-del-cliente', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'gallardo_portal_cliente.png'), fullPage: true });

  console.log('Capturando Oficina Miami...');
  await page.goto('https://gallardolawyers.com/es/oficina-en-miami-fl', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'gallardo_oficina_miami.png'), fullPage: true });

  await browser.close();
  console.log('Capturas adicionales guardadas!');
}

captureMore().catch(console.error);

