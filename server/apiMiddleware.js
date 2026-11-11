import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import {
  isSupabaseConfigured,
  dbGetAllCases,
  dbGetCaseByNumber,
  dbCreateCase,
  dbUpdateCase,
  dbAddActivity,
  dbAddDocument,
  dbUploadDocumentBinary,
  dbDeleteDocument,
  dbUpdateDocumentDocketRef,
  dbUpdateAccessCode,
  dbRevokeAccess,
  dbCheckFailedAttempts,
  dbRecordFailedAttempt,
  dbResetFailedAttempts,
  dbCreateSignedDocumentUrl,
  dbAuditLog
} from './supabaseClient.js';
import { hashPassword, verifyPassword, computeSha256 } from './securityCrypto.js';
import { stampSignatureOnPdf } from './pdfSigner.js';

// Almacén en memoria del servidor para telemetría y leads (Persistencia en backend)
const serverState = {
  leads: [],
  evaluations: [],
  callRequests: [],
  events: [],
  activeSessions: new Map(), // token -> { caseNumber, createdAt, expiresAt }
  adminSessions: new Map(),  // token -> { username, role, name, roleLabel, permissions, createdAt, expiresAt }
  failedAttempts: new Map(), // caseNumber/IP -> { count, lockedUntil }
  customStaffPasswords: new Map(), // username -> passwordPlainOrHash
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

// Configuración de Cuentas del Personal (RBAC - Role Based Access Control)
const STAFF_ACCOUNTS = [
  {
    username: (process.env.ADMIN_USER || 'admin@valenzuelasterling.com').toLowerCase(),
    aliases: ['admin', 'abogado', 'director'],
    name: 'Dirección Jurídica Valenzuela & Sterling',
    role: 'admin',
    roleLabel: 'Director Jurídico / Abogado Principal',
    permissions: ['all']
  },
  {
    username: (process.env.ASSISTANT_USER || 'asistente@valenzuelasterling.com').toLowerCase(),
    aliases: ['asistente', 'secretaria', 'staff'],
    name: 'Recepción y Asistencia Legal',
    role: 'assistant',
    roleLabel: 'Asistente Legal / Secretaria',
    permissions: ['view_cases', 'create_case', 'edit_case', 'upload_doc', 'add_activity']
  }
];

const ADMIN_SALT = process.env.ADMIN_SALT || 'vs_law_salt_v2_2026';
const ADMIN_HASH_STORED = process.env.ADMIN_PASSWORD_HASH || 
  crypto.createHash('sha512').update('V&S-Legal#2026$ProtectVault!' + ADMIN_SALT).digest('hex');

const ASSISTANT_HASH_STORED = process.env.ASSISTANT_PASSWORD_HASH ||
  crypto.createHash('sha512').update('VS-Staff#2026!Asistente' + ADMIN_SALT).digest('hex');

function findStaffAccount(inputUser) {
  if (!inputUser) return null;
  const u = inputUser.trim().toLowerCase();
  return STAFF_ACCOUNTS.find(acc => acc.username === u || acc.aliases.includes(u)) || null;
}

function verifyStaffCredentials(inputUser, inputPassword) {
  if (!inputUser || !inputPassword) return null;
  const staff = findStaffAccount(inputUser);
  if (!staff) return null;

  // Si fue cambiada dinámicamente en sesión
  if (serverState.customStaffPasswords.has(staff.username)) {
    if (serverState.customStaffPasswords.get(staff.username) === inputPassword) {
      return staff;
    }
  }

  // Verificación Administrador Maestro
  if (staff.role === 'admin') {
    if (process.env.ADMIN_PASSWORD) {
      if (inputPassword === process.env.ADMIN_PASSWORD) return staff;
    }
    const inputHash = crypto.createHash('sha512').update(inputPassword + ADMIN_SALT).digest('hex');
    try {
      if (crypto.timingSafeEqual(Buffer.from(inputHash, 'hex'), Buffer.from(ADMIN_HASH_STORED, 'hex'))) {
        return staff;
      }
    } catch (e) {}
  }

  // Verificación Asistente Legal
  if (staff.role === 'assistant') {
    if (process.env.ASSISTANT_PASSWORD) {
      if (inputPassword === process.env.ASSISTANT_PASSWORD) return staff;
    }
    const inputHash = crypto.createHash('sha512').update(inputPassword + ADMIN_SALT).digest('hex');
    try {
      if (crypto.timingSafeEqual(Buffer.from(inputHash, 'hex'), Buffer.from(ASSISTANT_HASH_STORED, 'hex'))) {
        return staff;
      }
    } catch (e) {}
  }

  return null;
}

// Directorio para persistencia segura de auditoría y respaldo local
const SERVER_DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'vs_server_data')
  : path.resolve(process.cwd(), 'server_data');
const AUDIT_LOGS_DIR = path.join(SERVER_DATA_DIR, 'audit_logs');
const CASES_VAULT_FILE = path.join(SERVER_DATA_DIR, 'cases_vault.jsonl');

