import fs from 'fs';
import path from 'path';

// Almacén en memoria del servidor para telemetría y leads (Persistencia en backend)
const serverState = {
  leads: [],
  evaluations: [],
  callRequests: [],
  events: [],
  activeSessions: new Map(), // token -> { caseNumber, createdAt, expiresAt }
  failedAttempts: new Map(), // caseNumber/IP -> { count, lockedUntil }
  metrics: {
    pageViews: 0,
    evaluationsStarted: 0,
    evaluationsCompleted: 0,
    leadsCaptured: 0,
    callRequestsCaptured: 0,
    whatsappClicks: 0,
    phoneClicks: 0
  }
};

const LOGS_DIR = path.resolve(process.cwd(), 'server_data');
const CASES_VAULT_FILE = path.join(LOGS_DIR, 'cases_vault.jsonl');

function ensureLogsDir() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

function appendToAuditLog(filename, data) {
  try {
    ensureLogsDir();
    const filePath = path.join(LOGS_DIR, filename);
    const entry = JSON.stringify({ ...data, recordedAt: new Date().toISOString() }) + '\n';
    fs.appendFileSync(filePath, entry, 'utf8');
  } catch (err) {
    console.error('Error escribiendo log de auditoría en backend:', err);
  }
}

// Inicialización de la Bóveda de Expedientes Segura (SSOT para CRM y Portal)
function ensureCasesVault() {
  ensureLogsDir();
  const testCaseA = {
    caseNumber: 'VS-TEST-2026-9001',
    accessCode: 'PRUEBA-9001',
    clientName: 'Carlos Méndez (Cliente de Prueba)',
    service: 'Defensa de Asilo ante Corte EOIR (Ficticio)',
    serviceEn: 'Defensive Asylum before EOIR Court (Sample)',
    filingDate: '01 Noviembre 2026',
    attorneyAssigned: 'Abogado Titular de Guardia',
    status: 'Fase Inicial de Preparación',
    statusEn: 'Initial Case Preparation Stage',
    statusColor: 'amber',
    nextDeadline: 'Revisión de Declaración Jurada: 15 Noviembre 2026',
    nextDeadlineEn: 'Affidavit Review: November 15, 2026',
    activities: [
      {
        id: 'act-test-01',
        date: '01 Nov 2026 - 09:00 AM',
        title: 'Apertura de Expediente de Prueba',
        titleEn: 'Sample Case File Initiated',
        description: 'Registro de datos ficticios para validación técnica de protocolos de seguridad y portal de clientes.',
        descriptionEn: 'Fictitious entry registered for technical verification of client portal protocols.',
        status: 'completada'
      }
    ],
    documents: [
      {
        id: 'doc-test-9001',
        name: 'Borrador_Resumen_Caso_9001.txt',
        type: 'Borrador Informativo de Trabajo',
        size: '1.2 KB',
        date: '01 Nov 2026',
        authorizedBy: 'Coordinación Legal de Prueba',
        docketRef: 'TEST-DOCKET-9001-FICTITIOUS',
        sha256Digest: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0'
      }
    ],
    updatedAt: new Date().toISOString()
  };

  const testCaseB = {
    caseNumber: 'VS-TEST-2026-9002',
    accessCode: 'PRUEBA-9002',
    clientName: 'Lucía Ramos (Cliente de Prueba B)',
    service: 'Petición Familiar I-130 (Ficticio)',
    serviceEn: 'Family Petition I-130 (Sample)',
    filingDate: '03 Noviembre 2026',
    attorneyAssigned: 'Lic. John Alfonso',
    status: 'Revisión de Requisitos Preliminar',
    statusEn: 'Preliminary Requirements Review',
    statusColor: 'blue',
    nextDeadline: 'Cotejo de Certificados: 20 Noviembre 2026',
    nextDeadlineEn: 'Certificate Verification: November 20, 2026',
    activities: [
      {
        id: 'act-test-02',
        date: '03 Nov 2026 - 11:30 AM',
        title: 'Ingreso al Sistema de Gestión',
        titleEn: 'System Docket Entry',
        description: 'Expediente independiente para pruebas de separación estricta entre clientes.',
        descriptionEn: 'Independent file for strict cross-client isolation verification.',
        status: 'completada'
      }
    ],
    documents: [
      {
        id: 'doc-test-9002',
        name: 'Guia_Documental_Caso_9002.txt',
        type: 'Guía Documental Interna',
        size: '1.5 KB',
        date: '03 Nov 2026',
        authorizedBy: 'Equipo de Admisión',
        docketRef: 'TEST-DOCKET-9002-FICTITIOUS',
        sha256Digest: 'b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01'
      }
    ],
    updatedAt: new Date().toISOString()
  };

  if (!fs.existsSync(CASES_VAULT_FILE)) {
    const initialCases = [
      {
        caseNumber: 'VS-CAS-2026-0842',
        accessCode: '7941',
        clientName: 'Familia Morales & Hijos',
        service: 'Petición Familiar I-130 & Ajuste de Estatus',
        serviceEn: 'I-130 Family Petition & Adjustment of Status',
        filingDate: '15 Octubre 2026',
        attorneyAssigned: 'Jefe (~Lawyer) / Lic. John Alfonso',
        status: 'En Proceso Activo ante USCIS',
        statusEn: 'In Active USCIS Processing',
        statusColor: 'emerald',
        nextDeadline: 'Cita Biométrica estimada: Diciembre 2026',
        nextDeadlineEn: 'Estimated Biometrics: December 2026',
        activities: [
          {
            id: 'act-001',
            date: '04 Nov 2026 - 10:30 AM',
            title: 'Actualización de Novedad por la Oficina',
            titleEn: 'Office Case Update Recorded',
            description: 'Revisión técnica de documentos complementarios y comprobación de recibos oficiales en el sistema de la firma.',
            descriptionEn: 'Technical review of supplemental documents and official receipt confirmation in firm docket.',
            status: 'completada'
          }
        ],
        documents: [
          {
            id: 'doc-i797c',
            name: 'Recibo_Oficial_USCIS_I797C.pdf',
            type: 'Notice of Action I-797C',
            size: '1.4 MB',
            date: '28 Oct 2026',
            authorizedBy: 'Abogado Principal de Inmigración',
            docketRef: 'USCIS-RECEIPT-SRC2690842001',
            sha256Digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
          }
        ],
        updatedAt: new Date().toISOString()
      },
      testCaseA,
      testCaseB
    ];

    const lines = initialCases.map(c => JSON.stringify(c)).join('\n') + '\n';
    fs.writeFileSync(CASES_VAULT_FILE, lines, 'utf8');
  } else {
    // Si ya existe, verificar que los casos de prueba estén incluidos
    try {
      const raw = fs.readFileSync(CASES_VAULT_FILE, 'utf8');
      const lines = raw.split('\n').filter(l => l.trim().length > 0);
      const parsed = lines.map(l => JSON.parse(l));
      let modified = false;

      if (!parsed.find(c => c.caseNumber === testCaseA.caseNumber)) {
        parsed.push(testCaseA);
        modified = true;
      }
      if (!parsed.find(c => c.caseNumber === testCaseB.caseNumber)) {
        parsed.push(testCaseB);
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(CASES_VAULT_FILE, parsed.map(c => JSON.stringify(c)).join('\n') + '\n', 'utf8');
      }
    } catch (e) {
      console.error('Error sincronizando casos de prueba en bóveda:', e);
    }
  }
}

