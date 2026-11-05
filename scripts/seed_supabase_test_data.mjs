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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seedData() {
  console.log('--- Insertando Actividades y Documentos de Prueba en Supabase ---');

  const { data: cases, error: fetchErr } = await supabase
    .from('cases')
    .select('id, case_number')
    .in('case_number', ['VS-TEST-2026-9001', 'VS-TEST-2026-9002']);

  if (fetchErr || !cases || cases.length === 0) {
    console.error('Error al consultar casos existentes:', fetchErr);
    process.exit(1);
  }

  const case1 = cases.find(c => c.case_number === 'VS-TEST-2026-9001');
  const case2 = cases.find(c => c.case_number === 'VS-TEST-2026-9002');

  if (case1) {
    const { count: actCount1 } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('case_number', case1.case_number);

    if (actCount1 === 0) {
      await supabase.from('activities').insert({
        case_id: case1.id,
        case_number: case1.case_number,
        date_display: '01 Nov 2026 - 09:00 AM',
        title: 'Apertura de Expediente de Prueba',
        title_en: 'Sample Case File Initiated',
        description: 'Registro de datos ficticios para validación técnica de protocolos de seguridad y portal de clientes.',
        description_en: 'Fictitious entry registered for technical verification of client portal protocols.',
        status: 'completada'
      });
      console.log('Actividad insertada para VS-TEST-2026-9001');
    }

    const { count: docCount1 } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('case_number', case1.case_number);

    if (docCount1 === 0) {
      await supabase.from('documents').insert({
        case_id: case1.id,
        case_number: case1.case_number,
        name: 'Borrador_Resumen_Caso_9001.txt',
        type: 'Borrador Informativo de Trabajo',
        size: '1.2 KB',
        storage_path: 'vault/VS-TEST-2026-9001/Borrador_Resumen_Caso_9001.txt',
        sha256_digest: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        authorized_by: 'Coordinación Legal de Prueba',
        docket_ref: 'TEST-DOCKET-9001-FICTITIOUS'
      });
      console.log('Documento insertado para VS-TEST-2026-9001');
    }
  }

  if (case2) {
    const { count: actCount2 } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('case_number', case2.case_number);

    if (actCount2 === 0) {
      await supabase.from('activities').insert({
        case_id: case2.id,
        case_number: case2.case_number,
        date_display: '03 Nov 2026 - 11:30 AM',
        title: 'Ingreso al Sistema de Gestión',
        title_en: 'System Docket Entry',
        description: 'Expediente independiente para pruebas de separación estricta entre clientes.',
        description_en: 'Independent file for strict cross-client isolation verification.',
        status: 'completada'
      });
      console.log('Actividad insertada para VS-TEST-2026-9002');
    }

    const { count: docCount2 } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('case_number', case2.case_number);

    if (docCount2 === 0) {
      await supabase.from('documents').insert({
        case_id: case2.id,
        case_number: case2.case_number,
        name: 'Guia_Documental_Caso_9002.txt',
        type: 'Guía Documental Interna',
        size: '1.5 KB',
        storage_path: 'vault/VS-TEST-2026-9002/Guia_Documental_Caso_9002.txt',
        sha256_digest: 'b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01',
        authorized_by: 'Equipo de Admisión',
        docket_ref: 'TEST-DOCKET-9002-FICTITIOUS'
      });
      console.log('Documento insertado para VS-TEST-2026-9002');
    }
  }

  console.log('Datos iniciales sembrados con éxito.');
}

seedData().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
