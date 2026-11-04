import React, { useState } from 'react';
import { 
  FileCheck, Shield, Lock, X, CheckCircle2, Clock, 
  Calendar, FileText, Download, Phone, AlertCircle, ArrowRight, User 
} from 'lucide-react';
import { FIRM_CONFIG } from '../data/demoData';

export default function ClientPortalModal({ isOpen, onClose, lang = 'es' }) {
  const [caseNumber, setCaseNumber] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [authenticatedCase, setAuthenticatedCase] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState('');

  // Autenticación Real del Lado del Servidor
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!caseNumber.trim() || !accessCode.trim()) {
      setError(lang === 'es' ? 'Ingrese su número de expediente y código de acceso.' : 'Please enter case number and access code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/portal/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseNumber: caseNumber.trim(),
          accessCode: accessCode.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSessionToken(data.token);
        setAuthenticatedCase(data.caseRecord);
      } else {
        setError(data.error || (lang === 'es' ? 'Credenciales no autorizadas o expediente no encontrado.' : 'Unauthorized credentials or case not found.'));
      }
    } catch (err) {
      setError(lang === 'es' ? 'Error de conexión con la bóveda del servidor.' : 'Connection error with vault server.');
    } finally {
      setLoading(false);
    }
  };

  // Ayudante de prueba exclusivo para entorno de desarrollo local (DEV)
  const loadDemo = () => {
    setCaseNumber('VS-CAS-2026-0842');
    setAccessCode('7941');
    setError('');
  };

  const handleLogout = () => {
    setAuthenticatedCase(null);
    setSessionToken(null);
    setCaseNumber('');
    setAccessCode('');
    setError('');
    setDownloadNotice('');
  };

  // Descarga Segura y Auténtica del Documento desde el Servidor (Token en Cabecera, CERO exposición en URL)
  const handleDownloadDocument = async (doc) => {
    if (!sessionToken || !authenticatedCase) {
      setError(lang === 'es' ? 'Sesión expirada. Inicie sesión nuevamente.' : 'Session expired. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`/api/portal/documents/${doc.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setError(errData.error || (lang === 'es' ? 'Documento no autorizado o no disponible.' : 'Unauthorized or unavailable document.'));
        return;
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.download = `${doc.name || 'documento'}.txt`;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobUrl);

      setDownloadNotice(lang === 'es' 
        ? `Documento oficial «${doc.name}» descargado con verificación de autenticidad criptográfica.` 
        : `Official document "${doc.name}" downloaded with cryptographic authenticity verification.`
      );
      setTimeout(() => setDownloadNotice(''), 5000);
    } catch (err) {
      setError(lang === 'es' ? 'Error al solicitar el archivo a la bóveda.' : 'Error requesting file from vault.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0B1E3D] border border-blue-700/80 rounded-2xl shadow-2xl text-white my-6 max-h-[92vh] overflow-y-auto">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-blue-900/60 bg-[#081426]/95">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <FileCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center space-x-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>{lang === 'es' ? 'Portal Seguro de Clientes' : 'Secure Client Portal'}</span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                {lang === 'es' ? 'Mi Expediente — Consulta y Seguimiento' : 'My Case File — Track & Follow-Up'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#16386E] rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. VISTA DE INICIO DE SESIÓN */}
        {!authenticatedCase ? (
          <div className="p-6 sm:p-8 space-y-6 text-left">
            <div className="space-y-1.5">
              <h4 className="font-serif text-xl font-bold text-white">
                {lang === 'es' ? 'Acceso Individual a su Expediente' : 'Sign In to Your Case Record'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                {lang === 'es'
                  ? 'Ingrese el número de expediente y código de acceso individual que nuestra oficina le proporcionó al abrir su caso.'
                  : 'Enter the individual case number and access code provided by our office upon case opening.'}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/80 border border-red-500/50 text-red-200 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  {lang === 'es' ? 'Número de Expediente *' : 'Case Number *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. VS-CAS-2026-0842"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#081426] border border-blue-800 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  {lang === 'es' ? 'Código Secreto de Acceso *' : 'Secret Access Code *'}
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#081426] border border-blue-800 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 border border-emerald-500/40 active:scale-95"
                >
                  <span>{loading ? (lang === 'es' ? 'Verificando con Servidor...' : 'Verifying with Server...') : (lang === 'es' ? 'Consultar Mi Expediente' : 'Access My File')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Ayudante de Prueba — CONDICIONADO ESTRICTAMENTE A ENTORNO DEV */}
            {import.meta.env.DEV && (
              <div className="p-3.5 bg-[#081426] border border-amber-400/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-200 text-center sm:text-left">
                  <div className="flex items-center space-x-2">
                    <strong className="text-amber-400">Modo de Pruebas de Desarrollo (DEV)</strong>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                      Exclusivo DEV
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Pre-carga el expediente de auditoría (VS-CAS-2026-0842) para pruebas locales rápidas.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={loadDemo}
                  className="px-3.5 py-1.5 bg-[#0B1E3D] hover:bg-[#16386E] text-amber-300 font-semibold rounded-lg border border-amber-400/40 transition-colors cursor-pointer text-xs flex-shrink-0"
                >
                  Cargar Datos Demo
                </button>
              </div>
            )}
          </div>
        ) : (

          /* 2. VISTA DEL EXPEDIENTE AUTENTICADO */
          <div className="p-6 sm:p-8 space-y-6 text-left animate-in fade-in duration-300">
            
            {/* Tarjeta de Resumen del Caso */}
            <div className="bg-[#081426] border border-blue-800/80 rounded-xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900/60 pb-3">
                <div>
                  <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    {lang === 'es' ? 'Expediente Oficial' : 'Official Record'}
                  </div>
                  <div className="font-mono text-xl font-bold text-white tracking-wide">
                    {authenticatedCase.caseNumber}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{lang === 'es' ? authenticatedCase.status : (authenticatedCase.statusEn || authenticatedCase.status)}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-300 block">{lang === 'es' ? 'Cliente Titular:' : 'Client Name:'}</span>
                  <strong className="text-white font-semibold">{authenticatedCase.clientName}</strong>
                </div>
                <div>
                  <span className="text-slate-300 block">{lang === 'es' ? 'Materia Jurídica:' : 'Matter:'}</span>
                  <strong className="text-white font-semibold">{lang === 'es' ? authenticatedCase.service : (authenticatedCase.serviceEn || authenticatedCase.service)}</strong>
                </div>
                <div>
                  <span className="text-slate-300 block">{lang === 'es' ? 'Cuerpo Jurídico:' : 'Legal Team:'}</span>
                  <strong className="text-white font-semibold">{authenticatedCase.attorneyAssigned}</strong>
                </div>
              </div>

              <div className="p-3 bg-[#0B1E3D] rounded-lg border border-blue-800/60 flex items-center justify-between text-xs">
                <span className="text-amber-400 font-bold">{lang === 'es' ? 'Siguiente Hito Programado:' : 'Next Milestone:'}</span>
                <span className="text-slate-200">{lang === 'es' ? authenticatedCase.nextDeadline : (authenticatedCase.nextDeadlineEn || authenticatedCase.nextDeadline)}</span>
              </div>
            </div>

            {/* Aviso de descarga si aplica */}
            {downloadNotice && (
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{downloadNotice}</span>
              </div>
            )}

            {/* Historial Cronológico de Actividades con Fechas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'es' ? 'Historial de Actividades & Gestiones' : 'Activity & Milestone History'}</span>
                </h4>
                <span className="text-xs text-slate-300">{(authenticatedCase.activities || []).length} eventos registrados</span>
              </div>

              <div className="space-y-3">
                {(authenticatedCase.activities || []).map((act) => (
                  <div key={act.id} className="p-4 bg-[#081426] border border-blue-800/80 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300 text-[11px]">
                      <span className="text-amber-400 font-semibold">{act.date}</span>
                      <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completada</span>
                      </span>
                    </div>
                    <div className="text-white font-bold text-sm">{lang === 'es' ? act.title : (act.titleEn || act.title)}</div>
                    <p className="text-slate-300 leading-relaxed font-light">{lang === 'es' ? act.description : (act.descriptionEn || act.description)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Documentos Autorizados para Compartir */}
            <div className="space-y-3">
              <h4 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'es' ? 'Documentos Oficiales Vinculados al Expediente' : 'Official Case Documents'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {(authenticatedCase.documents || []).map((doc) => (
                  <div key={doc.id} className="p-3.5 bg-[#081426] border border-blue-800/80 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="font-bold text-white truncate">{doc.name}</div>
                      <div className="text-[11px] text-slate-300">{doc.size} • Autorizado el {doc.date}</div>
                      <div className="text-[10px] text-amber-400/90 font-mono truncate">{doc.docketRef}</div>
                    </div>
                    <button
                      onClick={() => handleDownloadDocument(doc)}
                      className="p-2 bg-[#0B1E3D] hover:bg-emerald-600 hover:text-white text-emerald-400 rounded-lg transition-colors cursor-pointer flex-shrink-0 border border-blue-700/60"
                      title="Descargar documento oficial"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de Acción y Salida */}
            <div className="pt-4 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={`tel:${FIRM_CONFIG.primaryPhoneRaw}`}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#081426] hover:bg-[#16386E] border border-blue-700/60 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Llamar a la Oficina: {FIRM_CONFIG.primaryPhone}</span>
              </a>

              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-4 py-2 bg-red-950/60 hover:bg-red-900 text-red-200 rounded-lg text-xs font-semibold border border-red-500/40 transition-colors cursor-pointer"
              >
                {lang === 'es' ? 'Cerrar Sesión del Expediente' : 'Sign Out of Case'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
