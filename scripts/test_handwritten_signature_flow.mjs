import fs from 'fs';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const baseUrl = 'http://127.0.0.1:3000';

if (fs.existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
}

console.log('================================================================');
console.log('AUDITORÍA DE INTEGRACIÓN: FIRMA DIGITAL MANUSCRITA EN EL EXPEDIENTE');
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

async function runSignatureAudit() {
  let passed = 0;
  let total = 0;

  function assert(title, condition, detail = '') {
    total++;
    if (condition) {
      console.log(`[PASS] ${title}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title}: ${detail}`);
    }
  }

  // 1. Asegurar estado inicial en Supabase
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

      await sb.from('cases').update({
        access_code_hash: hashPassword('PRUEBA-9002'),
        access_code_masked: 'VS-****-9002',
        is_revoked: false
      }).eq('case_number', 'VS-TEST-2026-9002');

      await sb.from('auth_failed_attempts').delete().in('identifier', ['VS-TEST-2026-9001', 'VS-TEST-2026-9002']);
    }
  } catch(e) {}

  // 2. Login de la Secretaria / Asistente Legal
  console.log('--- 1. AUTENTICACIÓN DEL PERSONAL DE LA FIRMA ---');
  const staffAuth = await request('/api/admin/auth', {
    method: 'POST',
    body: JSON.stringify({
      username: 'asistente@valenzuelasterling.com',
      password: 'VS-Staff#2026!Asistente'
    })
  });
  assert('Personal legal (asistente) inicia sesión correctamente', staffAuth.status === 200 && staffAuth.body.token);
  const staffToken = staffAuth.body.token;

  // 3. La oficina sube un documento PDF y selecciona «Solicitar Firma»
  console.log('\n--- 2. CARGA DE DOCUMENTO CON SOLICITUD DE FIRMA ---');
  
  // Generar un PDF legal formal en memoria
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  page.drawText('VALENZUELA & STERLING IMMIGRATION LAW GROUP, P.A.', { x: 50, y: 720, size: 14, font: fontBold });
  page.drawText('CONTRATO DE RETENCIÓN DE SERVICIOS Y PODER DE REPRESENTACIÓN G-28', { x: 50, y: 690, size: 11, font: fontBold });
  page.drawText('El cliente autoriza al despacho la representación jurídica ante las agencias federales USCIS y EOIR.', { x: 50, y: 660, size: 9.5, font });
  page.drawText('El presente instrumento requiere suscripción manuscrita digitalizada antes de su radicación oficial.', { x: 50, y: 640, size: 9.5, font });
  const pdfBytes = await pdfDoc.save();

  const uploadRes = await request('/api/admin/cases/upload-document', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${staffToken}` },
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001',
      fileName: 'Contrato_Retencion_G28_Asilo.pdf',
      fileType: 'application/pdf',
      fileSize: `${(pdfBytes.length / (1024 * 1024)).toFixed(2)} MB`,
      fileBase64: Buffer.from(pdfBytes).toString('base64'),
      docType: 'Contrato de Servicios Legales & G-28',
      isClientVisible: true,
      requiresSignature: true
    })
  });

  assert('Documento subido a la bóveda con flag de firma requerida', 
    uploadRes.status === 200 && uploadRes.body.document?.requiresSignature === true,
    `Status ${uploadRes.status}`
  );
  const docToSign = uploadRes.body.document;
  const docId = docToSign.id;

  // 4. Cliente A ingresa al portal
  console.log('\n--- 3. PORTAL DE CLIENTES: VISUALIZACIÓN DE PENDIENTE DE FIRMA ---');
  const clientAuth = await request('/api/portal/auth', {
    method: 'POST',
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001',
      accessCode: 'PRUEBA-9001',
      clientConfirm: 'Méndez'
    })
  });
  assert('Cliente A ingresa al portal con Triple Factor', clientAuth.status === 200 && clientAuth.body.token);
  const clientTokenA = clientAuth.body.token;

  const caseRes = await request('/api/portal/case?caseNumber=VS-TEST-2026-9001', {
    headers: { 'Authorization': `Bearer ${clientTokenA}` }
  });
  const clientDocs = caseRes.body.caseRecord?.documents || [];
  const targetDoc = clientDocs.find(d => d.id === docId);

  assert('Cliente A visualiza el documento con aviso «Requiere Firma»', 
    targetDoc && targetDoc.requiresSignature === true && targetDoc.signatureStatus === 'pending',
    `Doc: ${JSON.stringify(targetDoc)}`
  );

  // 5. Intento de firma cruzada por otro cliente (Cliente B intenta firmar doc de Cliente A)
  console.log('\n--- 4. AISLAMIENTO Y SEGURIDAD: INTENTO DE FIRMA CRUZADA ---');
  const clientBAuth = await request('/api/portal/auth', {
    method: 'POST',
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9002',
      accessCode: 'PRUEBA-9002',
      clientConfirm: 'Ramos'
    })
  });
  const clientTokenB = clientBAuth.body.token;

  // Cliente B envía solicitud de firma contra el docId de Cliente A
  const sampleSignaturePng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const illegalSignAttempt = await request('/api/portal/document/sign', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${clientTokenB}` },
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001', // Intenta falsificar número de caso
      docId: docId,
      signaturePngBase64: sampleSignaturePng
    })
  });
  assert('Servidor BLOQUEA con 403 Forbidden intento de firma ajena', 
    illegalSignAttempt.status === 403, 
    `Status ${illegalSignAttempt.status}`
  );

  // 6. Cliente A ejecuta la firma manuscrita legítima
  console.log('\n--- 5. EJECUCIÓN Y REGISTRO DE FIRMA MANUSCRITA ---');
  const legitSignRes = await request('/api/portal/document/sign', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${clientTokenA}` },
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001',
      docId: docId,
      signaturePngBase64: sampleSignaturePng
    })
  });

  assert('Firma manuscrita incorporada exitosamente (200 OK)', 
    legitSignRes.status === 200 && legitSignRes.body.success === true,
    `Status: ${legitSignRes.status}`
  );
  assert('El servidor generó el hash SHA-256 de la copia firmada', Boolean(legitSignRes.body.signedSha256));

  // 7. Verificación del estado en el expediente
  console.log('\n--- 6. VERIFICACIÓN DE CONSTANCIA Y COPIA FIRMADA ---');
  const caseAfterSign = await request('/api/portal/case?caseNumber=VS-TEST-2026-9001', {
    headers: { 'Authorization': `Bearer ${clientTokenA}` }
  });
  const updatedDocs = caseAfterSign.body.caseRecord?.documents || [];
  const originalUpdated = updatedDocs.find(d => d.id === docId);
  const signedCopy = updatedDocs.find(d => d.name === `FIRMADO_${docToSign.name}`);

  assert('El documento original quedó marcado como FIRMADO', 
    originalUpdated && originalUpdated.signatureStatus === 'signed'
  );
  assert('Se incorporó la copia firmada («FIRMADO_...») al expediente del cliente', 
    Boolean(signedCopy)
  );

  // 8. Descarga de la copia firmada por el cliente
  console.log('\n--- 7. DESCARGA AUTORIZADA DE LA COPIA FIRMADA ---');
  const downloadSignedRes = await request('/api/portal/document/download', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${clientTokenA}` },
    body: JSON.stringify({
      caseNumber: 'VS-TEST-2026-9001',
      docId: signedCopy.id
    })
  });

  assert('Cliente puede descargar su documento firmado con foja de constancia', 
    downloadSignedRes.status === 200,
    `Status ${downloadSignedRes.status}`
  );

  // 9. Novedad automática registrada en la línea de tiempo
  const activities = caseAfterSign.body.caseRecord?.activities || [];
  const signActivity = activities.find(a => a.title.includes('Firmado'));
  assert('Se registró la novedad oficial de firma en el historial del caso', Boolean(signActivity));

  // 10. Dashboard del personal refleja el estado firmado
  console.log('\n--- 8. VISUALIZACIÓN EN DASHBOARD DEL PERSONAL ---');
  const staffCaseRes = await request('/api/admin/cases', {
    headers: { 'Authorization': `Bearer ${staffToken}` }
  });
  const staffCase = (staffCaseRes.body.cases || []).find(c => c.caseNumber === 'VS-TEST-2026-9001');
  const staffDocOriginal = (staffCase?.documents || []).find(d => d.id === docId);
  const staffDocSigned = (staffCase?.documents || []).find(d => d.name === `FIRMADO_${docToSign.name}`);

  assert('Personal legal ve estado «Firmado» en el panel administrativo', 
    staffDocOriginal?.signatureStatus === 'signed'
  );
  assert('Personal legal puede acceder a la copia firmada desde el backoffice', 
    Boolean(staffDocSigned)
  );

  console.log('\n================================================================');
  console.log(`RESULTADO DE LA SUITE DE FIRMA: ${passed} de ${total} PRUEBAS SUPERADAS`);
  console.log('================================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSignatureAudit().catch(err => {
  console.error('Error fatal en suite de firma:', err);
  process.exit(1);
});