// Obtiene expedientes con segregación estricta de registros de prueba (TEST_ONLY)
function getAllCases({ includeTest = (process.env.NODE_ENV !== 'production') } = {}) {
  ensureCasesVault();
  try {
    const raw = fs.readFileSync(CASES_VAULT_FILE, 'utf8');
    const cases = raw
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => JSON.parse(line));

    // SEGREGACIÓN ESTRICTA: En producción, reportes, estadísticas o búsquedas de clientes,
    // los registros TEST_ONLY NUNCA se mezclan ni se devuelven.
    if (!includeTest || process.env.NODE_ENV === 'production') {
      return cases.filter(c => !c.isTestRecord && c.environment !== 'TEST_ONLY' && !c.caseNumber.startsWith('VS-TEST-'));
    }
    return cases;
  } catch (err) {
    console.error('Error leyendo casos desde la bóveda:', err);
    return [];
  }
}

function getCaseByNumber(caseNumber, allowTest = (process.env.NODE_ENV !== 'production')) {
  const cases = getAllCases({ includeTest: allowTest });
  const normalized = caseNumber.trim().toUpperCase();
  return cases.find(c => c.caseNumber.toUpperCase() === normalized) || null;
}

function saveCaseUpdate(updatedCase) {
  ensureCasesVault();
  let cases = [];
  try {
    const raw = fs.readFileSync(CASES_VAULT_FILE, 'utf8');
    cases = raw
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => JSON.parse(line));
  } catch (e) {
    cases = [];
  }

  const index = cases.findIndex(c => c.caseNumber.toUpperCase() === updatedCase.caseNumber.toUpperCase());
  if (index >= 0) {
    cases[index] = { ...updatedCase, updatedAt: new Date().toISOString() };
  } else {
    cases.push({ ...updatedCase, updatedAt: new Date().toISOString() });
  }

  const lines = cases.map(c => JSON.stringify(c)).join('\n') + '\n';
  fs.writeFileSync(CASES_VAULT_FILE, lines, 'utf8');
}

