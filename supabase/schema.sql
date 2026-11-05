-- ==============================================================================
-- VALENZUELA & STERLING IMMIGRATION LAW GROUP, P.A.
-- ESQUEMA DE BASE DE DATOS Y BÓVEDA SEGURA EN SUPABASE (POSTGRESQL + S3 STORAGE)
-- ==============================================================================

-- 1. EXTENSIONES CRIPTOGRÁFICAS Y UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLA PRINCIPAL: cases (Expedientes Migratorios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(60) UNIQUE NOT NULL,
    access_code_hash TEXT NOT NULL,
    access_code_masked VARCHAR(30) NOT NULL,
    client_name TEXT NOT NULL,
    client_last_name TEXT NOT NULL,
    client_phone_last4 VARCHAR(10) NOT NULL,
    client_email TEXT,
    service TEXT NOT NULL,
    service_en TEXT,
    filing_date TEXT NOT NULL,
    attorney_assigned TEXT NOT NULL,
    status TEXT NOT NULL,
    status_en TEXT,
    status_color VARCHAR(30) DEFAULT 'emerald',
    next_deadline TEXT,
    next_deadline_en TEXT,
    is_revoked BOOLEAN DEFAULT false,
    is_test_record BOOLEAN DEFAULT false,
    environment VARCHAR(30) DEFAULT 'PRODUCTION',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_case_number ON public.cases(case_number);
CREATE INDEX IF NOT EXISTS idx_cases_client_last_name ON public.cases(client_last_name);
CREATE INDEX IF NOT EXISTS idx_cases_environment ON public.cases(environment);

-- ==============================================================================
-- 3. TABLA: activities (Historial de Novedades y Gestiones Procesales)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    case_number VARCHAR(60) NOT NULL,
    date_display TEXT NOT NULL,
    title TEXT NOT NULL,
    title_en TEXT,
    description TEXT NOT NULL,
    description_en TEXT,
    status VARCHAR(30) DEFAULT 'completada',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_case_number ON public.activities(case_number);
CREATE INDEX IF NOT EXISTS idx_activities_case_id ON public.activities(case_id);

-- ==============================================================================
-- 4. TABLA: documents (Bóveda de Documentos Legales Autorizados)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    case_number VARCHAR(60) NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size VARCHAR(30),
    storage_path TEXT NOT NULL, -- Ruta interna en el Bucket Privado de Supabase
    sha256_digest VARCHAR(64) NOT NULL,
    authorized_by TEXT NOT NULL,
    docket_ref VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_case_number ON public.documents(case_number);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON public.documents(case_id);

-- ==============================================================================
-- 5. TABLA: auth_failed_attempts (Control Anti-Fuerza Bruta Persistente en Cloud)
-- Persiste entre invocaciones Serverless de Vercel para impedir ataques distribuidos.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.auth_failed_attempts (
    identifier VARCHAR(100) PRIMARY KEY, -- case_number o dirección IP
    attempt_count INT DEFAULT 1,
    locked_until TIMESTAMPTZ,
    last_attempt_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failed_attempts_locked_until ON public.auth_failed_attempts(locked_until);

-- ==============================================================================
-- 6. TABLA: audit_logs (Bitácora de Auditoría Criptográfica Inmutable)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(60) NOT NULL,
    actor VARCHAR(100) NOT NULL,
    case_number VARCHAR(60),
    ip_address VARCHAR(60),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_case_number ON public.audit_logs(case_number);

-- ==============================================================================
-- 7. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- Principio de Mínimo Privilegio: Acceso público anónimo totalmente denegado.
-- ==============================================================================
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_failed_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Denegar todo acceso anónimo (Anon Role)
DROP POLICY IF EXISTS "Deny anon access on cases" ON public.cases;
CREATE POLICY "Deny anon access on cases" ON public.cases FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "Deny anon access on activities" ON public.activities;
CREATE POLICY "Deny anon access on activities" ON public.activities FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "Deny anon access on documents" ON public.documents;
CREATE POLICY "Deny anon access on documents" ON public.documents FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "Deny anon access on auth_failed_attempts" ON public.auth_failed_attempts;
CREATE POLICY "Deny anon access on auth_failed_attempts" ON public.auth_failed_attempts FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "Deny anon access on audit_logs" ON public.audit_logs;
CREATE POLICY "Deny anon access on audit_logs" ON public.audit_logs FOR ALL TO anon USING (false);

-- Permitir acceso completo exclusivamente al Service Role (Backend Node en Vercel)
DROP POLICY IF EXISTS "Allow service role full access on cases" ON public.cases;
CREATE POLICY "Allow service role full access on cases" ON public.cases FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role full access on activities" ON public.activities;
CREATE POLICY "Allow service role full access on activities" ON public.activities FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role full access on documents" ON public.documents;
CREATE POLICY "Allow service role full access on documents" ON public.documents FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role full access on auth_failed_attempts" ON public.auth_failed_attempts;
CREATE POLICY "Allow service role full access on auth_failed_attempts" ON public.auth_failed_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role full access on audit_logs" ON public.audit_logs;
CREATE POLICY "Allow service role full access on audit_logs" ON public.audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==============================================================================
-- 8. CONFIGURACIÓN DEL BUCKET PRIVADO DE STORAGE: cases-vault-documents
-- ==============================================================================
-- Crear el bucket privado si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'cases-vault-documents',
    'cases-vault-documents',
    false, -- 100% PRIVADO (Sin acceso público por URL directa)
    26214400, -- Límite 25 MB por archivo
    ARRAY['application/pdf', 'text/plain', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Política de Storage: Acceso reservado al backend (service_role)
DROP POLICY IF EXISTS "Service role access on cases-vault-documents" ON storage.objects;
CREATE POLICY "Service role access on cases-vault-documents"
ON storage.objects FOR ALL TO service_role
USING (bucket_id = 'cases-vault-documents')
WITH CHECK (bucket_id = 'cases-vault-documents');

-- ==============================================================================
-- 9. REGISTROS FICTICIOS INICIALES PARA PRUEBAS (ISOLATION TEST SUITE)
-- ==============================================================================

-- Caso de Prueba A: Carlos Méndez (Asilo Ficticio)
INSERT INTO public.cases (
    case_number, access_code_hash, access_code_masked,
    client_name, client_last_name, client_phone_last4,
    service, service_en, filing_date, attorney_assigned,
    status, status_en, status_color, next_deadline, next_deadline_en,
    is_revoked, is_test_record, environment
) VALUES (
    'VS-TEST-2026-9001',
    -- Hash scrypt de PRUEBA-9001
    'scrypt$b0f1a2c3d4e5f67890123456789abcdef$a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
    'VS-****-9001',
    'Carlos Méndez (Cliente de Prueba)',
    'Méndez',
    '9001',
    'Defensa de Asilo ante Corte EOIR (Ficticio)',
    'Defensive Asylum before EOIR Court (Sample)',
    '01 Noviembre 2026',
    'Abogado Titular de Guardia',
    'Fase Inicial de Preparación',
    'Initial Case Preparation Stage',
    'amber',
    'Audiencia Preliminar EOIR: 18 Diciembre 2026',
    'Preliminary Master Hearing EOIR: Dec 18, 2026',
    false, true, 'TEST_ONLY'
)
ON CONFLICT (case_number) DO NOTHING;

-- Caso de Prueba B: Lucía Ramos (Petición Familiar Ficticia)
INSERT INTO public.cases (
    case_number, access_code_hash, access_code_masked,
    client_name, client_last_name, client_phone_last4,
    service, service_en, filing_date, attorney_assigned,
    status, status_en, status_color, next_deadline, next_deadline_en,
    is_revoked, is_test_record, environment
) VALUES (
    'VS-TEST-2026-9002',
    -- Hash scrypt de PRUEBA-9002
    'scrypt$c1d2e3f4a5b67890123456789abcdef0$b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01',
    'VS-****-9002',
    'Lucía Ramos (Cliente de Prueba B)',
    'Ramos',
    '9002',
    'Petición Familiar I-130 (Ficticio)',
    'Family Petition I-130 (Sample)',
    '03 Noviembre 2026',
    'Lic. John Alfonso',
    'Revisión de Requisitos Preliminar',
    'Preliminary Requirements Review',
    'blue',
    'Revisión Biométrica: 10 Diciembre 2026',
    'Biometric Review: Dec 10, 2026',
    false, true, 'TEST_ONLY'
)
ON CONFLICT (case_number) DO NOTHING;

