import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Cargar variables de .env.local si no están provistas por el host (desarrollo local seguro)
if (!process.env.SUPABASE_SERVICE_ROLE_KEY && fs.existsSync('.env.local')) {
  try {
    process.loadEnvFile('.env.local');
  } catch (e) {}
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseInstance = null;

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabase() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseInstance;
}

/**
 * Normaliza un registro de base de datos a formato de aplicación
 */
function normalizeCaseRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    caseNumber: row.case_number,
    accessCodeHash: row.access_code_hash,
    accessCodeMasked: row.access_code_masked,
    clientName: row.client_name,
    clientLastName: row.client_last_name,
    clientPhoneLast4: row.client_phone_last4,
    clientEmail: row.client_email,
    service: row.service,
    serviceEn: row.service_en,
    filingDate: row.filing_date,
    attorneyAssigned: row.attorney_assigned,
    status: row.status,
    statusEn: row.status_en,
    statusColor: row.status_color,
    nextDeadline: row.next_deadline,
    nextDeadlineEn: row.next_deadline_en,
    isRevoked: Boolean(row.is_revoked),
    isTestRecord: Boolean(row.is_test_record),
    environment: row.environment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    activities: (row.activities || []).map(a => ({
      id: a.id,
      date: a.date_display,
      title: a.title,
      titleEn: a.title_en,
      description: a.description,
      descriptionEn: a.description_en,
      status: a.status
    })),
    documents: (row.documents || []).map(d => {
      const isConfidential = (d.docket_ref && d.docket_ref.includes('[PRIVADO_FIRMA]')) || 
                             (d.type && d.type.toLowerCase().includes('privado')) ||
                             (d.name && d.name.toLowerCase().includes('interno_confidencial'));
      const isSigned = (d.docket_ref && d.docket_ref.includes('[FIRMADO]')) || (d.name && d.name.startsWith('FIRMADO_'));
      const reqSig = (d.docket_ref && d.docket_ref.includes('[REQ_FIRMA]')) || isSigned;
      return {
        id: d.id,
        name: d.name,
        type: d.type,
        size: d.size,
        storagePath: d.storage_path,
        sha256Digest: d.sha256_digest,
        authorizedBy: d.authorized_by,
        docketRef: d.docket_ref,
        isClientVisible: !isConfidential,
        requiresSignature: reqSig,
        signatureStatus: isSigned ? 'signed' : (reqSig ? 'pending' : null),
        isSignedVersion: Boolean(isSigned),
        date: new Date(d.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
      };
    })
  };
}

/**
 * Consulta todos los expedientes en Supabase
 */
export async function dbGetAllCases({ includeTest = true } = {}) {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    let query = sb
      .from('cases')
      .select('*, activities(*), documents(*)')
      .order('created_at', { ascending: false });

    if (!includeTest) {
      query = query.eq('is_test_record', false);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error dbGetAllCases:', error);
      return null;
    }

    return (data || []).map(normalizeCaseRecord);
  } catch (err) {
    console.error('Excepción en dbGetAllCases:', err);
    return null;
  }
}

/**
 * Consulta un expediente por su número en Supabase
 */
export async function dbGetCaseByNumber(caseNumber) {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data: caseRecord, error } = await sb
      .from('cases')
      .select('*, activities(*), documents(*)')
      .ilike('case_number', caseNumber.trim())
      .single();

    if (error || !caseRecord) return null;

    return normalizeCaseRecord(caseRecord);
  } catch (err) {
    console.error('Error en consulta de caso en Supabase:', err);
    return null;
  }
}

/**
 * Crea un nuevo expediente en Supabase
 */