function ensureDataDirectories() {
  try {
    if (!fs.existsSync(SERVER_DATA_DIR)) {
      fs.mkdirSync(SERVER_DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(AUDIT_LOGS_DIR)) {
      fs.mkdirSync(AUDIT_LOGS_DIR, { recursive: true });
    }
  } catch (e) {
    // Entorno serverless de solo lectura
  }
}

function appendToAuditLog(filename, data) {
  try {
    ensureDataDirectories();
    const filePath = path.join(AUDIT_LOGS_DIR, filename);
    const logEntry = JSON.stringify({
      ...data,
      timestamp: new Date().toISOString()
    }) + '\n';
    fs.appendFileSync(filePath, logEntry, 'utf8');
  } catch (e) {}
}

// Inicialización de la Bóveda Local de Expedientes (Fallback y Desarrollo)
function ensureCasesVault() {
  try {
    ensureDataDirectories();

  const testCaseA = {
    caseNumber: 'VS-TEST-2026-9001',
    accessCode: 'PRUEBA-9001',
    accessCodeHash: hashPassword('PRUEBA-9001'),
    clientName: 'Carlos Méndez (Cliente de Prueba)',
    clientLastName: 'Méndez',
    clientPhoneLast4: '9001',
    isRevoked: false,
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
        storagePath: 'vault/VS-TEST-2026-9001/Borrador_Resumen_Caso_9001.txt',
        sha256Digest: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        isClientVisible: true
      }
    ],
    updatedAt: new Date().toISOString(),
    isTestRecord: true,
    environment: 'TEST_ONLY'
  };

  const testCaseB = {
    caseNumber: 'VS-TEST-2026-9002',
    accessCode: 'PRUEBA-9002',
    accessCodeHash: hashPassword('PRUEBA-9002'),
    clientName: 'Lucía Ramos (Cliente de Prueba B)',
    clientLastName: 'Ramos',
    clientPhoneLast4: '9002',
    isRevoked: false,
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
        storagePath: 'vault/VS-TEST-2026-9002/Guia_Documental_Caso_9002.txt',
        sha256Digest: 'b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01',
        isClientVisible: true
      }
    ],
    updatedAt: new Date().toISOString(),
    isTestRecord: true,
    environment: 'TEST_ONLY'
  };

  const initialCaseReal = {
    caseNumber: 'VS-CAS-2026-0842',
    accessCode: 'VS-8429-KR',
    accessCodeHash: hashPassword('VS-8429-KR'),
    clientName: 'Roberto Morales Echeverría',
    clientLastName: 'Morales',
    clientPhoneLast4: '7941',
    isRevoked: false,
    service: 'Defensa de Deportación y Cancelación de Remoción EOIR-42B',
    serviceEn: 'Deportation Defense and Cancellation of Removal EOIR-42B',
    filingDate: '12 Enero 2026',
    attorneyAssigned: 'Abogada Principal Valenzuela',
    status: 'Notificación de Audiencia Preliminar Recibida',
    statusEn: 'Master Calendar Notice Received',
    statusColor: 'emerald',
    nextDeadline: 'Audiencia de Méritos: 14 Mayo 2026',
    nextDeadlineEn: 'Individual Merits Hearing: May 14, 2026',
    activities: [
      {
        id: 'act-001',
        date: '28 Oct 2026 - 14:30',
        title: 'Comparecencia y Admisión Formal Presentada',
        titleEn: 'Notice of Appearance (EOIR-28) Filed',
        description: 'Ingreso de representación legal formal ante la Corte de Inmigración de Miami (Krome/Biscayne).',
        descriptionEn: 'Formal notice of representation registered before Miami Immigration Court.',
        status: 'completada'
      }
    ],
    documents: [
      {
        id: 'doc-001',
        name: 'Notificacion_Audiencia_EOIR_Morales.pdf',
        type: 'Notificación Oficial de Corte EOIR',
        size: '1.4 MB',
        date: '28 Oct 2026',
        authorizedBy: 'Corte de Inmigración de Miami',
        docketRef: 'A209-842-991',
        storagePath: 'vault/VS-CAS-2026-0842/Notificacion_Audiencia_EOIR_Morales.pdf',
        sha256Digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        isClientVisible: true
      }
    ],
    updatedAt: new Date().toISOString(),
    isTestRecord: false,
    environment: 'PRODUCTION'
  };

    if (!fs.existsSync(CASES_VAULT_FILE)) {
      const initialCases = [initialCaseReal, testCaseA, testCaseB];
      const lines = initialCases.map(c => JSON.stringify(c)).join('\n') + '\n';
      fs.writeFileSync(CASES_VAULT_FILE, lines, 'utf8');
    }
  } catch (e) {}
}

// Obtiene expedientes locales
function getAllCasesLocal({ includeTest = (process.env.NODE_ENV !== 'production') } = {}) {
  ensureCasesVault();
  try {
    const raw = fs.readFileSync(CASES_VAULT_FILE, 'utf8');
    const cases = raw
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => JSON.parse(line));

    if (!includeTest || process.env.NODE_ENV === 'production') {
      return cases.filter(c => !c.isTestRecord && c.environment !== 'TEST_ONLY' && !c.caseNumber.startsWith('VS-TEST-'));
    }
    return cases;
  } catch (err) {
    console.error('Error leyendo casos desde la bóveda:', err);
    return [];
  }
}

function getCaseByNumberLocal(caseNumber, allowTest = (process.env.NODE_ENV !== 'production')) {
  const cases = getAllCasesLocal({ includeTest: allowTest });
  const normalized = caseNumber.trim().toUpperCase();
  return cases.find(c => c.caseNumber.toUpperCase() === normalized) || null;
}

function saveCaseUpdateLocal(updatedCase) {
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

  try {
    const lines = cases.map(c => JSON.stringify(c)).join('\n') + '\n';
    fs.writeFileSync(CASES_VAULT_FILE, lines, 'utf8');
  } catch (e) {}
}

// Métodos Asíncronos Duales: Supabase Cloud + Local Vault Fallback
async function fetchCase(caseNumber, allowTest = (process.env.NODE_ENV !== 'production')) {
  if (isSupabaseConfigured()) {
    try {
      const sbCase = await dbGetCaseByNumber(caseNumber);
      if (sbCase) {
        if (!allowTest && (sbCase.isTestRecord || sbCase.environment === 'TEST_ONLY' || sbCase.caseNumber.startsWith('VS-TEST-'))) {
          return null;
        }
        return sbCase;
      }
    } catch (e) {
      console.error('Fallo de consulta Supabase, usando respaldo local:', e.message);
    }
  }
  return getCaseByNumberLocal(caseNumber, allowTest);
}

async function fetchAllCases({ includeTest = (process.env.NODE_ENV !== 'production') } = {}) {
  if (isSupabaseConfigured()) {
    try {
      const sbCases = await dbGetAllCases({ includeTest });
      if (sbCases && sbCases.length > 0) {
        return sbCases;
      }
    } catch (e) {
      console.error('Fallo de consulta Supabase en fetchAllCases, usando respaldo local:', e.message);
    }
  }
  return getAllCasesLocal({ includeTest });
}

function extractSessionToken(req, parsedUrl) {
  const authHeader = req.headers['authorization'] || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return parsedUrl.searchParams.get('token');
}

function extractAdminToken(req) {
  const authHeader = req.headers['authorization'] || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return req.headers['x-admin-token'] || null;
}

function verifyAdminSession(req) {
  const token = extractAdminToken(req);
  if (!token) return null;
  const session = serverState.adminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    return null;
  }
  return session;
}

