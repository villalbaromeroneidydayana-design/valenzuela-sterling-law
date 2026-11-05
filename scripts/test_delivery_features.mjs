import fs from 'fs';

const baseUrl = 'http://127.0.0.1:3000';

if (fs.existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
}

console.log('================================================================');
console.log('INICIANDO AUDITORÍA INTEGRAL DE ENTREGA DEFINITIVA');
console.log('Valenzuela & Sterling Immigration Law Group, P.A.');
console.log('================================================================\n');

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

async function runAudit() {
  let passed = 0;
  let total = 0;

  // Idempotencia: Asegurar claves de prueba en Supabase
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const { hashPassword } = await import('../server/securityCrypto.js');
    const sbUrl = process.env.SUPABASE_URL || 'https://splwobultffizbzwvtsn.supabase.co';
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (sbKey) {
      const sb = createClient(sbUrl, sbKey);
      await sb.from('cases').update({
        access_code_hash: hashPassword('PRUEBA-9001'),
        access_code_masked: 'VS-****-9001',
        is_revoked: false
      }).eq('case_number', 'VS-TEST-2026-9001');

      await sb.from('auth_failed_attempts').delete().eq('identifier', 'VS-TEST-2026-9001');
    }
  } catch(e) {}

  function assert(title, condition, detail = '') {
    total++;
    if (condition) {
      console.log(`[PASS] ${title}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title}: ${detail}`);
    }
  }

  // 1. Login Administrador Maestro (Director Jurídico)
  console.log('--- 1. AUTENTICACIÓN Y ROLES DEL PERSONAL ---');
  const adminLogin = await request('/api/admin/auth', {
    method: 'POST',
    body: JSON.stringify({
      username: 'admin@valenzuelasterling.com',
      password: 'V&S-Legal#2026$ProtectVault!'
    })
  });
  assert('Login de Abogado Director Maestro (admin)', 
    adminLogin.status === 200 && adminLogin.body.user?.role === 'admin',
    `Status ${adminLogin.status}`
  );
  const adminToken = adminLogin.body.token;

  // 2. Login Asistente Legal / Secretaria
  const staffLogin = await request('/api/admin/auth', {
    method: 'POST',
    body: JSON.stringify({
      username: 'asistente@valenzuelasterling.com',
      password: 'VS-Staff#2026!Asistente'
    })
  });
  assert('Login de Asistente Legal / Secretaria (staff)', 
    staffLogin.status === 200 && staffLogin.body.user?.role === 'assistant',
    `Status ${staffLogin.status}`
  );
  const assistantToken = staffLogin.body.token;

  // 3. Verificación de Permisos RBAC
  console.log('\n--- 2. CONTROL DE ACCESO BASADO EN ROLES (RBAC) ---');
  const assistantRevokeAttempt = await request('/api/admin/cases/revoke-access', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${assistantToken}` },
    body: JSON.stringify({ caseNumber: 'VS-TEST-2026-9001', revoke: true })
  });
  assert('Asistente Legal NO puede revocar expedientes (403)', 
    assistantRevokeAttempt.status === 403, 
    `Status ${assistantRevokeAttempt.status}`
  );

  const assistantResetCodeAttempt = await request('/api/admin/cases/reset-code', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${assistantToken}` },
    body: JSON.stringify({ caseNumber: 'VS-TEST-2026-9001' })
  });
  assert('Asistente Legal NO puede resetear claves de clientes (403)', 
    assistantResetCodeAttempt.status === 403, 
    `Status ${assistantResetCodeAttempt.status}`
  );

  // 4. Edición de Expediente Existente
  console.log('\n--- 3. EDICIÓN Y GESTIÓN DE EXPEDIENTES ---');
  const updateRes = await request('/api/admin/cases/update', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001',
      clientName: 'Carlos Alberto',
      clientLastName: 'Méndez',
      service: 'Defensa de Asilo ante Corte EOIR & Asilo Afirmativo',
      status: 'Documentación Preliminar Radicada ante el Secretario de Corte',
      nextDeadline: 'Audiencia Preliminar EOIR: 18 Diciembre 2026'
    })
  });
  assert('Edición de datos de expediente por la firma', 
    updateRes.status === 200 && updateRes.body.caseRecord?.clientName === 'Carlos Alberto Méndez',
    `Status ${updateRes.status}`
  );

  // 5. Carga de Archivos Reales y Diferenciación de Privacidad
  console.log('\n--- 4. BÓVEDA DOCUMENTAL Y SEGREGACIÓN DE PRIVACIDAD ---');
  
  // Archivo 1: Documento PÚBLICO para el cliente (Visible)
  const samplePdfBytes = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n140\n%%EOF');
  const uploadPublicDoc = await request('/api/admin/cases/upload-document', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001',
      fileName: 'Copia_Recibo_USCIS_Publico.pdf',
      fileType: 'application/pdf',
      fileSize: '0.25 MB',
      fileBase64: samplePdfBytes.toString('base64'),
      docType: 'Notice of Action / Recibo I-797C',
      isClientVisible: true
    })
  });
  assert('Subida de documento visible para el cliente', 
    uploadPublicDoc.status === 200 && uploadPublicDoc.body.document?.isClientVisible === true,
    `Status ${uploadPublicDoc.status}`
  );
  const publicDocId = uploadPublicDoc.body.document?.id;

  // Archivo 2: Documento PRIVADO CONFIDENCIAL de uso interno de la firma
  const samplePrivateNotes = Buffer.from('NOTAS CONFIDENCIALES INTERNAS DEL ABOGADO: Evaluación de estrategia procesal.');
  const uploadPrivateDoc = await request('/api/admin/cases/upload-document', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001',
      fileName: 'Notas_Estrategia_Privadas_Firma.txt',
      fileType: 'text/plain',
      fileSize: '0.05 MB',
      fileBase64: samplePrivateNotes.toString('base64'),
      docType: 'Expediente Administrativo Interno FOIA',
      isClientVisible: false
    })
  });
  assert('Subida de documento privado/confidencial de la firma', 
    uploadPrivateDoc.status === 200 && uploadPrivateDoc.body.document?.isClientVisible === false,
    `Status ${uploadPrivateDoc.status}`
  );
  const privateDocId = uploadPrivateDoc.body.document?.id;

  // 6. Portal de Clientes: Verificación de Aislamiento y Visibilidad
  console.log('\n--- 5. PORTAL DE CLIENTES: VISIBILIDAD ESTRICTA ---');
  const clientAuth = await request('/api/portal/auth', {
    method: 'POST',
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001',
      accessCode: 'PRUEBA-9001',
      clientConfirm: 'Méndez'
    })
  });
  assert('Cliente ingresa exitosamente con Triple Factor', 
    clientAuth.status === 200 && clientAuth.body.token,
    `Status ${clientAuth.status}`
  );
  const clientToken = clientAuth.body.token;

  // Consulta del caso desde el cliente
  const clientCase = await request('/api/portal/case?caseNumber=VS-TEST-2026-9001', {
    headers: { 'Authorization': `Bearer ${clientToken}` }
  });
  const clientDocs = clientCase.body.caseRecord?.documents || [];
  const sawPublic = clientDocs.some(d => d.id === publicDocId);
  const sawPrivate = clientDocs.some(d => d.id === privateDocId);

  assert('Cliente VE el documento autorizado/público', sawPublic, 'No se visualiza');
  assert('Cliente NO VE el documento privado/interno de la firma', !sawPrivate, 'Se expuso documento privado!');

  // Intento malicioso del cliente de forzar descarga del archivo privado
  const clientIllegalDownload = await request('/api/portal/document/download', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${clientToken}` },
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001',
      docId: privateDocId
    })
  });
  assert('Descarga de documento privado rechazada al cliente con 403 Forbidden', 
    clientIllegalDownload.status === 403, 
    `Status ${clientIllegalDownload.status}`
  );

  // Descarga del documento público autorizado
  const clientLegalDownload = await request('/api/portal/document/download', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${clientToken}` },
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001',
      docId: publicDocId
    })
  });
  assert('Descarga de documento autorizado permitida al cliente (200 OK)', 
    clientLegalDownload.status === 200, 
    `Status ${clientLegalDownload.status}`
  );

  // 7. Retiro / Eliminación de Documento por la Firma
  console.log('\n--- 6. RETIRO DE ARCHIVOS DE LA BÓVEDA ---');
  const deleteDocRes = await request('/api/admin/cases/document/delete', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001',
      docId: privateDocId
    })
  });
  assert('Abogado Director puede retirar documentos de la bóveda', 
    deleteDocRes.status === 200, 
    `Status ${deleteDocRes.status}`
  );

  // 8. Resumen Final
  console.log('\n================================================================');
  console.log(`AUDITORÍA INTEGRAL DE ENTREGA: ${passed}/${total} verificaciones superadas`);
  console.log('================================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAudit().catch(err => {
  console.error('Error fatal durante la auditoría:', err);
  process.exit(1);
});