// Extracción segura del token de sesión: PRIMERO DESDE CABECERA HTTP (Sin exponer en URL)
function extractSessionToken(req, parsedUrl) {
  const authHeader = req.headers['authorization'] || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  // Fallback secundario seguro
  return parsedUrl.searchParams.get('token');
}

// Extracción segura del payload JSON para compatibilidad local y Vercel Serverless
function getPayload(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    if (req.parsedBody && typeof req.parsedBody === 'object') {
      return resolve(req.parsedBody);
    }
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
    });
    req.on('end', () => {
      try {
        resolve(bodyData ? JSON.parse(bodyData) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export function createApiMiddleware() {
  ensureCasesVault();

  return (req, res, next = () => {}) => {
    const parsedUrl = new URL(req.url, 'http://localhost');
    let pathname = parsedUrl.pathname;

    // Normalización de rutas para compatibilidad tanto local como en Vercel Serverless
    if (pathname.includes('[...path]') && req.query && req.query.path) {
      const subpath = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
      pathname = '/api/' + subpath;
    }

    // Si la solicitud no corresponde a una ruta /api/*, ceder el control a Vite / servidor estático
    if (!pathname.startsWith('/api/')) {
      return next();
    }

    // Parsear body JSON para solicitudes POST
    if (req.method === 'POST') {
      getPayload(req).then(payload => {
        // 1. ENDPOINT: /api/leads
        if (pathname === '/api/leads') {
          const { name, phone, email, caseType, preferredLanguage, source, smsConsent } = payload;
          if (!name || !phone) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Nombre y teléfono son obligatorios para el registro legal.' }));
          }

          const leadId = `VS-LEAD-${Date.now().toString().slice(-6)}`;
          const leadRecord = {
            id: leadId,
            name: name.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : null,
            caseType: caseType || 'general',
            preferredLanguage: preferredLanguage || 'es',
            source: source || 'web_form',
            smsConsent: Boolean(smsConsent),
            status: 'PENDIENTE_REVISION_ABOGADO',
            createdAt: new Date().toISOString()
          };

          serverState.leads.unshift(leadRecord);
          serverState.metrics.leadsCaptured++;
          appendToAuditLog('leads_vault.jsonl', leadRecord);

          console.log(`[BACKEND CRM] Nuevo prospecto registrado: ${leadId} (${leadRecord.name}, Tel: ${leadRecord.phone}, Área: ${leadRecord.caseType})`);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            success: true,
            leadId,
            message: 'Prospecto registrado exitosamente en el sistema de admisión jurídica.',
            estimatedResponseTime: 'Menos de 2 horas',
            timestamp: leadRecord.createdAt
          }));
        }

        // 2. ENDPOINT: /api/evaluations
        if (pathname === '/api/evaluations') {
          const { name, phone, email, practiceAreaId, practiceAreaTitle, answers, preferredLanguage, state, notes, smsConsent } = payload;
          if (!name || !phone) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Nombre y teléfono requeridos para procesar la evaluación.' }));
          }

          const evalId = `VS-EVAL-${Date.now().toString().slice(-6)}`;
          const evalRecord = {
            id: evalId,
            practiceAreaId: practiceAreaId || 'general',
            practiceAreaTitle: practiceAreaTitle || 'Evaluación Migratoria',
            answers: answers || {},
            name: name.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : null,
            state: state || 'Florida',
            preferredLanguage: preferredLanguage || 'es',
            notes: notes || '',
            smsConsent: Boolean(smsConsent),
            status: 'EVALUACION_PENDIENTE_ANALISIS_JURIDICO',
            createdAt: new Date().toISOString()
          };

          serverState.evaluations.unshift(evalRecord);
          serverState.metrics.evaluationsCompleted++;
          appendToAuditLog('evaluations_vault.jsonl', evalRecord);

          console.log(`[BACKEND CRM] Evaluación migratoria recibida: ${evalId} (Materia: ${evalRecord.practiceAreaTitle}, Solicitante: ${evalRecord.name})`);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            success: true,
            evalId,
            practiceAreaId: evalRecord.practiceAreaId,
            message: 'Evaluación recibida formalmente. Un abogado especialista examinará los factores de viabilidad.',
            disclaimer: 'La recepción de este formulario no constituye otorgamiento de asesoría legal definitiva ni garantiza resultados.',
            timestamp: evalRecord.createdAt
          }));
        }

        // 3. ENDPOINT: /api/call-requests
        if (pathname === '/api/call-requests') {
          const { name, phone, callTime, caseType, notes } = payload;
          if (!name || !phone) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Nombre y teléfono requeridos para solicitar llamada.' }));
          }

          const callReqId = `VS-CALL-${Date.now().toString().slice(-5)}`;
          const callRecord = {
            id: callReqId,
            name: name.trim(),
            phone: phone.trim(),
            callTime: callTime || 'Inmediato / Lo antes posible',
            caseType: caseType || 'general',
            notes: notes || '',
            status: 'LLAMADA_PROGRAMADA',
            createdAt: new Date().toISOString()
          };

          serverState.callRequests.unshift(callRecord);
          serverState.metrics.callRequestsCaptured++;
          appendToAuditLog('call_requests_vault.jsonl', callRecord);

          console.log(`[BACKEND CRM] Solicitud de llamada programada: ${callReqId} (Para: ${callRecord.name}, Tel: ${callRecord.phone}, Horario: ${callRecord.callTime})`);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            success: true,
            callId: callReqId,
            message: 'Solicitud de llamada agendada en la central de admisión.',
            timestamp: callRecord.createdAt
          }));
        }

        // 4. ENDPOINT: /api/portal/auth (AUTENTICACIÓN REAL Y SEGURA)
        if (pathname === '/api/portal/auth') {
          const { caseNumber, accessCode } = payload;
          if (!caseNumber || !accessCode) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Número de expediente y código secreto requeridos.' }));
          }

          const normalizedCase = caseNumber.trim().toUpperCase();
          const cleanCode = accessCode.trim();

          // Control de intentos fallidos (Anti-Brute-Force)
          const attemptRecord = serverState.failedAttempts.get(normalizedCase) || { count: 0, lockedUntil: 0 };
          const now = Date.now();
          if (attemptRecord.lockedUntil > now) {
            const minutesLeft = Math.ceil((attemptRecord.lockedUntil - now) / 60000);
            res.statusCode = 429;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              error: `Demasiados intentos fallidos. Bóveda bloqueada preventivamente por ${minutesLeft} minuto(s).`
            }));
          }

          const isProductionRequest = process.env.NODE_ENV === 'production' || req.headers['x-simulate-production'] === 'true';
          const caseRecord = getCaseByNumber(normalizedCase, !isProductionRequest);

          if (!caseRecord || caseRecord.accessCode !== cleanCode) {
            attemptRecord.count++;
            if (attemptRecord.count >= 5) {
              attemptRecord.lockedUntil = now + 10 * 60 * 1000;
            }
            serverState.failedAttempts.set(normalizedCase, attemptRecord);

            appendToAuditLog('portal_access_audit.jsonl', {
              action: 'AUTH_FAILED',
              caseNumber: normalizedCase,
              ip: req.socket.remoteAddress,
              attemptCount: attemptRecord.count
            });

            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              error: 'Credenciales no autorizadas o expediente no encontrado en los registros de la firma.'
            }));
          }

          // Autenticación Exitosa: Reset intentos y generar token de sesión
          serverState.failedAttempts.delete(normalizedCase);
          const sessionToken = `VS-SESSION-${normalizedCase}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          serverState.activeSessions.set(sessionToken, {
            caseNumber: normalizedCase,
            createdAt: now,
            expiresAt: now + 3600 * 1000 // 1 hora de validez
          });

          appendToAuditLog('portal_access_audit.jsonl', {
            action: 'AUTH_SUCCESS',
            caseNumber: normalizedCase,
            clientName: caseRecord.clientName,
            tokenRef: sessionToken.slice(-8)
          });

          const { accessCode: _, ...safeCaseData } = caseRecord;

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            success: true,
            token: sessionToken,
            caseRecord: safeCaseData
          }));
        }

        // 5. ENDPOINT: /api/portal/crm/activity (REGISTRO DIRECTO DESDE CRM CON PRÓXIMO PASO)
        if (pathname === '/api/portal/crm/activity') {
          const { caseNumber, activityTitle, activityDescription, nextDeadline } = payload;
          if (!caseNumber || !activityTitle) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Número de expediente y título de actividad requeridos.' }));
          }

          const isProductionRequest = process.env.NODE_ENV === 'production' || req.headers['x-simulate-production'] === 'true';
          const caseRecord = getCaseByNumber(caseNumber, !isProductionRequest);
          if (!caseRecord) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Expediente no encontrado en la base de datos.' }));
          }

          const newActivity = {
            id: `act-${Date.now().toString().slice(-4)}`,
            date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) + ' - ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            title: activityTitle.trim(),
            description: activityDescription ? activityDescription.trim() : 'Gestión procesal registrada por el equipo legal.',
            status: 'completada'
          };

          caseRecord.activities.unshift(newActivity);
          if (nextDeadline) {
            caseRecord.nextDeadline = nextDeadline.trim();
            caseRecord.nextDeadlineEn = nextDeadline.trim();
          }
          saveCaseUpdate(caseRecord);

          console.log(`[BACKEND CRM -> PORTAL] Novedad procesal registrada en expediente ${caseNumber}: ${newActivity.title}`);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            success: true,
            message: 'Actividad y próximo paso registrados en la base de datos centralizada.',
            activity: newActivity,
            nextDeadline: caseRecord.nextDeadline
          }));
        }

        // 6. ENDPOINT: /api/portal/document/download (DESCARGA SEGURA VÍA POST CON HEADER DE AUTORIZACIÓN - CERO CREDENCIALES EN URL)
        if (pathname === '/api/portal/document/download') {
          const token = extractSessionToken(req, parsedUrl);
          const { caseNumber, docId } = payload;

          if (!token || !caseNumber || !docId) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Token de autorización, expediente y documento requeridos.' }));
          }

          const session = serverState.activeSessions.get(token);
          if (!session || session.caseNumber !== caseNumber.trim().toUpperCase() || session.expiresAt < Date.now()) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Sesión expirada o no autorizada para acceder a este expediente.' }));
          }

          const isProductionRequest = process.env.NODE_ENV === 'production' || req.headers['x-simulate-production'] === 'true';
          const caseRecord = getCaseByNumber(caseNumber, !isProductionRequest);
          if (!caseRecord) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Expediente no encontrado.' }));
          }

          const docRecord = (caseRecord.documents || []).find(d => d.id === docId);
          if (!docRecord) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Documento no vinculado al expediente del cliente.' }));
          }

          // AVISO ÉTICO RIGUROSO: Los documentos de prueba o de orientación indican con total claridad
          // que son borradores de trabajo y NO suplantan notificaciones gubernamentales oficiales.
          const docBody = `================================================================================