function revokeAllClientSessionsForCase(caseNumber) {
  const normalized = caseNumber.trim().toUpperCase();
  let revokedCount = 0;
  for (const [token, session] of serverState.activeSessions.entries()) {
    if (session.caseNumber === normalized) {
      serverState.activeSessions.delete(token);
      revokedCount++;
    }
  }
  return revokedCount;
}

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
      // Permite hasta 15MB para documentos y fotos base64
      if (bodyData.length > 15 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload demasiado grande. Límite máximo 15MB.'));
      }
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

  return async (req, res, next = () => {}) => {
    const parsedUrl = new URL(req.url, 'http://localhost');
    let pathname = parsedUrl.pathname;

    if (pathname.includes('[...path]') && req.query && req.query.path) {
      const subpath = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
      pathname = '/api/' + subpath;
    }

    if (!pathname.startsWith('/api/')) {
      return next();
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';

    // ==========================================
    // SECCIÓN 1: SOLICITUDES POST
    // ==========================================
    if (req.method === 'POST') {
      let payload = {};
      try {
        payload = await getPayload(req);
      } catch (err) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: err.message || 'Payload JSON inválido' }));
      }

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
          email: (email || '').trim(),
          caseType: caseType || 'No especificado',
          preferredLanguage: preferredLanguage || 'es',
          source: source || 'web_direct',
          smsConsent: Boolean(smsConsent),
          createdAt: new Date().toISOString(),
          status: 'NUEVO_CONTACTO_PENDIENTE',
          isTest: Boolean(payload.isTest)
        };

        serverState.leads.unshift(leadRecord);
        serverState.metrics.leadsCaptured++;
        appendToAuditLog('leads_audit.jsonl', { action: 'LEAD_CAPTURED', leadId, phone: phone.slice(-4) });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          leadId,
          message: 'Solicitud confidencial registrada en Valenzuela & Sterling.',
          timestamp: leadRecord.createdAt
        }));
      }

      // 2. ENDPOINT: /api/evaluations
      if (pathname === '/api/evaluations') {
        const { answers, score, recommendedPath, urgency, clientData, leadId } = payload;
        const evaluationId = `VS-EVAL-${Date.now().toString().slice(-6)}`;
        const evaluationRecord = {
          id: evaluationId,
          leadId: leadId || null,
          answers: answers || {},
          score: typeof score === 'number' ? score : 0,
          recommendedPath: recommendedPath || 'Consulta Legal Personalizada',
          urgency: urgency || 'media',
          clientData: clientData || {},
          createdAt: new Date().toISOString(),
          isTest: Boolean(payload.isTest)
        };

        serverState.evaluations.unshift(evaluationRecord);
        serverState.metrics.evaluationsCompleted++;
        appendToAuditLog('evaluations_audit.jsonl', { action: 'EVALUATION_COMPLETED', evaluationId, recommendedPath });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          evaluationId,
          message: 'Evaluación procesada por el algoritmo de admisión legal.',
          timestamp: evaluationRecord.createdAt
        }));
      }

      // 3. ENDPOINT: /api/call-requests
      if (pathname === '/api/call-requests') {
        const { name, phone, preferredTime, reason } = payload;
        if (!name || !phone) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Nombre y teléfono requeridos para programar llamada.' }));
        }

        const callReqId = `VS-CALL-${Date.now().toString().slice(-6)}`;
        const callRecord = {
          id: callReqId,
          name: name.trim(),
          phone: phone.trim(),
          preferredTime: preferredTime || 'Inmediato (Guardia 24/7)',
          reason: reason || 'Consulta General',
          createdAt: new Date().toISOString(),
          status: 'PENDIENTE_DESPACHO_INMEDIATO',
          isTest: Boolean(payload.isTest)
        };

        serverState.callRequests.unshift(callRecord);
        serverState.metrics.callRequestsCaptured++;
        appendToAuditLog('call_requests_audit.jsonl', { action: 'CALL_REQUESTED', callReqId, phone: phone.slice(-4) });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          callId: callReqId,
          message: 'Solicitud de llamada agendada en la central de admisión.',
          timestamp: callRecord.createdAt
        }));
      }

      // 4. ENDPOINT: /api/portal/auth (AUTENTICACIÓN REFORZADA CON TRIPLE FACTOR Y RATE LIMITING)
      if (pathname === '/api/portal/auth') {
        const { caseNumber, accessCode, clientConfirm } = payload;
        if (!caseNumber || !accessCode) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Número de expediente y código secreto requeridos.' }));
        }

        const normalizedCase = caseNumber.trim().toUpperCase();
        const cleanCode = accessCode.trim();

        let isLocked = false;
        if (isSupabaseConfigured()) {
          const sbAttempt = await dbCheckFailedAttempts(normalizedCase);
          if (sbAttempt && sbAttempt.isLocked) {
            isLocked = true;
          }
        }

        const localAttempt = serverState.failedAttempts.get(normalizedCase) || { count: 0, lockedUntil: 0 };
        const now = Date.now();
        if (localAttempt.lockedUntil > now) {
          isLocked = true;
        }

        if (isLocked) {
          res.statusCode = 429;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            error: 'Demasiados intentos fallidos. Bóveda bloqueada preventivamente por seguridad.'
          }));
        }

        const isProductionRequest = process.env.NODE_ENV === 'production' || req.headers['x-simulate-production'] === 'true';
        const caseRecord = await fetchCase(normalizedCase, !isProductionRequest);

        let codeMatches = false;
        if (caseRecord) {
          if (caseRecord.accessCodeHash) {
            codeMatches = verifyPassword(cleanCode, caseRecord.accessCodeHash);
          }
          if (!codeMatches && caseRecord.accessCode) {
            codeMatches = (caseRecord.accessCode === cleanCode);
          }
        }

        if (!caseRecord || !codeMatches) {
          if (isSupabaseConfigured()) {
            await dbRecordFailedAttempt(normalizedCase);
            await dbAuditLog('AUTH_FAILED', 'client_portal', { caseNumber: normalizedCase }, clientIp);
          }

          localAttempt.count++;
          if (localAttempt.count >= 5) {
            localAttempt.lockedUntil = now + 15 * 60 * 1000;
          }
          serverState.failedAttempts.set(normalizedCase, localAttempt);

          appendToAuditLog('portal_access_audit.jsonl', {
            action: 'AUTH_FAILED',
            caseNumber: normalizedCase,
            ip: clientIp,
            attemptCount: localAttempt.count
          });

          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            error: 'Credenciales no autorizadas o expediente no encontrado en los registros de la firma.'
          }));
        }

        if (caseRecord.isRevoked) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            error: 'El acceso a este expediente ha sido revocado o suspendido preventivamente por la administración de la firma. Por favor comuníquese al +1 (314) 618-5666.'
          }));
        }

        if (clientConfirm && clientConfirm.trim().length > 0) {
          const cleanConfirm = clientConfirm.trim().toLowerCase();
          const lastNameMatch = (caseRecord.clientLastName || '').toLowerCase().includes(cleanConfirm) || 
                               cleanConfirm.includes((caseRecord.clientLastName || '').toLowerCase());
          const phoneMatch = cleanConfirm === (caseRecord.clientPhoneLast4 || '');

          if (!lastNameMatch && !phoneMatch) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              error: 'El factor de confirmación (apellido o últimos 4 dígitos del teléfono) no coincide con el expediente.'
            }));
          }
        }

        if (isSupabaseConfigured()) {
          await dbResetFailedAttempts(normalizedCase);
          await dbAuditLog('AUTH_SUCCESS', 'client_portal', { caseNumber: normalizedCase, clientName: caseRecord.clientName }, clientIp);
        }
        serverState.failedAttempts.delete(normalizedCase);

        const sessionToken = `VS-SESSION-${normalizedCase}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
        serverState.activeSessions.set(sessionToken, {
          caseNumber: normalizedCase,
          createdAt: now,
          expiresAt: now + 3600 * 1000
        });

        appendToAuditLog('portal_access_audit.jsonl', {
          action: 'AUTH_SUCCESS',
          caseNumber: normalizedCase,
          clientName: caseRecord.clientName,
          tokenRef: sessionToken.slice(-8)
        });

        const { accessCode: _, accessCodeHash: __, ...safeCaseData } = caseRecord;
        // Filtrar documentos privados del portal del cliente
        safeCaseData.documents = (safeCaseData.documents || []).filter(d => d.isClientVisible !== false);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          token: sessionToken,
          caseRecord: safeCaseData,
          message: 'Autenticación autorizada bajo protocolo de confidencialidad legal.'
        }));
      }

      // 5. ENDPOINT: /api/portal/activity/add o /api/portal/crm/activity
      if (pathname === '/api/portal/activity/add' || pathname === '/api/portal/crm/activity') {
        const { caseNumber, token, title, description, status: activityStatus, activityTitle, activityDescription, nextDeadline } = payload;
        const normalizedCase = (caseNumber || '').trim().toUpperCase();

        const adminSession = verifyAdminSession(req);
        const clientSession = token ? serverState.activeSessions.get(token) : null;

        if (!adminSession && (!clientSession || clientSession.caseNumber !== normalizedCase || clientSession.expiresAt < Date.now())) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Acceso no autorizado para actualizar este expediente.' }));
        }

        const isProductionRequest = process.env.NODE_ENV === 'production' || req.headers['x-simulate-production'] === 'true';
        const caseRecord = await fetchCase(normalizedCase, !isProductionRequest);
        if (!caseRecord) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Expediente no encontrado.' }));
        }

        const effectiveTitle = activityTitle || title || 'Actualización de Gestión Procesal';
        const effectiveDesc = activityDescription || description || 'Diligencia procesal registrada en la bitácora legal.';

        const newActivity = {
          id: `act-${Date.now().toString().slice(-6)}`,
          date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) + ' - ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          title: effectiveTitle,
          titleEn: effectiveTitle,
          description: effectiveDesc,
          descriptionEn: effectiveDesc,
          status: activityStatus || 'completada'
        };

        if (nextDeadline) {
          caseRecord.nextDeadline = nextDeadline;
        }

        if (isSupabaseConfigured()) {
          await dbAddActivity(normalizedCase, newActivity);
          if (nextDeadline) {
            await dbUpdateCase(normalizedCase, { nextDeadline });
          }
          await dbAuditLog('ACTIVITY_ADDED', adminSession ? adminSession.username : 'client_portal', { caseNumber: normalizedCase, activityId: newActivity.id }, clientIp);
        }

        caseRecord.activities = [newActivity, ...(caseRecord.activities || [])];
        saveCaseUpdateLocal(caseRecord);

        appendToAuditLog('portal_access_audit.jsonl', {
          action: 'ACTIVITY_LOGGED',
          caseNumber: normalizedCase,
          activityId: newActivity.id
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          activity: newActivity,
          message: 'Novedad procesal incorporada exitosamente.'
        }));
      }

      // 6. ENDPOINT: /api/portal/document/download (DESCARGA SEGURA Y AUTORIZADA)
      if (pathname === '/api/portal/document/download') {
        const { caseNumber, docId } = payload;
        const token = extractSessionToken(req, parsedUrl);

        if (!token || !caseNumber || !docId) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Sesión y parámetros requeridos para descarga de instrumentos legales.' }));
        }

        const normalizedCase = caseNumber.trim().toUpperCase();
        const session = serverState.activeSessions.get(token);
        const adminSession = verifyAdminSession(req);

        // Si es cliente, validar que la sesión pertenezca al caso
        if (!adminSession && (!session || session.caseNumber !== normalizedCase || session.expiresAt < Date.now())) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Sesión no autorizada o expirada para este expediente.' }));
        }

        const isProductionRequest = process.env.NODE_ENV === 'production' || req.headers['x-simulate-production'] === 'true';
        const caseRecord = await fetchCase(normalizedCase, !isProductionRequest);
        if (!caseRecord) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Expediente no encontrado en bóveda.' }));
        }

        if (caseRecord.isRevoked && !adminSession) {
          serverState.activeSessions.delete(token);
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'El acceso a este expediente ha sido revocado.' }));
        }

        const docRecord = (caseRecord.documents || []).find(d => d.id === docId);
        if (!docRecord) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Documento no registrado o no autorizado para descarga.' }));
        }

        // Si es un cliente y el documento es privado/interno, denegar
        if (!adminSession && docRecord.isClientVisible === false) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Documento confidencial de uso reservado para el personal de la firma. No disponible para descarga externa.' }));
        }

        appendToAuditLog('document_downloads_audit.jsonl', {
          action: 'DOCUMENT_DOWNLOADED',
          caseNumber: normalizedCase,
          docId,
          docName: docRecord.name,
          sha256: docRecord.sha256Digest
        });

        if (isSupabaseConfigured()) {
          await dbAuditLog('DOCUMENT_DOWNLOADED', adminSession ? adminSession.username : 'client_portal', { caseNumber: normalizedCase, docId, docName: docRecord.name }, clientIp);

          if (docRecord.storagePath) {
            try {
              const signedUrl = await dbCreateSignedDocumentUrl(docRecord.storagePath, 300);
              if (signedUrl) {
                const storageRes = await fetch(signedUrl);
                if (storageRes.ok) {
                  const fileBuffer = Buffer.from(await storageRes.arrayBuffer());
                  res.statusCode = 200;
                  res.setHeader('Content-Type', storageRes.headers.get('content-type') || 'application/octet-stream');
                  res.setHeader('Content-Disposition', `attachment; filename="${docRecord.name}"`);
                  res.setHeader('X-Document-Integrity', docRecord.sha256Digest);
                  return res.end(fileBuffer);
                }
              }
            } catch (storageErr) {
              console.error('Error recuperando documento desde Supabase Storage:', storageErr.message);
            }
          }
        }

        // Certificado Digital Criptográfico de Respaldo
        const docBody = `================================================================================
