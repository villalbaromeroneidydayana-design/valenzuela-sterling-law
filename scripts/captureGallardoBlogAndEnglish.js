import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function captureMoreDeep() {
  const browser = await chromium.launch({ executablePath: edgePath });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  console.log('1. Capturando Blog de Gallardo...');
  await page.goto('https://gallardolawyers.com/es/blog', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'gallardo_blog_full.png'), fullPage: true });

  const firstArticleLink = await page.$eval('article a, .blog-card a, .post-item a, h2 a, h3 a', a => a.href).catch(() => null);
  console.log('Primer artículo encontrado:', firstArticleLink);

  if (firstArticleLink && firstArticleLink.startsWith('http')) {
    console.log('Capturando artículo individual...');
    await page.goto(firstArticleLink, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'gallardo_articulo_detalle.png'), fullPage: true });
  }

  console.log('2. Capturando versión en Inglés (https://gallardolawyers.com/)...');
  await page.goto('https://gallardolawyers.com/', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'gallardo_home_en_full.png'), fullPage: true });

  console.log('3. Capturando perfil individual de abogado...');
  await page.goto('https://gallardolawyers.com/es/abogados', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2000);
  const firstLawyerLink = await page.$eval('a[href*="/abogados/"], .team-member a, .lawyer a', a => a.href).catch(() => null);
  console.log('Primer perfil de abogado:', firstLawyerLink);
  if (firstLawyerLink && firstLawyerLink.startsWith('http')) {
    await page.goto(firstLawyerLink, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'gallardo_abogado_perfil.png'), fullPage: true });
  }

  await browser.close();
  console.log('Todas las capturas profundas completadas!');
}

captureMoreDeep().catch(console.error);