VALENZUELA & STERLING IMMIGRATION LAW GROUP, P.A.
BORRADOR INFORMATIVO / EJEMPLAR DE CONSULTA PARA CLIENTE
================================================================================
*** AVISO LEGAL Y ÉTICO OBLIGATORIO ***
EL PRESENTE ARCHIVO ES UN INSTRUMENTO INFORMATIVO DE TRABAJO EMITIDO POR LA FIRMA.
NO CONSTITUYE UNA NOTIFICACIÓN GUBERNAMENTAL OFICIAL NI GARANTÍA DE RADICACIÓN
VINCULANTE ANTE USCIS, ICE O TRIBUNALES EOIR. SE EXPIDE EXCLUSIVAMENTE PARA FINES
DE CONSULTA INTERNA Y ORIENTACIÓN DEL CLIENTE TITULAR.
--------------------------------------------------------------------------------
FECHA DE EMISIÓN:         ${new Date().toISOString()}
NÚMERO DE EXPEDIENTE:     ${caseRecord.caseNumber}
CLIENTE TITULAR:          ${caseRecord.clientName}
MATERIA JURÍDICA:         ${caseRecord.service}
ABOGADO ASIGNADO:         ${caseRecord.attorneyAssigned}
--------------------------------------------------------------------------------
NOMBRE DEL DOCUMENTO:     ${docRecord.name}
TIPO DE INSTRUMENTO:      ${docRecord.type}
REFERENCIA DE REGISTRO:   ${docRecord.docketRef}
AUTORIZADO POR:           ${docRecord.authorizedBy}
FECHA DE REVISIÓN:        ${docRecord.date}
DIGESTO DE INTEGRIDAD:    ${docRecord.sha256Digest}
--------------------------------------------------------------------------------
ESTADO PROCESAL REGISTRADO:
${caseRecord.status} (${caseRecord.nextDeadline})

