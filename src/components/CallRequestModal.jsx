import React, { useState } from 'react';
import { Phone, Clock, CheckCircle2, X, Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { FIRM_CONFIG } from '../data/demoData';
import { analytics } from '../services/analytics';

export default function CallRequestModal({ isOpen, onClose, lang = 'es', initialCaseType = 'general' }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    caseType: initialCaseType,
    callTime: 'inmediato',
    language: lang,
    notes: '',
    smsConsent: true
  });

  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage(lang === 'es' ? 'Por favor ingrese su nombre y número telefónico.' : 'Please enter your name and phone number.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/call-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preferredLanguage: lang,
          submittedAt: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmittedData(result);
        analytics.trackCallRequest(formData.caseType);
      } else {
        setErrorMessage(result.error || (lang === 'es' ? 'Error al procesar su solicitud. Intente nuevamente.' : 'Error processing your request. Please try again.'));
      }
    } catch (err) {
      setErrorMessage(lang === 'es' ? 'No se pudo conectar con el servidor. Por favor llámenos directamente.' : 'Could not connect to server. Please call us directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFormData({
      name: '',
      phone: '',
      caseType: initialCaseType,
      callTime: 'inmediato',
      language: lang,
      notes: '',
      smsConsent: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0B1E3D] border border-blue-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl text-white my-8">
        
        {/* Botón Cerrar */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedData ? (
          <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 px-2.5 py-0.5 rounded bg-[#081426] border border-blue-800">
                {lang === 'es' ? 'Solicitud de Llamada Confirmada' : 'Call Request Confirmed'}
              </span>
              <h3 className="font-serif text-2xl font-bold text-white pt-1">
                {lang === 'es' ? '¡Llamada Registrada en Sistema!' : 'Callback Scheduled!'}
              </h3>
              <p className="text-xs text-slate-300 font-light max-w-sm mx-auto leading-relaxed">
                {lang === 'es'
                  ? `Gracias ${formData.name}. Un asesor legal de guardia se comunicará con usted al ${formData.phone} según su horario seleccionado.`
                  : `Thank you ${formData.name}. An intake specialist will contact you at ${formData.phone} per your chosen preference.`}
              </p>
            </div>

            <div className="bg-[#081426] border border-blue-800/80 rounded-xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-blue-900/60 pb-1.5">
                <span className="text-slate-400">{lang === 'es' ? 'Código de Solicitud:' : 'Request ID:'}</span>
                <span className="font-mono font-bold text-amber-400">{submittedData.callId}</span>
              </div>
              <div className="flex justify-between border-b border-blue-900/60 pb-1.5">
                <span className="text-slate-400">{lang === 'es' ? 'Horario Preferido:' : 'Preferred Time:'}</span>
                <span className="font-semibold text-white">
                  {formData.callTime === 'inmediato' 
                    ? (lang === 'es' ? 'Lo antes posible (< 15 min)' : 'As soon as possible (< 15 min)')
                    : formData.callTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{lang === 'es' ? 'SLA de Atención:' : 'Service SLA:'}</span>
                <span className="font-semibold text-emerald-400">{submittedData.estimatedCallTime}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`tel:${FIRM_CONFIG.primaryPhoneRaw}`}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center space-x-2"
              >
                <Phone className="w-3.5 h-3.5 text-white" />
                <span>{lang === 'es' ? 'Llamar Directo Ahora' : 'Call Direct Now'}</span>
              </a>

              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#081426] hover:bg-[#16386E] text-slate-300 text-xs font-semibold rounded-lg border border-blue-800"
              >
                {lang === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 text-[10px] uppercase font-bold tracking-widest text-amber-400">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'es' ? 'Atención Telefónica Directa' : 'Direct Phone Intake'}</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-white">
                {lang === 'es' ? 'Solicitar una Llamada Inmediata' : 'Request an Immediate Callback'}
              </h3>
              <p className="text-xs text-slate-300 font-light">
                {lang === 'es' 
                  ? 'Facilítenos su número y un miembro de nuestro equipo legal le llamará para evaluar su situación.' 
                  : 'Provide your number and a legal intake coordinator will call you to review your options.'}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950/80 border border-red-500/50 text-red-200 text-xs rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  {lang === 'es' ? 'Nombre Completo *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'es' ? 'Ej. Roberto Navarro' : 'E.g. Robert Smith'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#081426] border border-blue-800 rounded-md text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    {lang === 'es' ? 'Teléfono Móvil *' : 'Mobile Phone *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(314) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#081426] border border-blue-800 rounded-md text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    {lang === 'es' ? '¿Cuándo prefiere que le llamemos?' : 'Best time to call?'}
                  </label>
                  <select
                    value={formData.callTime}
                    onChange={(e) => setFormData({ ...formData, callTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#081426] border border-blue-800 rounded-md text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="inmediato">{lang === 'es' ? 'Inmediatamente (< 15 min)' : 'Immediately (< 15 mins)'}</option>
                    <option value="manana">{lang === 'es' ? 'Por la mañana (9:00 AM - 12:00 PM)' : 'Morning (9:00 AM - 12:00 PM)'}</option>
                    <option value="tarde">{lang === 'es' ? 'Por la tarde (12:00 PM - 5:00 PM)' : 'Afternoon (12:00 PM - 5:00 PM)'}</option>
                    <option value="noche">{lang === 'es' ? 'Al final del día (5:00 PM - 7:00 PM)' : 'Evening (5:00 PM - 7:00 PM)'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  {lang === 'es' ? 'Materia Principal' : 'Primary Matter'}
                </label>
                <select
                  value={formData.caseType}
                  onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
                  className="w-full px-3 py-2 bg-[#081426] border border-blue-800 rounded-md text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="general">{lang === 'es' ? 'Consulta General de Inmigración' : 'General Immigration Inquiry'}</option>
                  <option value="asilo">{lang === 'es' ? 'Asilo Político y Refugio' : 'Political Asylum & Refugee'}</option>
                  <option value="deportacion">{lang === 'es' ? 'Defensa contra la Deportación / Corte EOIR' : 'Deportation Defense / EOIR'}</option>
                  <option value="residencia">{lang === 'es' ? 'Residencia Permanente y Petición Familiar' : 'Green Card & Family Petitions'}</option>
                  <option value="visas_negocios">{lang === 'es' ? 'Visas de Inversión (E-2/EB-5) o Empleo' : 'Investor (E-2/EB-5) & Work Visas'}</option>
                  <option value="humanitario">{lang === 'es' ? 'VAWA / Visa U / Perdón I-601A' : 'VAWA / U-Visa / Hardship Waivers'}</option>
                  <option value="derecho-laboral">{lang === 'es' ? 'Derecho Laboral (despidos, salarios, acoso, compensaciones)' : 'Employment Law (termination, wages, harassment, comp.)'}</option>
                  <option value="fianzas-migratorias">{lang === 'es' ? 'Fianzas Migratorias (I-352) y Recuperación de Fondos (I-391)' : 'Immigration Bonds (I-352) & Bond Recovery (I-391)'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  {lang === 'es' ? 'Notas breves sobre su caso (opcional)' : 'Brief case note (optional)'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'es' ? 'Ej. Tengo fecha de audiencia o visa por vencer' : 'E.g. Hearing date or expiring status'}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#081426] border border-blue-800 rounded-md text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="callSmsConsent"
                  checked={formData.smsConsent}
                  onChange={(e) => setFormData({ ...formData, smsConsent: e.target.checked })}
                  className="mt-0.5 rounded border-blue-800 text-emerald-500 focus:ring-emerald-500 bg-[#081426]"
                />
                <label htmlFor="callSmsConsent" className="text-[10px] text-slate-300 leading-snug">
                  {lang === 'es'
                    ? 'Consiento recibir la llamada telefónica y SMS de confirmación confidencial del bufete.'
                    : 'I consent to receive a callback and confidential SMS confirmation from the law firm.'}
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-blue-900/60">
              <div className="flex items-center space-x-1 text-[11px] text-slate-300">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'es' ? 'Privilegio Abogado-Cliente' : 'Attorney-Client Privilege'}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-2 bg-[#081426] text-slate-300 text-xs font-medium rounded-lg hover:bg-[#16386E] cursor-pointer border border-blue-800"
                >
                  {lang === 'es' ? 'Cancelar' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? (lang === 'es' ? 'Enviando...' : 'Sending...') : (lang === 'es' ? 'Solicitar Llamada' : 'Request Call')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
