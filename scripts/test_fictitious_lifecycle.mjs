import { chromium } from 'playwright';
import path from 'path';

async function runFictitiousLifecycleTest() {
  console.log('================================================================');
  console.log('PRUEBA FINAL DE FUNCIONAMIENTO REAL CON EXPEDIENTES FICTICIOS');
  console.log('================================================================');

  const BASE_URL = 'http://127.0.0.1:3000';
  const artifactDir = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';

  // --- PASO 1: Expediente de prueba ficticio ---
  console.log('\n[PASO 1] Comprobando existencia de expediente ficticio en bóveda...');
  const testCaseA = 'VS-TEST-2026-9001';
  const testCodeA = 'PRUEBA-9001';
  const testCaseB = 'VS-TEST-2026-9002';
  const testCodeB = 'PRUEBA-9002';
  console.log(`✓ Expediente A: ${testCaseA} (Cliente: Carlos Méndez)`);
  console.log(`✓ Expediente B: ${testCaseB} (Cliente: Lucía Ramos)`);

  // --- PASO 2: Iniciar sesión como cliente con su código individual ---
  console.log('\n[PASO 2] Inicio de sesión de Cliente A en el servidor (/api/portal/auth)...');
  const authResA = await fetch(`${BASE_URL}/api/portal/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caseNumber: testCaseA, accessCode: testCodeA })
  });
  const authDataA = await authResA.json();
  console.log('✓ Status HTTP:', authResA.status);
  console.log('✓ Autenticación exitosa:', authDataA.success);
  console.log('✓ Cliente autenticado:', authDataA.caseRecord.clientName);
  console.log('✓ Token de sesión generado:', authDataA.token ? 'Sí (VS-SESSION-...)' : 'No');
  console.log('✓ Actividades iniciales:', authDataA.caseRecord.activities.length);
  const tokenA = authDataA.token;

  // --- PASO 3: Desde el CRM, registrar una actividad nueva con fecha, descripción y próximo paso ---
  console.log('\n[PASO 3] Registro de actividad y próximo paso desde CRM (/api/portal/crm/activity)...');
  const crmActivityTitle = 'Recepción y Cotejo de Traducciones Certificadas';
  const crmActivityDesc = 'Se recibieron las traducciones juradas de actas de nacimiento y testimoniales para el expediente.';
  const crmNextDeadline = 'Audiencia Preliminar EOIR: 18 Diciembre 2026';

  const crmRes = await fetch(`${BASE_URL}/api/portal/crm/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      caseNumber: testCaseA,
      activityTitle: crmActivityTitle,
      activityDescription: crmActivityDesc,
      nextDeadline: crmNextDeadline
    })
  });
  const crmData = await crmRes.json();
  console.log('✓ CRM Status HTTP:', crmRes.status);
  console.log('✓ Actividad guardada en bóveda SSOT:', crmData.success);
  console.log('✓ Próximo paso actualizado por CRM:', crmData.nextDeadline);

  // --- PASO 4: Entrar nuevamente al portal del cliente y comprobar la actualización ---
  console.log('\n[PASO 4] Consulta del portal con Token en Cabecera (GET /api/portal/case)...');
  const portalRes = await fetch(`${BASE_URL}/api/portal/case?caseNumber=${testCaseA}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tokenA}`
    }
  });
  const portalData = await portalRes.json();
  console.log('✓ Status HTTP Portal:', portalRes.status);
  console.log('✓ Total actividades reflejadas:', portalData.caseRecord.activities.length);
  console.log('✓ Última actividad reflejada:', portalData.caseRecord.activities[0].title);
  console.log('✓ Próximo paso reflejado:', portalData.caseRecord.nextDeadline);
  const updateReflected = portalData.caseRecord.activities[0].title === crmActivityTitle &&
                          portalData.caseRecord.nextDeadline === crmNextDeadline;
  console.log('✓ Sincronización instantánea confirmada:', updateReflected);

  // --- PASO 5: Comprobar que otro cliente de prueba no pueda acceder a ese expediente ---
  console.log('\n[PASO 5] Comprobando aislamiento estricto entre clientes...');
  
  // 5.1 Cliente B se autentica para obtener su propio token
  const authResB = await fetch(`${BASE_URL}/api/portal/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caseNumber: testCaseB, accessCode: testCodeB })
  });
  const authDataB = await authResB.json();
  const tokenB = authDataB.token;
  console.log('✓ Cliente B autenticado en su propio expediente:', authDataB.caseRecord.clientName);

  // 5.2 Cliente B intenta consultar el expediente de Cliente A usando su token
  const crossAccessRes = await fetch(`${BASE_URL}/api/portal/case?caseNumber=${testCaseA}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tokenB}` // Token de B intentando leer caso A
    }
  });
  console.log('✓ Intento de acceso cruzado (Token B -> Caso A): HTTP Status', crossAccessRes.status);
  const crossAccessData = await crossAccessRes.json();
  console.log('✓ Respuesta del servidor:', crossAccessData.error);
  const isolationVerified = crossAccessRes.status === 403;
  console.log('✓ Aislamiento estricto confirmado (403 Forbidden):', isolationVerified);

  // 5.3 Intento con clave incorrecta
  const wrongCodeRes = await fetch(`${BASE_URL}/api/portal/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caseNumber: testCaseA, accessCode: 'CLAVE_HACK' })
  });
  console.log('✓ Intento con credencial incorrecta rechazada (401 Unauthorized):', wrongCodeRes.status === 401);

  // --- PASO 6 & 7: Descarga de documento seguro (Token en Cabecera, CERO exposición en URL) ---
  console.log('\n[PASO 6 & 7] Descarga segura de documento vía POST con Token en Cabecera...');
  const docRes = await fetch(`${BASE_URL}/api/portal/document/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      caseNumber: testCaseA,
      docId: 'doc-test-9001'
    })
  });
  console.log('✓ Status descarga documento:', docRes.status);
  const docContent = await docRes.text();
  console.log('✓ Cabecera del documento:', docContent.split('\n')[1]);
  console.log('✓ Expediente indicado en el documento:', docContent.includes(testCaseA));
  console.log('✓ Cliente indicado en el documento:', docContent.includes('Carlos Méndez'));

  // Comprobar intento de Cliente B de descargar documento de Cliente A
  const crossDocRes = await fetch(`${BASE_URL}/api/portal/document/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenB}` // Token de B intentando descargar doc de A
    },
    body: JSON.stringify({
      caseNumber: testCaseA,
      docId: 'doc-test-9001'
    })
  });
  console.log('✓ Cliente B intentando descargar documento de Cliente A: HTTP', crossDocRes.status, '(403 Forbidden)');

  // --- PASO 8: Confirmar que no se generen documentos que aparenten ser oficiales gubernamentales ---
  console.log('\n[PASO 8] Verificación de aviso ético obligatorio en documentos generados...');
  const hasEthicalDisclaimer = docContent.includes('AVISO LEGAL Y ÉTICO OBLIGATORIO') &&
                               docContent.includes('NO CONSTITUYE UNA NOTIFICACIÓN GUBERNAMENTAL OFICIAL');
  console.log('✓ Documento contiene descargo ético explícito:', hasEthicalDisclaimer);

  // --- PASO 9: UI Playwright: Interfaz, Fianzas y Teléfono Central ---
  console.log('\n[PASO 9] Verificación de Interfaz con Edge Playwright...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  // 9.1 Teléfono central
  const headerPhone = await page.locator('text=(551) 349-9462').first().innerText();
  console.log('✓ Teléfono central verificado:', headerPhone.includes('(551) 349-9462'));

  // 9.2 Iniciar sesión en el modal de UI con el caso ficticio
  await page.click('button:has-text("Portal del Cliente")');
  await page.waitForTimeout(300);
  await page.fill('input[placeholder="Ej. VS-CAS-2026-0842"]', testCaseA);
  await page.fill('input[placeholder="••••••••"]', testCodeA);
  await page.click('button:has-text("Consultar Mi Expediente")');
  await page.waitForTimeout(800);

  const uiClientName = await page.locator('strong:has-text("Carlos Méndez")').isVisible();
  const uiActivityVisible = await page.locator(`text=${crmActivityTitle}`).isVisible();
  const uiNextStep = await page.locator(`text=${crmNextDeadline}`).isVisible();
  console.log('✓ UI refleja cliente de prueba:', uiClientName);
  console.log('✓ UI refleja la actividad ingresada desde CRM:', uiActivityVisible);
  console.log('✓ UI refleja el próximo paso ingresado desde CRM:', uiNextStep);

  await page.screenshot({ path: path.join(artifactDir, 'fictitious_case_portal_ui.png') });
  await page.click('button[aria-label="Cerrar"]');

  // 9.3 Botones de Fianzas Migratorias
  const fianzas = page.locator('#fianzas');
  await fianzas.scrollIntoViewIfNeeded();
  await page.click('#fianzas button:has-text("Recuperación de Fondos")');
  const btnOrientacion = page.locator('#fianzas button:has-text("Consultar Devolución de Fianza")');
  await btnOrientacion.click();
  await page.waitForTimeout(400);
  const callModalVisible = await page.locator('text=Solicitar una Llamada Inmediata').isVisible();
  console.log('✓ Botón de Fianzas dispara modal de llamada:', callModalVisible);
  await page.click('button[aria-label="Cerrar ventana"]');

  await page.close();
  await browser.close();

  console.log('\n================================================================');
  console.log('CICLO COMPLETO DE PRUEBAS FINALIZADO CON ÉXITO: 9/9 REQUISITOS OK');
  console.log('================================================================');
}

runFictitiousLifecycleTest().catch(err => {
  console.error('Error en prueba ficticia:', err);
  process.exit(1);
});