export async function dbCreateCase(caseData) {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data: newCase, error } = await sb
      .from('cases')
      .insert({
        case_number: caseData.caseNumber,
        access_code_hash: caseData.accessCodeHash || '',
        access_code_masked: caseData.accessCodeMasked || '',
        client_name: caseData.clientName,
        client_last_name: caseData.clientLastName,
        client_phone_last4: caseData.clientPhoneLast4,
        client_email: caseData.clientEmail || '',
        service: caseData.service,
        service_en: caseData.serviceEn || caseData.service,
        filing_date: caseData.filingDate,
        attorney_assigned: caseData.attorneyAssigned,
        status: caseData.status,
        status_en: caseData.statusEn || caseData.status,
        status_color: caseData.statusColor || 'blue',
        next_deadline: caseData.nextDeadline,
        next_deadline_en: caseData.nextDeadlineEn || caseData.nextDeadline,
        is_revoked: false,
        is_test_record: Boolean(caseData.isTestRecord),
        environment: caseData.environment || 'PRODUCTION'
      })
      .select()
      .single();

    if (error || !newCase) {
      console.error('Error insertando caso en Supabase:', error);
      return null;
    }

    if (caseData.activities && caseData.activities.length > 0) {
      for (const act of caseData.activities) {
        await sb.from('activities').insert({
          case_id: newCase.id,
          case_number: newCase.case_number,
          date_display: act.date || new Date().toISOString(),
          title: act.title,
          title_en: act.titleEn || act.title,
          description: act.description,
          description_en: act.descriptionEn || act.description,
          status: act.status || 'completada'
        });
      }
    }

    return dbGetCaseByNumber(newCase.case_number);
  } catch (err) {
    console.error('Excepción al crear caso en Supabase:', err);
    return null;
  }
}

/**
 * Actualiza los datos de un expediente existente
 */
export async function dbUpdateCase(caseNumber, updateData) {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const updatePayload = {
      updated_at: new Date().toISOString()
    };
    if (updateData.clientName) updatePayload.client_name = updateData.clientName;
    if (updateData.clientLastName) updatePayload.client_last_name = updateData.clientLastName;
    if (updateData.clientPhoneLast4) updatePayload.client_phone_last4 = updateData.clientPhoneLast4;
    if (updateData.clientEmail !== undefined) updatePayload.client_email = updateData.clientEmail;
    if (updateData.service) updatePayload.service = updateData.service;
    if (updateData.attorneyAssigned) updatePayload.attorney_assigned = updateData.attorneyAssigned;
    if (updateData.status) updatePayload.status = updateData.status;
    if (updateData.statusColor) updatePayload.status_color = updateData.statusColor;
    if (updateData.nextDeadline) updatePayload.next_deadline = updateData.nextDeadline;

    const { error } = await sb
      .from('cases')
      .update(updatePayload)
      .ilike('case_number', caseNumber.trim());

    return !error;
  } catch (err) {
    console.error('Error actualizando caso en Supabase:', err);
    return false;
  }
}

/**
 * Añade una actividad al expediente
 */
export async function dbAddActivity(caseNumber, activityData) {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { data: c, error: fetchErr } = await sb
      .from('cases')
      .select('id, case_number')
      .ilike('case_number', caseNumber.trim())
      .single();

    if (fetchErr || !c) return false;

    const { error: insertErr } = await sb.from('activities').insert({
      case_id: c.id,
      case_number: c.case_number,
      date_display: activityData.date,
      title: activityData.title,
      title_en: activityData.titleEn || activityData.title,
      description: activityData.description,
      description_en: activityData.descriptionEn || activityData.description,
      status: activityData.status || 'completada'
    });

    if (insertErr) {
      console.error('Error insertando actividad en Supabase:', insertErr);
      return false;
    }

    await sb.from('cases').update({ updated_at: new Date().toISOString() }).eq('id', c.id);
    return true;
  } catch (err) {
    console.error('Excepción al añadir actividad en Supabase:', err);
    return false;
  }
}

/**
 * Añade un documento al expediente (metadatos)
 */
