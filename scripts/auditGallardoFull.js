import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  console.log('--- INICIANDO AUDITORÍA TOTAL DE GALLARDO LAW FIRM ---');
  const browser = await chromium.launch({
    executablePath: edgePath,
    headless: true
  });

  const auditReport = {
    timestamp: new Date().toISOString(),
    baseUrl: 'https://gallardolawyers.com',
    home: {},
    navigationMenu: [],
    subpages: {},
    designSystem: {},
    forms: {},
    multimedia: {},
    locations: [],
    attorneys: []
  };

  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0'
  });
  const page = await context.newPage();

  // 1. HOME ES
  console.log('1. Visitando Portada Oficial en Español (https://gallardolawyers.com/es)...');
  try {
    await page.goto('https://gallardolawyers.com/es', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(3000);

    const homeTitle = await page.title();
    const homeMetaDesc = await page.$eval('meta[name="description"]', el => el.getAttribute('content')).catch(() => '');

    auditReport.home = {
      title: homeTitle,
      metaDescription: homeMetaDesc,
      url: page.url()
    };

    // Fullpage screenshot Home Desktop
    const homeScreenshotPath = path.join(ARTIFACT_DIR, 'gallardo_home_es_full.png');
    await page.screenshot({ path: homeScreenshotPath, fullPage: true });
    console.log('Captura Home Desktop guardada en:', homeScreenshotPath);

    // Above-the-fold screenshot
    const homeAboveFold = path.join(ARTIFACT_DIR, 'gallardo_home_above_fold.png');
    await page.screenshot({ path: homeAboveFold });

    // Extract Design Tokens from computed styles
    console.log('Extrayendo sistema de diseño (colores, tipografías)...');
    auditReport.designSystem = await page.evaluate(() => {
      const bodyStyles = window.getComputedStyle(document.body);
      const h1 = document.querySelector('h1');
      const h1Styles = h1 ? window.getComputedStyle(h1) : null;
      const primaryBtn = document.querySelector('a.btn, button.btn, a[href*="evaluacion"], a[href*="contacto"]');
      const btnStyles = primaryBtn ? window.getComputedStyle(primaryBtn) : null;

      // Extract colors used in header / hero
      const header = document.querySelector('header') || document.querySelector('.header') || document.querySelector('nav');
      const headerStyles = header ? window.getComputedStyle(header) : null;

      return {
        bodyFont: bodyStyles.fontFamily,
        bodyBg: bodyStyles.backgroundColor,
        bodyColor: bodyStyles.color,
        h1Font: h1Styles ? h1Styles.fontFamily : '',
        h1Size: h1Styles ? h1Styles.fontSize : '',
        h1Weight: h1Styles ? h1Styles.fontWeight : '',
        h1Color: h1Styles ? h1Styles.color : '',
        btnBg: btnStyles ? btnStyles.backgroundColor : '',
        btnColor: btnStyles ? btnStyles.color : '',
        headerBg: headerStyles ? headerStyles.backgroundColor : ''
      };
    });

    // Extract Navigation Menus and submenus
    console.log('Extrayendo menú principal y submenús...');
    auditReport.navigationMenu = await page.evaluate(() => {
      const navLinks = Array.from(document.querySelectorAll('header a, nav a, .menu a, .navbar a'));
      return navLinks.map(a => ({
        text: a.innerText.trim(),
        href: a.href,
        parent: a.parentElement ? a.parentElement.tagName : ''
      })).filter(item => item.text.length > 0 && !item.href.startsWith('javascript'));
    });

    // Extract Top Form
    console.log('Extrayendo formulario superior...');
    auditReport.forms.topForm = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return null;
      const inputs = Array.from(form.querySelectorAll('input, select, textarea')).map(i => ({
        tag: i.tagName.toLowerCase(),
        name: i.name || i.id,
        type: i.type || '',
        placeholder: i.placeholder || '',
        required: i.required
      }));
      const submitBtn = form.querySelector('button, input[type="submit"]');
      return {
        action: form.action,
        method: form.method,
        inputs,
        submitText: submitBtn ? submitBtn.innerText.trim() : ''
      };
    });

  } catch (err) {
    console.error('Error cargando portada:', err.message);
  }

  // 2. EXPLORAR PÁGINA DE INMIGRACIÓN
  console.log('2. Visitando sección de Inmigración...');
  const immigrationUrls = [
    'https://gallardolawyers.com/es/areas-de-practica/inmigracion',
    'https://gallardolawyers.com/es/inmigracion',
    'https://gallardolawyers.com/es/abogados-de-inmigracion'
  ];
  let immSuccess = false;
  for (const url of immigrationUrls) {
    try {
      console.log(`Intentando: ${url}`);
      const resp = await page.goto(url, { waitUntil: 'load', timeout: 15000 });
      if (resp && resp.status() === 200) {
        await page.waitForTimeout(2000);
        const immScreenshot = path.join(ARTIFACT_DIR, 'gallardo_inmigracion_page.png');
        await page.screenshot({ path: immScreenshot, fullPage: true });
        console.log('Captura Inmigración guardada en:', immScreenshot);

        auditReport.subpages.inmigracion = {
          url: page.url(),
          title: await page.title(),
          headings: await page.$$eval('h1, h2, h3', els => els.map(e => e.innerText.trim()).filter(Boolean).slice(0, 15)),
          paragraphs: await page.$$eval('p', els => els.map(e => e.innerText.trim()).filter(Boolean).slice(0, 5))
        };
        immSuccess = true;
        break;
      }
    } catch (e) {
      console.log(`Fallo intento en ${url}: ${e.message}`);
    }
  }

  // 3. EXPLORAR PÁGINA DE ABOGADOS
  console.log('3. Visitando directorio de Abogados...');
  const attorneyUrls = [
    'https://gallardolawyers.com/es/abogados',
    'https://gallardolawyers.com/es/equipo',
    'https://gallardolawyers.com/es/nuestros-abogados'
  ];
  for (const url of attorneyUrls) {
    try {
      console.log(`Intentando: ${url}`);
      const resp = await page.goto(url, { waitUntil: 'load', timeout: 15000 });
      if (resp && resp.status() === 200) {
        await page.waitForTimeout(2000);
        const lawyersScreenshot = path.join(ARTIFACT_DIR, 'gallardo_abogados_directory.png');
        await page.screenshot({ path: lawyersScreenshot, fullPage: true });
        console.log('Captura Abogados guardada en:', lawyersScreenshot);

        auditReport.subpages.abogados = {
          url: page.url(),
          title: await page.title(),
          teamMembers: await page.$$eval('.team-member, .lawyer-card, .attorney, h2, h3', els => els.map(e => e.innerText.trim()).filter(t => t.length > 3 && t.length < 80).slice(0, 15))
        };
        break;
      }
    } catch (e) {
      console.log(`Fallo intento en ${url}: ${e.message}`);
    }
  }

  // 4. EXPLORAR FAQS & VIDEOS
  console.log('4. Visitando FAQs y Videos...');
  try {
    const respFaq = await page.goto('https://gallardolawyers.com/es/faqs', { waitUntil: 'load', timeout: 15000 });
    if (respFaq && respFaq.status() === 200) {
      await page.waitForTimeout(1500);
      const faqScreenshot = path.join(ARTIFACT_DIR, 'gallardo_faqs_page.png');
      await page.screenshot({ path: faqScreenshot, fullPage: true });
      auditReport.subpages.faqs = {
        url: page.url(),
        title: await page.title(),
        questions: await page.$$eval('h3, h4, .accordion-title, .faq-question', els => els.map(e => e.innerText.trim()).filter(Boolean).slice(0, 10))
      };
    }
  } catch (e) {
    console.log('Faq error:', e.message);
  }

  try {
    const respVid = await page.goto('https://gallardolawyers.com/es/videos', { waitUntil: 'load', timeout: 15000 });
    if (respVid && respVid.status() === 200) {
      await page.waitForTimeout(1500);
      const vidScreenshot = path.join(ARTIFACT_DIR, 'gallardo_videos_page.png');
      await page.screenshot({ path: vidScreenshot, fullPage: true });
      auditReport.subpages.videos = {
        url: page.url(),
        title: await page.title(),
        videoTitles: await page.$$eval('iframe, video, h3, .video-card', els => els.map(e => e.innerText || e.getAttribute('src') || '').filter(Boolean).slice(0, 10))
      };
    }
  } catch (e) {
    console.log('Video error:', e.message);
  }

  // 5. MOBILE AUDIT
  console.log('5. Capturando vista móvil (iPhone 12 / 390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  try {
    await mobilePage.goto('https://gallardolawyers.com/es', { waitUntil: 'load', timeout: 20000 });
    await mobilePage.waitForTimeout(2000);
    const mobileScreenshot = path.join(ARTIFACT_DIR, 'gallardo_mobile_full.png');
    await mobilePage.screenshot({ path: mobileScreenshot, fullPage: true });
    console.log('Captura Mobile guardada en:', mobileScreenshot);
  } catch (e) {
    console.log('Mobile error:', e.message);
  }

  // 6. ENLACE PORTAL & EXTERNOS
  console.log('6. Identificando Portal de Clientes...');
  auditReport.portal = await page.evaluate(() => {
    const portalLink = document.querySelector('a[href*="portal"], a[href*="client"], a:has-text("Portal")');
    return portalLink ? { text: portalLink.innerText.trim(), href: portalLink.href } : null;
  });

  await browser.close();

  // Guardar reporte bruto JSON
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'auditoria_gallardo_raw.json'), JSON.stringify(auditReport, null, 2), 'utf8');
  console.log('--- AUDITORÍA FINALIZADA CON ÉXITO ---');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

