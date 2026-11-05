import { createApiMiddleware } from '../server/apiMiddleware.js';
import http from 'http';

const middleware = createApiMiddleware();
const server = http.createServer((req, res) => {
  middleware(req, res, () => {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  });
});

async function runTest() {
  await new Promise(resolve => server.listen(3099, resolve));
  const baseUrl = 'http://127.0.0.1:3099';

  console.log('================================================================');
  console.log('INICIANDO PRUEBAS DE AISLAMIENTO, BACKOFFICE Y SEGURIDAD REFORZADA');
  console.log('================================================================\n');

  let testsPassed = 0;
  let totalTests = 0;

  // Idempotencia: Resetear claves iniciales de prueba tanto en local como en Supabase
  try {
    const fs = await import('fs');
    const path = await import('path');
    const vaultPath = path.resolve(process.cwd(), 'server_data/cases_vault.jsonl');
    if (fs.existsSync(vaultPath)) {
      const lines = fs.readFileSync(vaultPath, 'utf8').split('\n').filter(l => l.trim().length > 0);
      const resetLines = lines.map(l => {
        try {
          const parsed = JSON.parse(l);
          if (parsed.caseNumber === 'VS-TEST-2026-9001') {
            parsed.accessCode = 'PRUEBA-9001';
            parsed.isRevoked = false;
          }
          if (parsed.caseNumber === 'VS-TEST-2026-9002') {
            parsed.accessCode = 'PRUEBA-9002';
            parsed.isRevoked = false;
          }
          return JSON.stringify(parsed);
        } catch(e) { return l; }
      });
      fs.writeFileSync(vaultPath, resetLines.join('\n') + '\n', 'utf8');
    }

    const { createClient } = await import('@supabase/supabase-js');
    const { hashPassword } = await import('../server/securityCrypto.js');
    if (fs.existsSync('.env.local')) {
      process.loadEnvFile('.env.local');
    }
    const sbUrl = process.env.SUPABASE_URL || 'https://splwobultffizbzwvtsn.supabase.co';
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (sbKey) {
      const sb = createClient(sbUrl, sbKey);
      await sb.from('cases').update({
        access_code_hash: hashPassword('PRUEBA-9001'),
        access_code_masked: 'VS-****-9001',
        is_revoked: false
      }).eq('case_number', 'VS-TEST-2026-9001');

      await sb.from('cases').update({
        access_code_hash: hashPassword('PRUEBA-9002'),
        access_code_masked: 'VS-****-9002',
        is_revoked: false
      }).eq('case_number', 'VS-TEST-2026-9002');

      await sb.from('auth_failed_attempts').delete().in('identifier', ['VS-TEST-2026-9001', 'VS-TEST-2026-9002']);
    }
  } catch(e) {}

  async function request(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (e) {}
    return { status: res.status, headers: res.headers, body: json || text };
  }

  // --- PRUEBA 1: Login de Administrador del Personal ---
  totalTests++;
  console.log('1. Probando Login Administrativo del Personal...');
  const adminBad = await request('/api/admin/auth', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'WrongPassword' })
  });
  const adminOk = await request('/api/admin/auth', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin@valenzuelasterling.com', password: 'V&S-Legal#2026$ProtectVault!' })
  });

  if (adminBad.status === 401 && adminOk.status === 200 && adminOk.body.token) {
    console.log('✓ ÉXITO: Acceso administrativo protegido. Token obtenido:', adminOk.body.token.slice(0, 20) + '...');
    testsPassed++;
  } else {
    console.error('✗ FALLO en autenticación administrativa');
  }

  const adminToken = adminOk.body.token;

  // --- PRUEBA 2: Consulta de Bóveda Completa desde Backoffice ---
  totalTests++;
  console.log('\n2. Consultando listado de expedientes desde Backoffice...');
  const casesListRes = await request('/api/admin/cases', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  if (casesListRes.status === 200 && casesListRes.body.total >= 3) {
    console.log(`✓ ÉXITO: Backoffice recuperó ${casesListRes.body.total} expedientes registrados.`);
    testsPassed++;
  } else {
    console.error('✗ FALLO al recuperar expedientes desde backoffice');
  }

  // --- PRUEBA 3: Creación de Expediente por la Firma con Clave Criptográfica ---
  totalTests++;
  console.log('\n3. Creando expediente nuevo desde Backoffice...');
  const createCaseRes = await request('/api/admin/cases/create', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      clientName: 'Fernando',
      clientLastName: 'Gutiérrez',
      clientPhone: '(551) 349-9005',
      service: 'Defensa de Asilo Político EOIR',
      attorneyAssigned: 'Abogado Titular de Guardia'
    })
  });

  if (createCaseRes.status === 200 && createCaseRes.body.caseRecord?.accessCode?.startsWith('VS-')) {
    console.log('✓ ÉXITO: Expediente creado:', createCaseRes.body.caseRecord.caseNumber);
    console.log('  Clave Criptográfica de 8 caracteres asignada:', createCaseRes.body.caseRecord.accessCode);
    testsPassed++;
  } else {
    console.error('✗ FALLO creando caso desde backoffice');
  }

  // --- PRUEBA 4: Autenticación Triple Factor del Cliente A (Ficticio VS-TEST-2026-9001) ---
  totalTests++;
  console.log('\n4. Probando Autenticación de Cliente A (VS-TEST-2026-9001)...');
  
  // A. Con factor de confirmación erróneo
  const clientWrongFactor = await request('/api/portal/auth', {
    method: 'POST',
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001',
      accessCode: 'PRUEBA-9001',
      clientConfirm: 'ApellidoIncorrecto'
    })
  });

  // B. Con factor de confirmación correcto (Méndez o 9001)
  const clientAuthA = await request('/api/portal/auth', {
    method: 'POST',
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001',
      accessCode: 'PRUEBA-9001',
      clientConfirm: 'Méndez'
    })
  });

  if (clientWrongFactor.status === 401 && clientAuthA.status === 200 && clientAuthA.body.token) {
    console.log('✓ ÉXITO: Triple Factor validado. Sesión emitida para Cliente A.');
    testsPassed++;
  } else {
    console.error('✗ FALLO en autenticación triple factor');
  }

  const tokenClienteA = clientAuthA.body.token;

  // --- PRUEBA 5: Intrusión Cruzada — Cliente A intenta consultar expediente de Cliente B ---
  totalTests++;
  console.log('\n5. Prueba de Intrusión Cruzada: Cliente A intenta leer expediente de Cliente B...');
  const crossQuery = await request('/api/portal/case?caseNumber=VS-TEST-2026-9002', {
    headers: { 'Authorization': `Bearer ${tokenClienteA}` }
  });

  if (crossQuery.status === 403) {
    console.log('✓ ÉXITO: Servidor bloqueó la consulta con 403 Forbidden (Aislamiento Criptográfico Estricto).');
    testsPassed++;
  } else {
    console.error('✗ FALLO: El servidor permitió la consulta cruzada! Status:', crossQuery.status);
  }

  // --- PRUEBA 6: Descarga Cruzada — Cliente A intenta descargar documento de Cliente B ---
  totalTests++;
  console.log('\n6. Prueba de Descarga Cruzada: Cliente A intenta descargar doc-test-9002 (de Cliente B)...');
  const crossDownload = await request('/api/portal/document/download', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenClienteA}` },
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9002', // Expediente B
      docId: 'doc-test-9002'
    })
  });

  if (crossDownload.status === 403) {
    console.log('✓ ÉXITO: Servidor bloqueó la descarga con 403 Forbidden.');
    testsPassed++;
  } else {
    console.error('✗ FALLO: Se permitió la descarga no autorizada! Status:', crossDownload.status);
  }

  // --- PRUEBA 7: Novedad Publicada desde Backoffice y Vista en Tiempo Real ---
  totalTests++;
  console.log('\n7. Backoffice publica novedad en expediente de Cliente B...');
  const postActivity = await request('/api/portal/crm/activity', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9002',
      activityTitle: 'Notificación de Admisión Formal Registrada',
      activityDescription: 'El equipo legal radicó las formas iniciales ante el oficial de caso.',
      nextDeadline: 'Revisión Biométrica: 10 Diciembre 2026'
    })
  });

  // Cliente B se autentica y consulta su caso
  const clientAuthB = await request('/api/portal/auth', {
    method: 'POST',
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9002',
      accessCode: 'PRUEBA-9002',
      clientConfirm: 'Ramos'
    })
  });

  const bCase = await request('/api/portal/case?caseNumber=VS-TEST-2026-9002', {
    headers: { 'Authorization': `Bearer ${clientAuthB.body.token}` }
  });

  const hasNewActivity = (bCase.body.caseRecord?.activities || []).some(a => a.title.includes('Notificación de Admisión Formal'));

  if (postActivity.status === 200 && hasNewActivity) {
    console.log('✓ ÉXITO: Novedad publicada desde el backoffice y reflejada inmediatamente en el portal de Cliente B.');
    testsPassed++;
  } else {
    console.error('✗ FALLO en sincronización de novedad');
  }

  // --- PRUEBA 8: Revocación Inmediata de Acceso desde Backoffice ---
  totalTests++;
  console.log('\n8. Backoffice revoca el acceso a Cliente A...');
  const revokeRes = await request('/api/admin/cases/revoke-access', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001',
      revoke: true
    })
  });

  // Cliente A intenta usar su token previo
  const tokenUseAfterRevoke = await request('/api/portal/case?caseNumber=VS-TEST-2026-9001', {
    headers: { 'Authorization': `Bearer ${tokenClienteA}` }
  });

  // Cliente A intenta hacer login nuevamente
  const loginAfterRevoke = await request('/api/portal/auth', {
    method: 'POST',
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001',
      accessCode: 'PRUEBA-9001',
      clientConfirm: 'Méndez'
    })
  });

  if (revokeRes.status === 200 && (tokenUseAfterRevoke.status === 403) && (loginAfterRevoke.status === 403)) {
    console.log('✓ ÉXITO: Acceso revocado en caliente. Sesión anterior destruida y nuevo login bloqueado.');
    testsPassed++;
  } else {
    console.error('✗ FALLO en revocación de acceso');
  }

  // --- PRUEBA 9: Restablecimiento de Clave y Reactivación ---
  totalTests++;
  console.log('\n9. Backoffice restablece clave y reactiva el acceso para Cliente A...');
  const resetRes = await request('/api/admin/cases/reset-code', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ caseNumber: 'VS-TEST-2026-9001' })
  });

  const unrevokeRes = await request('/api/admin/cases/revoke-access', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ caseNumber: 'VS-TEST-2026-9001', revoke: false })
  });

  const newCode = resetRes.body.newAccessCode;

  // Cliente A ingresa con su clave nueva
  const loginWithNewCode = await request('/api/portal/auth', {
    method: 'POST',
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001',
      accessCode: newCode,
      clientConfirm: 'Méndez'
    })
  });

  if (resetRes.status === 200 && unrevokeRes.status === 200 && loginWithNewCode.status === 200 && loginWithNewCode.body.token) {
    console.log(`✓ ÉXITO: Clave restablecida a «${newCode}». Cliente A reingresó exitosamente.`);
    testsPassed++;
  } else {
    console.error('✗ FALLO al restablecer clave o reactivar');
  }

  console.log('\n================================================================');
  console.log(`RESULTADO DE LA SUITE: ${testsPassed} de ${totalTests} PRUEBAS SUPERADAS SATISFACTORIAMENTE`);
  console.log('================================================================\n');

  // Limpieza de casos generados dinámicamente en el test
  try {
    const fs = await import('fs');
    const path = await import('path');
    const vaultPath = path.resolve(process.cwd(), 'server_data/cases_vault.jsonl');
    if (fs.existsSync(vaultPath)) {
      const lines = fs.readFileSync(vaultPath, 'utf8').split('\n').filter(l => l.trim().length > 0);
      const cleaned = lines.filter(l => {
        try {
          const parsed = JSON.parse(l);
          return parsed.caseNumber === 'VS-CAS-2026-0842' || parsed.caseNumber.startsWith('VS-TEST-');
        } catch(e) { return true; }
      });
      fs.writeFileSync(vaultPath, cleaned.join('\n') + '\n', 'utf8');
    }
  } catch(e) {}

  server.close();
  process.exit(testsPassed === totalTests ? 0 : 1);
}

runTest().catch(err => {
  console.error('Error fatal ejecutando suite:', err);
  process.exit(1);
});