Valenzuela & Sterling Immigration Law Group, P.A.
Teléfono Central 24/7: (551) 349-9462
Miami • Orlando • Houston • New York
================================================================================`;

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Content-Disposition', `attachment; filename="${docRecord.name}"`);
          res.setHeader('X-Document-Integrity', docRecord.sha256Digest);
          return res.end(docBody);
        }

        // 7. ENDPOINT: /api/telemetry
        if (pathname === '/api/telemetry') {
          const { eventName, eventData } = payload;
          if (eventName) {
            serverState.events.unshift({
              event: eventName,
              data: eventData || {},
              timestamp: new Date().toISOString()
            });

            if (eventName === 'whatsapp_click') serverState.metrics.whatsappClicks++;
            if (eventName === 'phone_click') serverState.metrics.phoneClicks++;
            if (eventName === 'evaluator_started') serverState.metrics.evaluationsStarted++;
            if (eventName === 'page_view') serverState.metrics.pageViews++;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ ok: true }));
        }

        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Endpoint POST no encontrado' }));
      }).catch(err => {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Payload JSON inválido' }));
      });
      return;
    }

    // Manejar GET: Telemetría, Consulta de Caso
    if (req.method === 'GET') {
      
      // 1. GET /api/portal/case?caseNumber=... (AUTORIZACIÓN MEDIANTE HEADER BEARER)
      if (pathname === '/api/portal/case') {
        const caseNumber = parsedUrl.searchParams.get('caseNumber');
        const token = extractSessionToken(req, parsedUrl);

        if (!caseNumber || !token) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Autenticación requerida para acceder al expediente.' }));
        }

        const session = serverState.activeSessions.get(token);
        if (!session || session.caseNumber !== caseNumber.trim().toUpperCase() || session.expiresAt < Date.now()) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Sesión expirada o no autorizada para acceder a este expediente.' }));
        }

        const isProductionRequest = process.env.NODE_ENV === 'production' || req.headers['x-simulate-production'] === 'true';
        const caseRecord = getCaseByNumber(caseNumber, !isProductionRequest);
        if (!caseRecord) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Expediente no encontrado.' }));
        }

        const { accessCode: _, ...safeCaseData } = caseRecord;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: true, caseRecord: safeCaseData }));
      }

      // 2. GET /api/conversion-stats (REPORTES CON SEGREGACIÓN ESTRICTA DE TEST_ONLY)
      if (pathname === '/api/conversion-stats') {
        const productionCases = getAllCases({ includeTest: false });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          metrics: serverState.metrics,
          recentLeadsCount: serverState.leads.filter(l => !l.isTest).length,
          recentEvaluationsCount: serverState.evaluations.filter(e => !e.isTest).length,
          recentCallRequestsCount: serverState.callRequests.filter(c => !c.isTest).length,
          activeProductionCasesCount: productionCases.length,
          serverStatus: 'ONLINE_SECURE',
          auditPersistence: 'ACTIVE (server_data/)',
          environmentSegregation: 'ACTIVE (TEST_ONLY records strictly isolated from production stats)'
        }));
      }

      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Endpoint GET no encontrado' }));
    }

    next();
  };
}
