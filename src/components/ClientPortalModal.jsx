import React, { useState, useRef } from 'react';
import { 
  FileCheck, Shield, Lock, X, CheckCircle2, Clock, 
  Calendar, FileText, Download, Phone, AlertCircle, ArrowRight, User, KeyRound,
  PenTool, RotateCcw, RefreshCw, CheckSquare, Square
} from 'lucide-react';
import { FIRM_CONFIG } from '../data/demoData';

export default function ClientPortalModal({ isOpen, onClose, lang = 'es' }) {
  const [caseNumber, setCaseNumber] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [clientConfirm, setClientConfirm] = useState('');
  const [error, setError] = useState('');
  const [authenticatedCase, setAuthenticatedCase] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState('');

  // Estados para Firma Digital Manuscrita
  const [signingDoc, setSigningDoc] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signAgreement, setSignAgreement] = useState(false);
  const [signingLoading, setSigningLoading] = useState(false);
  const [signNotice, setSignNotice] = useState('');
  const canvasRef = useRef(null);

  // Autenticación Real del Lado del Servidor con Triple Factor
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
          accessCode: accessCode.trim(),
          clientConfirm: clientConfirm.trim()
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

  // Ayudantes de prueba exclusivos para entorno de desarrollo local (DEV)
  const loadDemo = (sample = 'real') => {
    if (sample === 'test1') {
      setCaseNumber('VS-TEST-2026-9001');
      setAccessCode('PRUEBA-9001');
      setClientConfirm('Méndez');
    } else if (sample === 'test2') {
      setCaseNumber('VS-TEST-2026-9002');
      setAccessCode('PRUEBA-9002');
      setClientConfirm('Ramos');
    } else {
      setCaseNumber('VS-CAS-2026-0842');
      setAccessCode('7941');
      setClientConfirm('Morales');
    }
    setError('');
  };

  const handleLogout = () => {
    setAuthenticatedCase(null);
    setSessionToken(null);
    setCaseNumber('');
    setAccessCode('');
    setClientConfirm('');
    setError('');
    setDownloadNotice('');
  };

  // Descarga Segura del Documento desde el Servidor
  const handleDownloadDocument = async (doc) => {
    if (!sessionToken || !authenticatedCase) {
      setError(lang === 'es' ? 'Sesión expirada. Inicie sesión nuevamente.' : 'Session expired. Please log in again.');
      return;
    }

    try {
      const response = await fetch('/api/portal/document/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          caseNumber: authenticatedCase.caseNumber,
          docId: doc.id
        })
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
      tempLink.download = `${doc.name || 'documento'}`;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobUrl);

      setDownloadNotice(lang === 'es' 
        ? `Documento oficial «${doc.name}» descargado con verificación criptográfica SHA-256.` 
        : `Official document "${doc.name}" downloaded with SHA-256 verification.`
      );
      setTimeout(() => setDownloadNotice(''), 5000);
    } catch (err) {
      setError(lang === 'es' ? 'Error al solicitar el archivo a la bóveda.' : 'Error requesting file from vault.');
    }
  };

  // Funciones de Dibujo en Canvas (Mouse y Táctil Móvil)
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (e.cancelable) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0B1E3D';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (e && e.cancelable) e.preventDefault();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleOpenSignatureModal = (doc) => {
    setSigningDoc(doc);
    setHasDrawn(false);
    setSignAgreement(false);
    setError('');
    setTimeout(() => {
      clearCanvas();
    }, 100);
  };

  const handleConfirmSignature = async () => {
    if (!hasDrawn) {
      setError(lang === 'es' ? 'Por favor estampe su firma en el recuadro blanco.' : 'Please sign in the box provided.');
      return;
    }
    if (!signAgreement) {
      setError(lang === 'es' ? 'Debe aceptar la declaración de conformidad antes de guardar.' : 'Please agree to the confirmation before saving.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const signaturePngBase64 = canvas.toDataURL('image/png');
    setSigningLoading(true);
    setError('');

    try {
      const response = await fetch('/api/portal/document/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          caseNumber: authenticatedCase.caseNumber,
          docId: signingDoc.id,
          signaturePngBase64
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar la firma.');
      }

      setSignNotice(lang === 'es'
        ? `Documento «${signingDoc.name}» firmado exitosamente. La copia oficial se resguardó en su expediente.`
        : `Document "${signingDoc.name}" signed successfully. Official copy saved in your case file.`
      );
      setTimeout(() => setSignNotice(''), 7000);
      setSigningDoc(null);
      clearCanvas();

      // Recargar el expediente actualizado
      const caseRes = await fetch(`/api/portal/case?caseNumber=${encodeURIComponent(authenticatedCase.caseNumber)}`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      if (caseRes.ok) {
        const caseJson = await caseRes.json();
        if (caseJson.caseRecord) {
          setAuthenticatedCase(caseJson.caseRecord);
        }
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la firma.');
    } finally {
      setSigningLoading(false);
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
                  ? 'Ingrese su número de expediente, su clave de acceso y el factor de confirmación que nuestra oficina le entregó al formalizar su representación.'
                  : 'Enter your case number, access code and confirmation factor provided upon opening your file.'}
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-950/80 border border-red-500/50 text-red-200 text-xs rounded-xl flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  {lang === 'es' ? '1. Número de Expediente *' : '1. Case Number *'}
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
                  {lang === 'es' ? '2. Clave Criptográfica de Acceso *' : '2. Secure Access Code *'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Ej. VS-8492-KP o código asignado"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#081426] border border-blue-800 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  {lang === 'es' ? '3. Factor de Confirmación del Titular (Opcional)' : '3. Holder Confirmation Factor (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'es' ? 'Primer apellido o últimos 4 dígitos del teléfono' : 'Last name or last 4 digits of phone'}
                  value={clientConfirm}
                  onChange={(e) => setClientConfirm(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#081426] border border-blue-800 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {lang === 'es' 
                    ? 'Verificación complementaria para confirmar la titularidad exclusiva del caso.' 
                    : 'Supplemental verification to confirm case holder.'}
                </span>
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
              <div className="p-3.5 bg-[#081426] border border-amber-400/30 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-amber-400">Herramientas de Auditoría Técnica (DEV)</strong>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                    Solo Desarrollo
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Cargue datos ficticios para validar el aislamiento y la respuesta del servidor:
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => loadDemo('real')}
                    className="px-2.5 py-1 bg-blue-900/60 hover:bg-blue-800 text-slate-200 rounded text-[11px] border border-blue-700/60"
                  >
                    Caso Demo (Morales)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadDemo('test1')}
                    className="px-2.5 py-1 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 rounded text-[11px] border border-amber-500/40"
                  >
                    Caso Test A (Méndez)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadDemo('test2')}
                    className="px-2.5 py-1 bg-teal-950/40 hover:bg-teal-900/60 text-teal-300 rounded text-[11px] border border-teal-500/40"
                  >
                    Caso Test B (Ramos)
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-blue-900/60 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'es' ? 'Cifrado SSL 256-bit y Protección Anti-Brute-Force' : '256-bit SSL & Anti-Brute-Force'}</span>
              </div>
              <a
                href={`tel:${FIRM_CONFIG.primaryPhoneRaw}`}
                className="text-amber-400 hover:text-amber-300 transition-colors flex items-center space-x-1"
              >
                <Phone className="w-3 h-3" />
                <span>{lang === 'es' ? 'Soporte de Bóveda' : 'Vault Support'}</span>
              </a>
            </div>
          </div>
        ) : (
          /* 2. VISTA DE CONSULTA AUTORIZADA */
          <div className="p-6 sm:p-8 space-y-6 text-left">
            
            {/* Notificación de descarga exitosa */}
            {downloadNotice && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs rounded-xl flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{downloadNotice}</span>
              </div>
            )}

            {/* Cabecera del Expediente */}
            <div className="bg-[#081426] border border-blue-900/80 rounded-xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-blue-900/60 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                    {lang === 'es' ? 'Expediente Verificado' : 'Verified Case File'}
                  </span>
                  <h4 className="font-serif text-xl font-bold text-white">
                    {authenticatedCase.clientName}
                  </h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs bg-blue-900/80 text-amber-300 px-3 py-1 rounded-md border border-amber-400/40 font-bold">
                    {authenticatedCase.caseNumber}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-[#0F274E] hover:bg-[#16386E] transition-colors cursor-pointer"
                  >
                    {lang === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block">{lang === 'es' ? 'Materia Jurídica:' : 'Practice Area:'}</span>
                  <span className="font-semibold text-white">{authenticatedCase.service}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{lang === 'es' ? 'Abogado Asignado:' : 'Assigned Attorney:'}</span>
                  <span className="font-semibold text-white">{authenticatedCase.attorneyAssigned}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{lang === 'es' ? 'Fecha de Apertura:' : 'Filing Date:'}</span>
                  <span className="font-semibold text-white">{authenticatedCase.filingDate}</span>
                </div>
              </div>

              {/* Estado Procesal Actual */}
              <div className="bg-[#0B1E3D] border border-blue-800/80 rounded-lg p-3.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'es' ? 'Estado Procesal Actual' : 'Current Procedural Status'}
                  </span>
                  <div className="text-sm font-bold text-emerald-400 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{authenticatedCase.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">{lang === 'es' ? 'Próximo Paso / Plazo:' : 'Next Step / Deadline:'}</span>
                  <span className="text-xs font-semibold text-amber-300">{authenticatedCase.nextDeadline}</span>
                </div>
              </div>
            </div>

            {/* Línea de Tiempo de Actividades */}
            <div className="space-y-3">
              <h5 className="font-serif text-base font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{lang === 'es' ? 'Historial de Novedades y Gestiones' : 'Case Updates & Activities'}</span>
              </h5>

              <div className="space-y-2.5">
                {(authenticatedCase.activities || []).map((act, index) => (
                  <div key={act.id || index} className="p-3.5 bg-[#081426] border border-blue-900/60 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-100">{act.title}</span>
                      <span className="text-slate-400 text-[11px]">{act.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-light">
                      {act.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notificación de firma exitosa */}
            {signNotice && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs rounded-xl flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{signNotice}</span>
              </div>
            )}

            {/* Aviso de Documentos Pendientes de Firma */}
            {((authenticatedCase.documents || []).filter(d => d.requiresSignature && d.signatureStatus !== 'signed')).length > 0 && (
              <div className="p-4 bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-yellow-950/80 border-2 border-amber-500/80 rounded-xl space-y-1.5 shadow-lg shadow-amber-950/40">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <PenTool className="w-4 h-4 text-amber-400" />
                  <span>Documento(s) Pendiente(s) de Firma</span>
                </div>
                <p className="text-xs text-amber-100">
                  {lang === 'es'
                    ? `Tiene ${(authenticatedCase.documents || []).filter(d => d.requiresSignature && d.signatureStatus !== 'signed').length} documento oficial que requiere su firma manuscrita digitalizada para continuar con el trámite.`
                    : `You have ${(authenticatedCase.documents || []).filter(d => d.requiresSignature && d.signatureStatus !== 'signed').length} document(s) requiring your handwritten digital signature to proceed.`}
                </p>
              </div>
            )}

            {/* Bóveda de Documentos Autorizados */}
            <div className="space-y-3">
              <h5 className="font-serif text-base font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{lang === 'es' ? 'Documentos Oficiales Vinculados' : 'Authorized Official Documents'}</span>
              </h5>

              <div className="space-y-2">
                {(authenticatedCase.documents || []).length === 0 ? (
                  <div className="p-4 bg-[#081426] border border-blue-900/60 rounded-xl text-center text-xs text-slate-400">
                    {lang === 'es' ? 'No hay documentos pendientes de descarga en este momento.' : 'No documents available for download at this time.'}
                  </div>
                ) : (
                  (authenticatedCase.documents || []).map((doc) => (
                    <div key={doc.id} className="p-3.5 bg-[#081426] border border-blue-900/60 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="text-xs font-bold text-white flex flex-wrap items-center gap-1.5">
                          <span className="truncate max-w-xs">{doc.name}</span>
                          <span className="text-[10px] text-slate-400 bg-blue-950 px-1.5 py-0.2 rounded border border-blue-900">
                            {doc.size}
                          </span>
                          {doc.requiresSignature && doc.signatureStatus !== 'signed' && (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-full font-bold flex items-center space-x-1 animate-pulse">
                              <PenTool className="w-2.5 h-2.5" />
                              <span>{lang === 'es' ? 'Requiere Firma' : 'Signature Required'}</span>
                            </span>
                          )}
                          {doc.signatureStatus === 'signed' && (
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/50 rounded-full font-bold flex items-center space-x-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>{lang === 'es' ? 'Firmado' : 'Signed'}</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {doc.type} • {doc.date}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {doc.requiresSignature && doc.signatureStatus !== 'signed' && (
                          <button
                            onClick={() => handleOpenSignatureModal(doc)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            <span>{lang === 'es' ? 'Firmar Documento' : 'Sign Document'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{lang === 'es' ? 'Descargar' : 'Download'}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Aviso Ético Obligatorio en el Portal */}
            <div className="p-3 bg-[#081426]/70 border border-blue-900/60 rounded-lg text-[11px] text-slate-300 leading-relaxed">
              <Shield className="w-3.5 h-3.5 text-amber-400 inline mr-1 -mt-0.5" />
              {lang === 'es'
                ? 'Aviso Oficial: La información procesal expuesta en este portal refleja las gestiones registradas por la firma ante agencias federales (USCIS, EOIR, ICE). Toda resolución de fondo depende exclusivamente de la autoridad gubernamental competente.'
                : 'Official Notice: The case status shown reflects docket management by the firm with federal agencies. Final case determinations depend exclusively on competent government authorities.'}
            </div>

          </div>
        )}

        {/* MODAL DE FIRMA DIGITAL MANUSCRITA */}
        {signingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-[#0B1E3D] border border-amber-500/80 rounded-2xl shadow-2xl text-white p-5 sm:p-6 space-y-4 max-h-[95vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-blue-900/80 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-white">
                      {lang === 'es' ? 'Firma Manuscrita Digital' : 'Handwritten Digital Signature'}
                    </h4>
                    <span className="text-[10px] text-amber-400 block truncate max-w-xs">{signingDoc.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setSigningDoc(null); clearCanvas(); }}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instrucción clara */}
              <div className="p-3 bg-blue-950/80 border border-blue-800/80 rounded-xl text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white">
                  {lang === 'es' ? 'Instrucciones para Firmar:' : 'Signing Instructions:'}
                </p>
                <p className="text-[11px] leading-relaxed">
                  {lang === 'es'
                    ? '1. Revise el documento antes de firmar. 2. Dibuje su trazo en el recuadro blanco utilizando el dedo en la pantalla del celular o el mouse en computadora. 3. Puede borrar y repetir la firma si no le gusta.'
                    : '1. Review document before signing. 2. Draw your signature in the white box using finger or mouse. 3. Clear and retry if needed.'}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleDownloadDocument(signingDoc)}
                    className="text-amber-400 hover:underline flex items-center space-x-1 text-[11px] font-semibold"
                  >
                    <Download className="w-3 h-3" />
                    <span>{lang === 'es' ? 'Descargar / Leer Documento a Firmar' : 'Download / Read Document to Sign'}</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-red-950 border border-red-500/60 rounded-lg text-red-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* LIENZO DE FIRMA (HTML5 CANVAS) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center space-x-1">
                    <PenTool className="w-3 h-3 text-amber-400" />
                    <span>{lang === 'es' ? 'Recuadro de Firma Manuscrita:' : 'Signature Box:'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center space-x-1 cursor-pointer font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{lang === 'es' ? 'Borrar y Repetir' : 'Clear & Retry'}</span>
                  </button>
                </div>

                <div className="relative border-2 border-dashed border-amber-400/60 rounded-xl overflow-hidden bg-white shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={460}
                    height={160}
                    className="w-full h-40 touch-none cursor-crosshair block"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {!hasDrawn && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic select-none">
                      {lang === 'es' ? '✍️ Dibuje su firma aquí con el dedo o mouse' : '✍️ Draw your signature here with finger or mouse'}
                    </div>
                  )}
                  {/* Línea guía de base */}
                  <div className="absolute bottom-6 left-6 right-6 border-b border-slate-300 pointer-events-none flex justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>X</span>
                    <span>{authenticatedCase.clientName}</span>
                  </div>
                </div>
              </div>

              {/* Declaración de conformidad */}
              <label className="flex items-start space-x-2.5 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={signAgreement}
                  onChange={(e) => setSignAgreement(e.target.checked)}
                  className="mt-0.5 rounded border-blue-700 bg-blue-950 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span className="leading-snug text-[11px]">
                  {lang === 'es'
                    ? `Yo, ${authenticatedCase.clientName}, certifico que he leído y apruebo este documento, y autorizo a Valenzuela & Sterling a incorporar mi firma a mi expediente.`
                    : `I, ${authenticatedCase.clientName}, certify that I have read and approved this document for filing in my legal record.`}
                </span>
              </label>

              {/* Acciones */}
              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-blue-900/60">
                <button
                  type="button"
                  onClick={() => { setSigningDoc(null); clearCanvas(); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  {lang === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSignature}
                  disabled={signingLoading || !hasDrawn || !signAgreement}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 cursor-pointer"
                >
                  {signingLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === 'es' ? 'Incorporando Firma al PDF...' : 'Stamping Signature...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{lang === 'es' ? 'Confirmar y Guardar Firma' : 'Confirm & Save Signature'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