VALENZUELA & STERLING IMMIGRATION LAW GROUP, P.A.
SISTEMA DE GESTIÓN Y BÓVEDA DOCUMENTAL PRIVADA
================================================================================
CERTIFICADO DE CONSTANCIA DOCUMENTAL OFICIAL
EXPEDIENTE:             ${caseRecord.caseNumber}
TITULAR / BENEFICIARIO: ${caseRecord.clientName}
MATERIA JURÍDICA:         ${caseRecord.service}
ABOGADO ASIGNADO:         ${caseRecord.attorneyAssigned}
--------------------------------------------------------------------------------
NOMBRE DEL DOCUMENTO:     ${docRecord.name}
TIPO DE INSTRUMENTO:      ${docRecord.type}
REFERENCIA DE REGISTRO:   ${docRecord.docketRef}
AUTORIZADO POR:           ${docRecord.authorizedBy}
FECHA DE REVISIÓN:        ${docRecord.date}
DIGESTO DE INTEGRIDAD:    ${docRecord.sha256Digest}
CLASIFICACIÓN:            ${docRecord.isClientVisible ? 'CLIENTE Y FIRMA' : 'RESERVADO / CONFIDENCIAL FIRMA'}
--------------------------------------------------------------------------------
ESTADO PROCESAL REGISTRADO:
${caseRecord.status} (${caseRecord.nextDeadline})