export async function dbAddDocument(caseNumber, docData) {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { data: c, error: fetchErr } = await sb
      .from('cases')
      .select('id, case_number')
      .ilike('case_number', caseNumber.trim())
      .single();

    if (fetchErr || !c) return false;

    let docketRef = docData.docketRef || `VS-DOC-${Date.now()}`;
    if (docData.isClientVisible === false && !docketRef.includes('[PRIVADO_FIRMA]')) {
      docketRef += ' [PRIVADO_FIRMA]';
    }

    const { error: insertErr } = await sb.from('documents').insert({
      case_id: c.id,
      case_number: c.case_number,
      name: docData.name,
      type: docData.type,
      size: docData.size || '1.0 MB',
      storage_path: docData.storagePath || `vault/${c.case_number}/${docData.name}`,
      sha256_digest: docData.sha256Digest,
      authorized_by: docData.authorizedBy || 'Dirección Legal Valenzuela & Sterling',
      docket_ref: docketRef
    });

    if (insertErr) {
      console.error('Error insertando documento en Supabase:', insertErr);
      return false;
    }

    await sb.from('cases').update({ updated_at: new Date().toISOString() }).eq('id', c.id);
    return true;
  } catch (err) {
    console.error('Excepción al registrar documento en Supabase:', err);
    return false;
  }
}

/**
 * Sube un archivo real binario a Supabase Storage y registra el documento en BD
 */
export async function dbUploadDocumentBinary(caseNumber, fileName, fileBuffer, mimeType, docMetadata = {}) {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data: c, error: cErr } = await sb
      .from('cases')
      .select('id, case_number')
      .ilike('case_number', caseNumber.trim())
      .single();

    if (cErr || !c) return null;

    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `vault/${c.case_number}/${Date.now()}_${safeFileName}`;

    // Subir a Storage
    const { error: uploadErr } = await sb.storage
      .from('cases-vault-documents')
      .upload(storagePath, fileBuffer, {
        contentType: mimeType || 'application/octet-stream',
        upsert: true
      });

    if (uploadErr) {
      console.error('Error subiendo archivo a Supabase Storage:', uploadErr);
      return null;
    }

    // Calcular SHA-256
    const cryptoModule = await import('crypto');
    const sha256 = cryptoModule.default.createHash('sha256').update(fileBuffer).digest('hex');

    const isVisible = docMetadata.isClientVisible !== false;
    let docketRef = docMetadata.docketRef || `VS-DOC-${Date.now().toString().slice(-6)}`;
    if (!isVisible && !docketRef.includes('[PRIVADO_FIRMA]')) {
      docketRef += ' [PRIVADO_FIRMA]';
    }

    const { data: docRecord, error: insertErr } = await sb
      .from('documents')
      .insert({
        case_id: c.id,
        case_number: c.case_number,
        name: fileName,
        type: docMetadata.type || 'Documento Legal Oficial',
        size: docMetadata.size || `${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB`,
        storage_path: storagePath,
        sha256_digest: sha256,
        authorized_by: docMetadata.authorizedBy || 'Dirección Legal Valenzuela & Sterling',
        docket_ref: docketRef
      })
      .select()
      .single();

    if (insertErr || !docRecord) {
      console.error('Error registrando documento en Supabase:', insertErr);
      return null;
    }

    return {
      id: docRecord.id,
      name: docRecord.name,
      type: docRecord.type,
      size: docRecord.size,
      storagePath: docRecord.storage_path,
      sha256Digest: docRecord.sha256_digest,
      authorizedBy: docRecord.authorized_by,
      docketRef: docRecord.docket_ref,
      isClientVisible: isVisible,
      date: new Date(docRecord.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    };
  } catch (err) {
    console.error('Excepción al subir documento binario en Supabase:', err);
    return null;
  }
}

/**
 * Elimina un documento de la bóveda (Storage + BD)
 */
export async function dbDeleteDocument(caseNumber, docId) {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { data: doc, error: fetchErr } = await sb
      .from('documents')
      .select('id, storage_path, case_number')
      .eq('id', docId)
      .ilike('case_number', caseNumber.trim())
      .single();

    if (fetchErr || !doc) return false;

    if (doc.storage_path) {
      await sb.storage.from('cases-vault-documents').remove([doc.storage_path]);
    }

    const { error: delErr } = await sb.from('documents').delete().eq('id', doc.id);
    return !delErr;
  } catch (err) {
    console.error('Error eliminando documento en Supabase:', err);
    return false;
  }
}

/**
 * Actualiza el docket_ref (y flags de firma) de un documento en Supabase
 */
