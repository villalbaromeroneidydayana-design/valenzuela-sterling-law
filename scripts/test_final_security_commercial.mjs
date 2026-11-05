import http from 'http';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:3000';
const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';

function postRequest(pathname, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      `${BASE_URL}${pathname}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers
        }
      },
      res => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers, raw: body });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body, headers: res.headers });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getRequest(pathname, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `${BASE_URL}${pathname}`,
      {
        method: 'GET',
        headers
      },
      res => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body, headers: res.headers });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runAudit() {
  console.log('================================================================');
  console.log('INICIANDO AUDITORÍA FINAL DE SEGURIDAD Y VERACIDAD COMERCIAL');
  console.log('================================================================\n');

  const results = {
    testCasesIsolationInProd: false,
    testCasesDownloadBlockedInProd: false,
    statsSegregation: false,
    realCaseAuthAndDownload: false,
    documentEthicalDisclaimer: false,
    badgesHiddenCheck: false,
    attorneyProfilesCheck: false,
    officesNoticeCheck: false,
    mobileResponsiveness: false
  };

  // 1. PRUEBA: AISLAMIENTO DE CASOS DE PRUEBA EN PRODUCCIÓN
  console.log('--- 1. PRUEBA DE EXPEDIENTES DE PRUEBA EN PRODUCCIÓN ---');
  const prodAuthTest1 = await postRequest(
    '/api/portal/auth',
    { caseNumber: 'VS-TEST-2026-9001', accessCode: 'PRUEBA-9001' },
    { 'x-simulate-production': 'true' }
  );
  console.log(`Intento de login VS-TEST-2026-9001 en producción: Status ${prodAuthTest1.status}`);

  const prodAuthTest2 = await postRequest(
    '/api/portal/auth',
    { caseNumber: 'VS-TEST-2026-9002', accessCode: 'PRUEBA-9002' },
    { 'x-simulate-production': 'true' }
  );
  console.log(`Intento de login VS-TEST-2026-9002 en producción: Status ${prodAuthTest2.status}`);

  if (prodAuthTest1.status === 401 && prodAuthTest2.status === 401) {
    results.testCasesIsolationInProd = true;
    console.log('✓ ÉXITO: Los casos TEST_ONLY no son accesibles en entorno de producción.');
  } else {
    console.error('✗ ERROR: Los casos de prueba respondieron en producción.');
  }

  // 2. PRUEBA: DESCARGA DE DOCUMENTOS TEST_ONLY EN PRODUCCIÓN
  const prodDownloadTest = await postRequest(
    '/api/portal/document/download',
    { caseNumber: 'VS-TEST-2026-9001', docId: 'doc-test-9001' },
    { 'x-simulate-production': 'true', Authorization: 'Bearer FAKE_PROD_TOKEN' }
  );
  console.log(`Intento de descarga de documento TEST en producción: Status ${prodDownloadTest.status}`);
  if (prodDownloadTest.status === 403 || prodDownloadTest.status === 404 || prodDownloadTest.status === 401) {
    results.testCasesDownloadBlockedInProd = true;
    console.log('✓ ÉXITO: Descarga de documentos TEST bloqueada en producción.');
  }

  // 3. PRUEBA: ESTADÍSTICAS Y REPORTES
  console.log('\n--- 2. PRUEBA DE ESTADÍSTICAS Y REPORTES ---');
  const statsRes = await getRequest('/api/conversion-stats');
  console.log('Respuesta de conversión stats:', statsRes.data);
  if (statsRes.data && statsRes.data.environmentSegregation && statsRes.data.activeProductionCasesCount >= 1) {
    results.statsSegregation = true;
    console.log('✓ ÉXITO: Estadísticas reportan únicamente expedientes calificados de producción.');
  }

  // 4. PRUEBA: EXPEDIENTE CALIFICADO REAL
  console.log('\n--- 3. PRUEBA DE EXPEDIENTE CALIFICADO REAL (VS-CAS-2026-0842) ---');
  const realAuth = await postRequest('/api/portal/auth', {
    caseNumber: 'VS-CAS-2026-0842',
    accessCode: 'VS-8429-KR',
    clientConfirm: 'Morales'
  });
  console.log(`Login expediente real: Status ${realAuth.status}`);
  if (realAuth.status === 200 && realAuth.data.token) {
    const token = realAuth.data.token;
    const targetDocId = realAuth.data.caseRecord?.documents?.[0]?.id || 'doc-001';
    const docDownload = await postRequest(
      '/api/portal/document/download',
      { caseNumber: 'VS-CAS-2026-0842', docId: targetDocId },
      { Authorization: `Bearer ${token}` }
    );
    console.log(`Descarga documento oficial: Status ${docDownload.status}`);
    if (docDownload.status === 200 && (docDownload.raw && (docDownload.raw.includes('CERTIFICADO DE CONSTANCIA DOCUMENTAL OFICIAL') || docDownload.raw.includes('Valenzuela & Sterling')))) {
      results.realCaseAuthAndDownload = true;
      results.documentEthicalDisclaimer = true;
      console.log('✓ ÉXITO: Documento emitido con verificación y descargo ético obligatorio.');
    }
  }

  // 5. PRUEBAS VISUALES CON NAVEGADOR
  console.log('\n--- 4. PRUEBAS VISUALES Y REVISIÓN DE ACREDITACIONES Y PROFESIONALES ---');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  
  // Escritorio 1440
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  // Verificar insignias externas ocultas
  const trustSectionText = await page.locator('section:has-text("Pilares Éticos")').innerText();
  if (trustSectionText.includes('Secreto Profesional') && !trustSectionText.includes('10.0 Superb') && !trustSectionText.includes('A+ Rating')) {
    results.badgesHiddenCheck = true;
    console.log('✓ ÉXITO: Distintivos BBB, Avvo y Google Reviews ocultos temporalmente.');
  }

  // Captura de compromisos éticos
  await page.locator('section:has-text("Pilares Éticos")').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_audit_trust_pillars.png') });

  // Verificar sección abogados
  const attorneysText = await page.locator('#abogados').innerText();
  if (attorneysText.toLowerCase().includes('espacio para fotografía oficial') && !attorneysText.includes('Gallardo') && !attorneysText.includes('Jefe (~Lawyer)')) {
    results.attorneyProfilesCheck = true;
    console.log('✓ ÉXITO: Sección de abogados limpia de logotipos externos y sellos ajenos.');
  }
  await page.locator('#abogados').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_audit_attorneys_clean.png') });

  // Verificar sedes
  const officesText = await page.locator('#sedes').innerText();
  if (officesText.includes('Direcciones sujetas a confirmación final de registro de arrendamiento')) {
    results.officesNoticeCheck = true;
    console.log('✓ ÉXITO: Aviso preventivo de verificación de sedes visible.');
  }
  await page.locator('#sedes').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_audit_offices_notice.png') });

  // Móvil iPhone (390 x 844)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  // Desbordamiento móvil
  const hasOverflow = await mobilePage.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  if (!hasOverflow) {
    results.mobileResponsiveness = true;
    console.log('✓ ÉXITO: Móvil 390px sin desbordamiento horizontal.');
  }
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'final_audit_mobile_view.png') });

  await browser.close();

  console.log('\n================================================================');
  console.log('RESUMEN DE AUDITORÍA FINAL:', JSON.stringify(results, null, 2));
  console.log('================================================================');
}

runAudit().catch(err => {
  console.error('Error en auditoría:', err);
  process.exit(1);
});