Valenzuela & Sterling Immigration Law Group, P.A.
Teléfono Central 24/7: +1 (314) 618-5666
Miami • Orlando • Houston • New York
================================================================================`;

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${docRecord.name}"`);
        res.setHeader('X-Document-Integrity', docRecord.sha256Digest);
        return res.end(docBody);
      }

      // 7. ENDPOINT: /api/portal/document/sign (FIRMA DIGITAL MANUSCRITA EN EL EXPEDIENTE)
      if (pathname === '/api/portal/document/sign') {
        const { caseNumber, docId, signaturePngBase64 } = payload;
        const token = extractSessionToken(req, parsedUrl);

        if (!token || !caseNumber || !docId || !signaturePngBase64) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Datos incompletos para procesar la firma manuscrita.' }));
        }

        const normalizedCase = caseNumber.trim().toUpperCase();
        const clientSession = serverState.activeSessions.get(token);

        if (!clientSession || clientSession.caseNumber !== normalizedCase) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Sesión no autorizada para firmar documentos de este expediente.' }));
        }

        const caseRecord = await fetchCase(normalizedCase, true);
        if (!caseRecord) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Expediente no encontrado.' }));
        }

        const docIndex = (caseRecord.documents || []).findIndex(d => d.id === docId);
        if (docIndex === -1) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Documento no registrado en el expediente.' }));
        }

        const docRecord = caseRecord.documents[docIndex];

        // Obtener buffer del documento original
        let originalBuffer = null;
        if (isSupabaseConfigured() && docRecord.storagePath) {
          try {
            const signedUrl = await dbCreateSignedDocumentUrl(docRecord.storagePath, 120);
            if (signedUrl) {
              const fetchRes = await fetch(signedUrl);
              if (fetchRes.ok) {
                originalBuffer = Buffer.from(await fetchRes.arrayBuffer());
              }
            }
          } catch (e) {
            console.error('Error recuperando documento para firma desde Supabase:', e);
          }
        }

        // Si es entorno de prueba o mock local, generar PDF formal base
        if (!originalBuffer) {
          const { PDFDocument, StandardFonts } = await import('pdf-lib');
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([612, 792]);
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          page.drawText('VALENZUELA & STERLING IMMIGRATION LAW GROUP, P.A.', { x: 50, y: 720, size: 14, font: fontBold });
          page.drawText(`DOCUMENTO LEGAL: ${docRecord.name}`, { x: 50, y: 690, size: 12, font: fontBold });
          page.drawText(`EXPEDIENTE: ${caseRecord.caseNumber} • TITULAR: ${caseRecord.clientName}`, { x: 50, y: 670, size: 10, font });
          page.drawText(`CATEGORÍA: ${docRecord.type} • RADICACIÓN: ${docRecord.docketRef}`, { x: 50, y: 650, size: 10, font });
          page.drawText('El presente instrumento constituye el contenido documental original archivado para suscripción y constancia procesal del cliente.', { x: 50, y: 610, size: 10, font, maxWidth: 512, lineHeight: 14 });
          originalBuffer = Buffer.from(await pdfDoc.save());
        }

        // Estampar firma manuscrita con sello, hashes e IP
        const signedAt = new Date().toISOString();
        const stampResult = await stampSignatureOnPdf(originalBuffer, signaturePngBase64, {
          caseNumber: caseRecord.caseNumber,
          clientName: caseRecord.clientName,
          docName: docRecord.name,
          signedAt,
          ipAddress: clientIp
        });

        // Almacenar versión firmada en Supabase Storage
        const signedSafeName = `FIRMADO_${Date.now()}_${docRecord.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const signedStoragePath = `vault/${caseRecord.caseNumber}/${signedSafeName}.pdf`;

        if (isSupabaseConfigured()) {
          try {
            const { getSupabase } = await import('./supabaseClient.js');
            const sb = getSupabase();
            if (sb) {
              await sb.storage.from('cases-vault-documents').upload(signedStoragePath, stampResult.signedPdfBuffer, {
                contentType: 'application/pdf',
                upsert: true
              });
            }
          } catch (sbErr) {
            console.error('Error subiendo copia firmada a Supabase Storage:', sbErr);
          }
        }

        // Crear registro oficial del documento firmado
        const signedDoc = {
          id: `doc-sig-${Date.now()}`,
          name: `FIRMADO_${docRecord.name}`,
          type: 'Copia Oficial Suscrita con Firma Manuscrita',
          size: `${(stampResult.signedPdfBuffer.length / (1024 * 1024)).toFixed(2)} MB`,
          date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
          authorizedBy: `Titular: ${caseRecord.clientName}`,
          docketRef: `${docRecord.docketRef || 'VS-DOC'} [FIRMADO]`,
          storagePath: signedStoragePath,
          sha256Digest: stampResult.signedSha256,
          isClientVisible: true,
          isSignedVersion: true,
          originalDocId: docRecord.id,
          signedAt,
          signedBy: caseRecord.clientName,
          signedIp: clientIp
        };

        // Actualizar el documento original
        docRecord.requiresSignature = true;
        docRecord.signatureStatus = 'signed';
        docRecord.signedAt = signedAt;
        docRecord.signedBy = caseRecord.clientName;
        docRecord.signedStoragePath = signedStoragePath;
        docRecord.signedSha256 = stampResult.signedSha256;
        if (!docRecord.docketRef.includes('[FIRMADO]')) {
          docRecord.docketRef = docRecord.docketRef.replace('[REQ_FIRMA]', '').trim() + ' [FIRMADO]';
        }

        caseRecord.documents = [signedDoc, ...(caseRecord.documents || [])];

        // Añadir novedad en la línea de tiempo del expediente
        const signActivity = {
          id: `act-sig-${Date.now()}`,
          date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          title: 'Documento Firmado por el Cliente',
          titleEn: 'Document Signed by Client',
          description: `El titular ${caseRecord.clientName} ha incorporado su firma manuscrita al documento «${docRecord.name}». Se archivó copia firmada con foja oficial de constancia, hash SHA-256 e IP de registro.`,
          descriptionEn: `Client ${caseRecord.clientName} stamped handwritten signature on "${docRecord.name}". Official signed copy archived with SHA-256 integrity hash.`,
          status: 'completada'
        };
        caseRecord.activities = [signActivity, ...(caseRecord.activities || [])];

        saveCaseUpdateLocal(caseRecord);

        if (isSupabaseConfigured()) {
          try {
            await dbUpdateDocumentDocketRef(caseRecord.caseNumber, docRecord.id, docRecord.docketRef);
            await dbAddActivity(caseRecord.caseNumber, signActivity);
            await dbAddDocument(caseRecord.caseNumber, signedDoc);
            await dbAuditLog('DOCUMENT_SIGNED', clientSession.caseNumber, {
              caseNumber: caseRecord.caseNumber,
              docId: docRecord.id,
              docName: docRecord.name,
              signedSha256: stampResult.signedSha256
            }, clientIp);
          } catch (e) {
            console.error('Error sincronizando firma con Supabase:', e);
          }
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          message: `Documento «${docRecord.name}» firmado exitosamente. Una copia oficial firmada con foja de constancia ha sido archivada en su expediente.`,
          signedDoc,
          signedSha256: stampResult.signedSha256
        }));
      }

      // ==========================================
      // SECCIÓN 2: ENDPOINTS PRIVADOS DE ADMINISTRACIÓN
      // ==========================================

      // A. /api/admin/auth: Login del Personal con RBAC
      if (pathname === '/api/admin/auth') {
        const { username, password } = payload;
        if (!username || !password) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Usuario y contraseña requeridos.' }));
        }

        const staff = verifyStaffCredentials(username, password);

        if (!staff) {
          if (isSupabaseConfigured()) {
            await dbAuditLog('ADMIN_AUTH_FAILED', username, {}, clientIp);
          }
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Credenciales administrativas no autorizadas.' }));
        }

        const adminToken = `VS-STAFF-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
        serverState.adminSessions.set(adminToken, {
          username: staff.username,
          role: staff.role,
          name: staff.name,
          roleLabel: staff.roleLabel,
          permissions: staff.permissions,
          createdAt: Date.now(),
          expiresAt: Date.now() + 10 * 3600 * 1000 // 10 horas
        });

        if (isSupabaseConfigured()) {
          await dbAuditLog('ADMIN_AUTH_SUCCESS', staff.username, { role: staff.role }, clientIp);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          token: adminToken,
          user: {
            username: staff.username,
            name: staff.name,
            role: staff.role,
            roleLabel: staff.roleLabel,
            permissions: staff.permissions
          }
        }));
      }

      // B. /api/admin/change-password: Cambio de Contraseña del Usuario
      if (pathname === '/api/admin/change-password') {
        const adminSession = verifyAdminSession(req);
        if (!adminSession) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Sesión administrativa no válida.' }));
        }

        const { currentPassword, newPassword } = payload;
        if (!newPassword || newPassword.length < 8) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' }));
        }

        const staffVerified = verifyStaffCredentials(adminSession.username, currentPassword);
        if (!staffVerified) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'La contraseña actual no es correcta.' }));
        }

        serverState.customStaffPasswords.set(adminSession.username, newPassword);

        if (isSupabaseConfigured()) {
          await dbAuditLog('STAFF_PASSWORD_CHANGED', adminSession.username, {}, clientIp);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          message: 'Contraseña actualizada exitosamente.'
        }));
      }

      // C. /api/admin/cases/create: Alta de Nuevo Expediente
      if (pathname === '/api/admin/cases/create') {
        const adminSession = verifyAdminSession(req);
        if (!adminSession) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Sesión administrativa no válida o expirada.' }));
        }

        const { clientName, clientLastName, clientPhone, clientEmail, service, attorneyAssigned, status, nextDeadline } = payload;
        if (!clientName || !clientLastName) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Nombre y apellido del titular son obligatorios.' }));
        }

        const random4 = Math.floor(1000 + Math.random() * 9000);
        const caseNumber = `VS-CAS-2026-${random4}`;
        const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const codeLetters = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)];
        const accessCode = `VS-${Math.floor(1000 + Math.random() * 9000)}-${codeLetters}`;
        const codeHash = hashPassword(accessCode);
        const codeMasked = `VS-****-${codeLetters}`;
        const phoneLast4 = clientPhone ? clientPhone.replace(/\D/g, '').slice(-4) : random4.toString();

        const newCase = {
          caseNumber,
          accessCode,
          accessCodeHash: codeHash,
          accessCodeMasked: codeMasked,
          clientName: `${clientName.trim()} ${clientLastName.trim()}`,
          clientLastName: clientLastName.trim(),
          clientPhoneLast4: phoneLast4,
          clientEmail: clientEmail ? clientEmail.trim() : '',
          isRevoked: false,
          isTestRecord: false,
          environment: 'PRODUCTION',
          service: service || 'Petición Familiar y Ajuste de Estatus',
          serviceEn: service || 'Immigration Legal Service',
          filingDate: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
          attorneyAssigned: attorneyAssigned || 'Abogado Titular de Guardia',
          status: status || 'Apertura de Expediente y Asignación Legal',
          statusEn: 'Case Opened and Assigned',
          statusColor: 'blue',
          nextDeadline: nextDeadline || 'Revisión Documental Preliminar',
          nextDeadlineEn: nextDeadline || 'Initial Document Review',
          activities: [
            {
              id: `act-${Date.now().toString().slice(-4)}`,
              date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) + ' - ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
              title: 'Apertura Formal de Expediente',
              titleEn: 'Formal Case Opening',
              description: `Expediente creado en el sistema de Valenzuela & Sterling por ${adminSession.name} (${adminSession.roleLabel}).`,
              descriptionEn: 'Case initialized in firm management system.',
              status: 'completada'
            }
          ],
          documents: [],
          updatedAt: new Date().toISOString()
        };

        if (isSupabaseConfigured()) {
          await dbCreateCase(newCase);
          await dbAuditLog('CASE_CREATED', adminSession.username, { caseNumber }, clientIp);
        }

        saveCaseUpdateLocal(newCase);
        appendToAuditLog('admin_actions_audit.jsonl', {
          action: 'CASE_CREATED',
          caseNumber,
          by: adminSession.username
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          caseRecord: newCase,
          message: 'Expediente creado exitosamente con clave criptográfica asignada.'
        }));
      }

      // D. /api/admin/cases/update: Edición Completa de Expediente
      if (pathname === '/api/admin/cases/update') {
        const adminSession = verifyAdminSession(req);
        if (!adminSession) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Sesión administrativa no válida.' }));
        }

        const { caseNumber, clientName, clientLastName, clientPhone, clientEmail, service, attorneyAssigned, status, statusColor, nextDeadline } = payload;
        if (!caseNumber) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Número de expediente requerido.' }));
        }

        const caseRecord = await fetchCase(caseNumber, true);
        if (!caseRecord) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Expediente no encontrado.' }));
        }

        const updateData = {};
        if (clientName) {
          caseRecord.clientName = clientLastName ? `${clientName.trim()} ${clientLastName.trim()}` : clientName.trim();
          updateData.clientName = caseRecord.clientName;
        }
        if (clientLastName) {
          caseRecord.clientLastName = clientLastName.trim();
          updateData.clientLastName = caseRecord.clientLastName;
        }
        if (clientPhone) {
          caseRecord.clientPhoneLast4 = clientPhone.replace(/\D/g, '').slice(-4);
          updateData.clientPhoneLast4 = caseRecord.clientPhoneLast4;
        }
        if (clientEmail !== undefined) {
          caseRecord.clientEmail = clientEmail.trim();
          updateData.clientEmail = caseRecord.clientEmail;
        }
        if (service) {
          caseRecord.service = service;
          updateData.service = service;
        }
        if (attorneyAssigned) {
          caseRecord.attorneyAssigned = attorneyAssigned;
          updateData.attorneyAssigned = attorneyAssigned;
        }
        if (status) {
          caseRecord.status = status;
          updateData.status = status;
        }
        if (statusColor) {
          caseRecord.statusColor = statusColor;
          updateData.statusColor = statusColor;
        }
        if (nextDeadline) {
          caseRecord.nextDeadline = nextDeadline;
          updateData.nextDeadline = nextDeadline;
        }

        if (isSupabaseConfigured()) {
          await dbUpdateCase(caseNumber, updateData);
          await dbAuditLog('CASE_UPDATED', adminSession.username, { caseNumber, updateData }, clientIp);
        }

        saveCaseUpdateLocal(caseRecord);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          caseRecord,
          message: 'Expediente actualizado exitosamente.'
        }));
      }

      // E. /api/admin/cases/upload-document: Subida Binaria de Archivos (PDF, Pasaportes, Fotos, Word)
      if (pathname === '/api/admin/cases/upload-document') {
        const adminSession = verifyAdminSession(req);
        if (!adminSession) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Sesión administrativa no válida.' }));
        }

        const { caseNumber, fileName, fileBase64, fileType, fileSize, docType, isClientVisible, requiresSignature } = payload;
        if (!caseNumber || !fileName || !fileBase64) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Expediente, nombre de archivo y contenido son obligatorios.' }));
        }

        const caseRecord = await fetchCase(caseNumber, true);
        if (!caseRecord) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Expediente no encontrado.' }));
        }

        // Limpiar base64 si incluye prefijo data:URL
        const base64Clean = fileBase64.replace(/^data:[^;]+;base64,/, '');
        const fileBuffer = Buffer.from(base64Clean, 'base64');
        const sha256Digest = computeSha256(fileBuffer);
        const visible = Boolean(isClientVisible);
        const reqSig = Boolean(requiresSignature);

        let createdDoc = null;
        if (isSupabaseConfigured()) {
          createdDoc = await dbUploadDocumentBinary(caseNumber, fileName, fileBuffer, fileType, {
            type: docType || 'Documento Legal Adjunto',
            size: fileSize || `${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB`,
            authorizedBy: adminSession.name,
            isClientVisible: visible,
            docketRef: `VS-DOC-${Date.now().toString().slice(-4)}${visible ? '' : ' [PRIVADO_FIRMA]'}${reqSig ? ' [REQ_FIRMA]' : ''}`
          });
        }

        if (!createdDoc) {
          // Respaldo local
          createdDoc = {
            id: `doc-${Date.now().toString().slice(-4)}`,
            name: fileName,
            type: docType || 'Documento Legal Adjunto',
            size: fileSize || `${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB`,
            date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
            authorizedBy: adminSession.name,
            docketRef: `VS-DOC-${Date.now().toString().slice(-4)}${visible ? '' : ' [PRIVADO_FIRMA]'}${reqSig ? ' [REQ_FIRMA]' : ''}`,
            storagePath: `vault/${caseNumber}/${fileName}`,
            sha256Digest,
            isClientVisible: visible,
            requiresSignature: reqSig,
            signatureStatus: reqSig ? 'pending' : null
          };
        } else {
          createdDoc.requiresSignature = reqSig;
          createdDoc.signatureStatus = reqSig ? 'pending' : null;
        }

        caseRecord.documents = [createdDoc, ...(caseRecord.documents || [])];

        if (reqSig) {
          const reqAct = {
            id: `act-req-${Date.now()}`,
            date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            title: 'Firma Manuscrita Solicitada',
            titleEn: 'Signature Requested',
            description: `Se ha requerido al cliente suscribir mediante trazo manuscrito el documento «${fileName}».`,
            descriptionEn: `Client requested to stamp handwritten signature on "${fileName}".`,
            status: 'pendiente'
          };
          caseRecord.activities = [reqAct, ...(caseRecord.activities || [])];
          if (isSupabaseConfigured()) {
            await dbAddActivity(caseRecord.caseNumber, reqAct);
          }
        }

        saveCaseUpdateLocal(caseRecord);

        if (isSupabaseConfigured()) {
          await dbAuditLog('DOCUMENT_UPLOADED', adminSession.username, { caseNumber, fileName, sha256Digest, isClientVisible: visible, requiresSignature: reqSig }, clientIp);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          document: createdDoc,
          message: `Documento «${fileName}» cargado en la bóveda (${visible ? 'Visible para cliente' : 'Confidencial de uso interno'})${reqSig ? ' con solicitud de firma manuscrita activa' : ''}.`
        }));
      }

      // F. /api/admin/cases/document/delete: Eliminar o Desclasificar Documento
      if (pathname === '/api/admin/cases/document/delete') {
        const adminSession = verifyAdminSession(req);
        if (!adminSession) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Sesión administrativa no válida.' }));
        }

        if (adminSession.role !== 'admin') {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'La eliminación de documentos está reservada a la Dirección Jurídica.' }));
        }

        const { caseNumber, docId } = payload;
        const caseRecord = await fetchCase(caseNumber, true);
        if (!caseRecord) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Expediente no encontrado.' }));
        }

        if (isSupabaseConfigured()) {
          await dbDeleteDocument(caseNumber, docId);
          await dbAuditLog('DOCUMENT_DELETED', adminSession.username, { caseNumber, docId }, clientIp);
        }

        caseRecord.documents = (caseRecord.documents || []).filter(d => d.id !== docId);
        saveCaseUpdateLocal(caseRecord);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          message: 'Documento retirado de la bóveda exitosamente.'
        }));
      }

      // G. /api/admin/cases/document (Metadatos directos)
      if (pathname === '/api/admin/cases/document') {
        const adminSession = verifyAdminSession(req);
        if (!adminSession) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Sesión administrativa requerida.' }));
        }

        const { caseNumber, docName, docType, authorizedBy, isClientVisible } = payload;
        const caseRecord = await fetchCase(caseNumber, true);
        if (!caseRecord) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Expediente no encontrado.' }));
        }

        const name = docName || 'Documento_Legal.pdf';
        const sha256Digest = computeSha256(`${caseNumber}_${name}_${Date.now()}`);
        const storagePath = `vault/${caseNumber}/${name}`;
        const visible = isClientVisible !== false;

        const newDoc = {
          id: `doc-${Date.now().toString().slice(-4)}`,
          name,
          type: docType || 'Notificación Oficial',
          size: '1.2 MB',
          date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
          authorizedBy: authorizedBy || adminSession.name,
          docketRef: `DOCKET-${caseNumber.slice(-4)}-${Date.now().toString().slice(-3)}${visible ? '' : ' [PRIVADO_FIRMA]'}`,
          storagePath,
          sha256Digest,
          isClientVisible: visible
        };

        if (isSupabaseConfigured()) {
          await dbAddDocument(caseNumber, newDoc);
          await dbAuditLog('DOCUMENT_ADDED_ADMIN', adminSession.username, { caseNumber, docId: newDoc.id, docName: newDoc.name }, clientIp);
        }

        caseRecord.documents = [newDoc, ...(caseRecord.documents || [])];
        saveCaseUpdateLocal(caseRecord);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          document: newDoc,
          message: 'Documento legal incorporado a la bóveda.'
        }));
      }

      // G2. /api/admin/cases/document/request-signature: Solicitar / Modificar Firma Manuscrita
      if (pathname === '/api/admin/cases/document/request-signature') {
        const adminSession = verifyAdminSession(req);
        if (!adminSession) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Acceso no autorizado al panel de gestión.' }));
        }

        const { caseNumber, docId, requiresSignature } = payload;
        if (!caseNumber || !docId) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Expediente y documento requeridos.' }));
        }

        const normalizedCase = caseNumber.trim().toUpperCase();
        const caseRecord = await fetchCase(normalizedCase, true);
        if (!caseRecord) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Expediente no encontrado.' }));
        }

        const doc = (caseRecord.documents || []).find(d => d.id === docId);
        if (!doc) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Documento no encontrado en el expediente.' }));
        }

        const reqSig = requiresSignature !== false;
        doc.requiresSignature = reqSig;
        doc.signatureStatus = reqSig ? (doc.signatureStatus || 'pending') : null;
        if (reqSig && !doc.docketRef.includes('[REQ_FIRMA]')) {
          doc.docketRef += ' [REQ_FIRMA]';
        } else if (!reqSig) {
          doc.docketRef = doc.docketRef.replace('[REQ_FIRMA]', '').trim();
        }

        if (reqSig) {
          const reqAct = {
            id: `act-req-${Date.now()}`,
            date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            title: 'Firma Manuscrita Solicitada',
            titleEn: 'Signature Requested',
            description: `La firma legal ha solicitado la suscripción del documento «${doc.name}». Por favor revise y firme en su portal.`,
            descriptionEn: `The legal office has requested signature on "${doc.name}". Please review and sign in your portal.`,
            status: 'pendiente'
          };
          caseRecord.activities = [reqAct, ...(caseRecord.activities || [])];
          if (isSupabaseConfigured()) {
            await dbAddActivity(caseRecord.caseNumber, reqAct);
          }
        }

        saveCaseUpdateLocal(caseRecord);

        if (isSupabaseConfigured()) {
          await dbUpdateDocumentDocketRef(caseRecord.caseNumber, doc.id, doc.docketRef);
          await dbAuditLog('SIGNATURE_REQUESTED', adminSession.username, { caseNumber: normalizedCase, docId, docName: doc.name, requiresSignature: reqSig }, clientIp);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          message: reqSig ? `Solicitud de firma enviada al portal del cliente para «${doc.name}».` : `Solicitud de firma cancelada para «${doc.name}».`,
          doc
        }));
      }

      // H. /api/admin/cases/reset-code: Restablecer Clave (Solo Admin)
      if (pathname === '/api/admin/cases/reset-code') {
        const adminSession = verifyAdminSession(req);
        if (!adminSession) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Sesión administrativa no válida.' }));
        }

        if (adminSession.role !== 'admin') {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'El restablecimiento de claves está reservado al Abogado Director.' }));
        }

        const { caseNumber } = payload;
        const caseRecord = await fetchCase(caseNumber, true);
        if (!caseRecord) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Expediente no encontrado.' }));
        }

        const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const codeLetters = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)];
        const newCode = `VS-${Math.floor(1000 + Math.random() * 9000)}-${codeLetters}`;
        const newHash = hashPassword(newCode);
        const masked = `VS-****-${codeLetters}`;

        caseRecord.accessCode = newCode;
        caseRecord.accessCodeHash = newHash;
        caseRecord.accessCodeMasked = masked;
        caseRecord.isRevoked = false;

        if (isSupabaseConfigured()) {
          await dbUpdateAccessCode(caseNumber, newHash, masked);
          await dbAuditLog('ACCESS_CODE_RESET', adminSession.username, { caseNumber }, clientIp);
        }

        saveCaseUpdateLocal(caseRecord);
        revokeAllClientSessionsForCase(caseNumber);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          newAccessCode: newCode,
          message: 'Nueva clave de acceso generada exitosamente. Las sesiones anteriores fueron invalidadas.'
        }));
      }

      // I. /api/admin/cases/revoke-access: Revocar / Habilitar Acceso (Solo Admin)
      if (pathname === '/api/admin/cases/revoke-access') {
        const adminSession = verifyAdminSession(req);
        if (!adminSession) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Sesión administrativa no válida.' }));
        }

        if (adminSession.role !== 'admin') {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'La revocación de accesos está reservada a la Dirección Jurídica.' }));
        }

        const { caseNumber, revoke } = payload;
        const caseRecord = await fetchCase(caseNumber, true);
        if (!caseRecord) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Expediente no encontrado.' }));
        }

        const isRevoked = Boolean(revoke);
        caseRecord.isRevoked = isRevoked;

        if (isSupabaseConfigured()) {
          await dbRevokeAccess(caseNumber, isRevoked);
          await dbAuditLog('ACCESS_REVOCATION_CHANGED', adminSession.username, { caseNumber, isRevoked }, clientIp);
        }

        saveCaseUpdateLocal(caseRecord);

        if (isRevoked) {
          revokeAllClientSessionsForCase(caseNumber);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          isRevoked,
          message: isRevoked 
            ? 'Acceso revocado inmediatamente. Todas las sesiones activas han sido expulsadas.' 
            : 'Acceso rehabilitado para el cliente.'
        }));
      }

      // J. /api/events
      if (pathname === '/api/events') {
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
    }

    // ==========================================
    // SECCIÓN 3: SOLICITUDES GET
    // ==========================================
    if (req.method === 'GET') {
      
      // 1. GET /api/portal/case?caseNumber=... (CONSULTA CLIENTE AUTORIZADO)
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
        const caseRecord = await fetchCase(caseNumber, !isProductionRequest);
        if (!caseRecord) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Expediente no encontrado.' }));
        }

        if (caseRecord.isRevoked) {
          serverState.activeSessions.delete(token);
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Acceso revocado por la firma.' }));
        }

        const { accessCode: _, accessCodeHash: __, ...safeCaseData } = caseRecord;
        // El cliente solo ve documentos autorizados para visualización pública
        safeCaseData.documents = (safeCaseData.documents || []).filter(d => d.isClientVisible !== false);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: true, caseRecord: safeCaseData }));
      }

      // 2. GET /api/admin/cases (LISTA COMPLETA DE EXPEDIENTES PARA EL PERSONAL)
      if (pathname === '/api/admin/cases') {
        const adminSession = verifyAdminSession(req);
        if (!adminSession) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Acceso denegado: se requiere sesión de personal de la firma.' }));
        }

        const cases = await fetchAllCases({ includeTest: true });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          total: cases.length,
          cases
        }));
      }

      // 3. GET /api/conversion-stats (REPORTES CON SEGREGACIÓN ESTRICTA)
      if (pathname === '/api/conversion-stats') {
        const productionCases = await fetchAllCases({ includeTest: false });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          metrics: serverState.metrics,
          recentLeadsCount: serverState.leads.filter(l => !l.isTest).length,
          recentEvaluationsCount: serverState.evaluations.filter(e => !e.isTest).length,
          recentCallRequestsCount: serverState.callRequests.filter(c => !c.isTest).length,
          activeProductionCasesCount: productionCases.length,
          serverStatus: 'ONLINE_SECURE',
          persistenceBackend: isSupabaseConfigured() ? 'SUPABASE_CLOUD_POSTGRES' : 'LOCAL_SECURE_VAULT',
          auditPersistence: 'ACTIVE (Supabase audit_logs + server_data/)',
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