export async function dbUpdateDocumentDocketRef(caseNumber, docId, newDocketRef) {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb
      .from('documents')
      .update({ docket_ref: newDocketRef })
      .eq('id', docId);

    return !error;
  } catch (err) {
    console.error('Error actualizando docket_ref en Supabase:', err);
    return false;
  }
}

/**
 * Actualiza la clave de acceso de un expediente (hash criptográfico y máscara)
 */
export async function dbUpdateAccessCode(caseNumber, newCodeHash, maskedCode) {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb
      .from('cases')
      .update({
        access_code_hash: newCodeHash,
        access_code_masked: maskedCode,
        is_revoked: false,
        updated_at: new Date().toISOString()
      })
      .ilike('case_number', caseNumber.trim());

    return !error;
  } catch (err) {
    console.error('Excepción al actualizar clave en Supabase:', err);
    return false;
  }
}

/**
 * Revoca o rehabilita el acceso al expediente
 */
export async function dbRevokeAccess(caseNumber, isRevoked) {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb
      .from('cases')
      .update({
        is_revoked: Boolean(isRevoked),
        updated_at: new Date().toISOString()
      })
      .ilike('case_number', caseNumber.trim());

    return !error;
  } catch (err) {
    console.error('Excepción al revocar acceso en Supabase:', err);
    return false;
  }
}

/**
 * Consulta y control persistente de intentos fallidos (Anti-Brute-Force) en Supabase
 */
export async function dbCheckFailedAttempts(identifier) {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data } = await sb
      .from('auth_failed_attempts')
      .select('*')
      .eq('identifier', identifier)
      .single();

    if (!data) return { count: 0, isLocked: false };

    const now = new Date();
    const lockedUntil = data.locked_until ? new Date(data.locked_until) : null;
    const isLocked = lockedUntil && lockedUntil > now;

    return {
      count: data.attempt_count || 0,
      isLocked,
      lockedUntil: isLocked ? lockedUntil.toISOString() : null
    };
  } catch (err) {
    return { count: 0, isLocked: false };
  }
}

/**
 * Registra intento fallido persistente en Supabase
 */
export async function dbRecordFailedAttempt(identifier) {
  const sb = getSupabase();
  if (!sb) return;

  try {
    const { data: existing } = await sb
      .from('auth_failed_attempts')
      .select('*')
      .eq('identifier', identifier)
      .single();

    const count = (existing?.attempt_count || 0) + 1;
    let lockedUntil = null;

    if (count >= 5) {
      lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // Bloqueo 15 min
    }

    await sb
      .from('auth_failed_attempts')
      .upsert({
        identifier,
        attempt_count: count,
        locked_until: lockedUntil,
        last_attempt_at: new Date().toISOString()
      });
  } catch (err) {
    console.error('Error registrando intento fallido en Supabase:', err);
  }
}

/**
 * Resetea intentos fallidos tras login exitoso
 */
export async function dbResetFailedAttempts(identifier) {
  const sb = getSupabase();
  if (!sb) return;

  try {
    await sb
      .from('auth_failed_attempts')
      .delete()
      .eq('identifier', identifier);
  } catch (err) {
    console.error('Error reseteando intentos fallidos en Supabase:', err);
  }
}

/**
 * Genera una URL firmada temporal de descarga de un archivo del bucket privado
 * Expira automáticamente tras los segundos indicados (default: 300 seg = 5 min).
 */
export async function dbCreateSignedDocumentUrl(storagePath, expiresInSeconds = 300) {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .storage
      .from('cases-vault-documents')
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data) return null;
    return data.signedUrl;
  } catch (err) {
    console.error('Error generando URL firmada en Supabase Storage:', err);
    return null;
  }
}

/**
 * Registra un evento en la bitácora inmutable de auditoría
 */
export async function dbAuditLog(action, actor, details = {}, ipAddress = null) {
  const sb = getSupabase();
  if (!sb) return;

  try {
    await sb.from('audit_logs').insert({
      action,
      actor,
      details,
      ip_address: ipAddress,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error registrando auditoría en Supabase:', err);
  }
}
