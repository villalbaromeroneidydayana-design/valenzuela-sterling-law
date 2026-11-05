import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

if (fs.existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://splwobultffizbzwvtsn.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY no está definida.');
  process.exit(1);
}

console.log('--- Verificando Conectividad con Supabase Cloud ---');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runLiveAudit() {
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

  // 1. Verificar lectura de tabla cases
  const { data: cases, error: casesErr } = await supabase
    .from('cases')
    .select('*, activities(*), documents(*)');

  assert('Consulta de tabla "cases"', !casesErr && Array.isArray(cases), casesErr?.message);
  assert('Presencia de 2 casos de prueba ficticios', cases && cases.length >= 2, `Encontrados: ${cases?.length}`);

  const case1 = cases?.find(c => c.case_number === 'VS-TEST-2026-9001');
  const case2 = cases?.find(c => c.case_number === 'VS-TEST-2026-9002');

  assert('Caso VS-TEST-2026-9001 existe', Boolean(case1), 'No encontrado');
  assert('Caso VS-TEST-2026-9002 existe', Boolean(case2), 'No encontrado');

  // 2. Verificar datos de confirmación para Triple Factor
  assert('Caso 1 tiene client_last_name y phone_last4', 
    case1 && case1.client_last_name === 'Méndez' && case1.client_phone_last4 === '9001');
  assert('Caso 2 tiene client_last_name y phone_last4', 
    case2 && case2.client_last_name === 'Ramos' && case2.client_phone_last4 === '9002');

  // 3. Verificar actividades y documentos vinculados
  assert('Caso 1 tiene actividades asociadas', case1?.activities?.length > 0, `Actividades: ${case1?.activities?.length}`);
  assert('Caso 1 tiene documentos vinculados', case1?.documents?.length > 0, `Documentos: ${case1?.documents?.length}`);

  // 4. Verificar tabla de intentos fallidos anti brute-force
  const testIdentifier = 'TEST_AUDIT_IDENTIFIER_' + Date.now();
  const { error: insertAttemptErr } = await supabase
    .from('auth_failed_attempts')
    .insert({ identifier: testIdentifier, attempt_count: 1, last_attempt_at: new Date().toISOString() });
  
  assert('Escritura en tabla auth_failed_attempts', !insertAttemptErr, insertAttemptErr?.message);

  // Limpieza del registro de prueba
  await supabase.from('auth_failed_attempts').delete().eq('identifier', testIdentifier);

  // 5. Verificar bucket privado cases-vault-documents
  const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
  const vaultBucket = buckets?.find(b => b.name === 'cases-vault-documents');
  assert('Bucket privado "cases-vault-documents" existe', Boolean(vaultBucket), bucketErr?.message || 'Bucket no encontrado');
  if (vaultBucket) {
    assert('Bucket es PRIVADO (public: false)', vaultBucket.public === false, `public = ${vaultBucket.public}`);
  }

  // 6. Resumen
  console.log(`\n========================================`);
  console.log(`Auditoría Supabase en Vivo: ${passed}/${total} verificaciones exitosas`);
  console.log(`========================================`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runLiveAudit().catch(err => {
  console.error('Error fatal durante la auditoría:', err);
  process.exit(1);
});
