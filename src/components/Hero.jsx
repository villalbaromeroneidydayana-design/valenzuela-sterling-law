import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, Phone, CheckCircle2, Play, Lock, 
  Send, ArrowRight, ArrowUpRight, Sparkles, AlertCircle,
  Video, FileText, MessageCircle, Volume2, VolumeX, Shield, Scale
} from 'lucide-react';
import { FIRM_CONFIG } from '../data/demoData';
import { analytics } from '../services/analytics';

export default function Hero({ lang = 'es', onOpenVideo, onOpenEvaluator }) {
  // Selector Dual: 'advisor' (Hablar con un Asesor) | 'form' (Dejar mis Datos)
  const [contactTab, setContactTab] = useState('advisor');
  const [isAdvisorVideoMuted, setIsAdvisorVideoMuted] = useState(true);
  const advisorVideoRef = useRef(null);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [leadResult, setLeadResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    caseType: 'asilo',
    smsConsent: true
  });

  useEffect(() => {
    if (contactTab === 'advisor' && advisorVideoRef.current) {
      advisorVideoRef.current.muted = isAdvisorVideoMuted;
      advisorVideoRef.current.play().catch(() => {});
    }
  }, [contactTab]);

  const toggleAdvisorMute = () => {
    if (advisorVideoRef.current) {
      const nextMuted = !advisorVideoRef.current.muted;
      advisorVideoRef.current.muted = nextMuted;
      setIsAdvisorVideoMuted(nextMuted);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage(lang === 'es' ? 'Por favor ingrese su nombre y teléfono.' : 'Please enter your name and phone number.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          caseType: formData.caseType,
          preferredLanguage: lang,
          source: 'hero_form',
          smsConsent: formData.smsConsent,
          submittedAt: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLeadResult(data);
        setFormSubmitted(true);
        analytics.trackFormSubmission('hero_quick_form', formData.caseType);
      } else {
        setErrorMessage(data.error || (lang === 'es' ? 'Error al procesar su solicitud. Intente de nuevo.' : 'Error processing your request. Please try again.'));
      }
    } catch (err) {
      setErrorMessage(lang === 'es' ? 'Error de conexión con el servidor. Llámenos directamente.' : 'Connection error. Please call us directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormSubmitted(false);
    setLeadResult(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      caseType: 'asilo',
      smsConsent: true
    });
  };

  return (
    <section id="hero" className="relative flex items-center bg-gradient-to-b from-[#0B1E3D] via-[#0E254B] to-[#081426] overflow-hidden py-8 sm:py-10 lg:py-14 border-b border-blue-900/60">
      
      {/* 1. FOTOGRAFÍA PROTAGONISTA DE GRAN FORMATO: ARQUITECTURA CORPORATIVA Y SALA DE LITIGIO */}
      <div 
        className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 scale-105 transition-transform duration-1000"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')" 
        }}
      />
      {/* Gradientes en Azul Noche Corporativo Profundo */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#081426]/95 via-[#0B1E3D]/90 to-[#081426]/95" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* COLUMNA IZQUIERDA: MENSAJE CORPORATIVO IMPACTANTE */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
            
            {/* Badge de Autoridad Federal en Dorado y Verde */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1E3D]/90 border border-amber-400/50 text-amber-300 text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{lang === 'es' ? 'Práctica y Litigio en Derecho Federal de Inmigración' : 'Federal Immigration Law & Advocacy Practice'}</span>
            </div>

            {/* Titular Elegante, Espacioso y con Respiración Tipográfica */}
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-[3.15rem] font-bold text-white tracking-normal leading-[1.3] sm:leading-[1.25] lg:leading-[1.22] mb-3 sm:mb-5">
              {lang === 'es' ? (
                <>
                  Defensa Jurídica de Alto Nivel{' '}
                  <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic font-serif">
                    en Inmigración de EE.&nbsp;UU.
                  </span>
                </>
              ) : (
                <>
                  Strategic High-Stakes Advocacy{' '}
                  <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic font-serif">
                    in U.S. Immigration Law
                  </span>
                </>
              )}
            </h1>

            {/* Bajada Breve, Legible y Enfocada */}
            <p className="text-sm sm:text-base text-slate-200 max-w-xl leading-relaxed font-light mb-4 sm:mb-6">
              {lang === 'es' 
                ? 'Representación jurídica rigurosa para familias, inversionistas y empresas. Casos complejos ante USCIS, Cortes de Inmigración (EOIR) y Tribunales Federales de Apelación.'
                : 'Zealous legal advocacy for families, investors, and corporations. Handling high-complexity matters before USCIS, EOIR courts, and Federal Courts of Appeals.'
              }
            </p>

            {/* Dos Llamadas a la Acción Bien Diferenciadas y Cómodas en Móvil */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 pb-1">
              <button
                onClick={onOpenEvaluator}
                className="w-full sm:w-auto px-5 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-xl shadow-amber-500/25 transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 border border-amber-300/60 active:scale-95"
              >
                <span>{lang === 'es' ? 'Evaluación de Caso Confidencial' : 'Confidential Case Review'}</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button
                onClick={onOpenVideo}
                className="w-full sm:w-auto px-4 py-3 sm:px-5 sm:py-3.5 bg-[#0F274E] hover:bg-[#16386E] text-white font-semibold text-xs sm:text-sm rounded-lg border border-blue-700/60 backdrop-blur-md transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 group"
              >
                <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-3 h-3 text-amber-400 fill-current ml-0.5" />
                </div>
                <span>{lang === 'es' ? 'Ver Instalaciones (Video 4K)' : 'Watch Firm Video'}</span>
              </button>
            </div>

            {/* Cinta de Métricas Clave */}
            <div className="pt-4 mt-2 border-t border-blue-900/60 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FIRM_CONFIG.stats.map((stat, idx) => (
                <div key={idx} className={`border-l-2 ${idx % 2 === 0 ? 'border-amber-400' : 'border-emerald-400'} pl-2.5`}>
                  <div className={`font-serif text-lg sm:text-xl font-bold ${idx % 2 === 0 ? 'text-amber-400' : 'text-emerald-400'} tracking-tight`}>{stat.value}</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-300 leading-tight">{lang === 'es' ? stat.labelEs : stat.labelEn}</div>
                </div>
              ))}
            </div>

          </div>

          {/* COLUMNA DERECHA: SELECTOR DUAL «ELIGE CÓMO COMUNICARTE» */}
          <div className="lg:col-span-5">
            <div className="bg-[#0F274E]/95 backdrop-blur-xl border border-blue-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl relative text-left">
              
              {/* SELECTOR SEGMENTADO PRINCIPAL: 2 CAMINOS CLAROS */}
              <div className="grid grid-cols-2 p-1 bg-[#081426] rounded-xl border border-blue-900/80 mb-3.5 gap-1">
                <button
                  type="button"
                  onClick={() => setContactTab('advisor')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    contactTab === 'advisor'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{lang === 'es' ? 'Hablar con Asesor' : 'Talk to Advisor'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContactTab('form')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    contactTab === 'form'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{lang === 'es' ? 'Dejar mis Datos' : 'Leave Details'}</span>
                </button>
              </div>

              {/* ============================================================== */}
              {/* PESTAÑA 1: HABLAR CON UN ASESOR (VIDEO 9:16 + LLAMAR + WHATSAPP) */}
              {/* ============================================================== */}
              {contactTab === 'advisor' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-800/60">
                    <div>
                      <h3 className="font-serif text-sm sm:text-base font-bold text-white flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>{lang === 'es' ? 'Orientación Inmediata con un Asesor' : 'Direct Advisor Guidance'}</span>
                      </h3>
                      <p className="text-[11px] text-slate-300">
                        {lang === 'es'
                          ? 'Comuníquese directamente sin necesidad de llenar formularios.'
                          : 'Connect immediately without filling forms.'}
                      </p>
                    </div>
                    <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>En línea</span>
                    </span>
                  </div>

                  {/* REPRODUCTOR VERTICAL 9:16 COMPACTO Y ELEGANTE */}
                  <div className="relative mx-auto aspect-[9/16] max-h-[255px] sm:max-h-[270px] rounded-xl overflow-hidden border border-amber-400/40 shadow-xl bg-black group">
                    <video
                      ref={advisorVideoRef}
                      autoPlay
                      muted={isAdvisorVideoMuted}
                      loop
                      playsInline
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={toggleAdvisorMute}
                    >
                      <source src="/video%20precentacion.mp4" type="video/mp4" />
                      <source src="/video precentacion.mp4" type="video/mp4" />
                    </video>

                    {/* Gradiente cinematográfico */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

                    {/* Badge Superior */}
                    <div className="absolute top-2 left-2 pointer-events-none">
                      <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-semibold border border-amber-400/30">
                        {lang === 'es' ? 'Presentación Oficial' : 'Official Presentation'}
                      </span>
                    </div>

                    {/* Botón Silencio / Audio con texto descriptivo */}
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        type="button"
                        onClick={toggleAdvisorMute}
                        className={`px-2 py-1 rounded-lg backdrop-blur-md text-[10px] font-semibold border transition-all cursor-pointer flex items-center space-x-1 shadow-md active:scale-95 ${
                          isAdvisorVideoMuted
                            ? 'bg-black/80 hover:bg-black/95 text-amber-300 border-amber-400/50'
                            : 'bg-emerald-950/90 text-emerald-300 border-emerald-400/60'
                        }`}
                        title={isAdvisorVideoMuted ? (lang === 'es' ? 'Activar sonido' : 'Unmute audio') : (lang === 'es' ? 'Silenciar' : 'Mute')}
                        aria-label={isAdvisorVideoMuted ? 'Activar sonido' : 'Silenciar'}
                      >
                        {isAdvisorVideoMuted ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                            <span>{lang === 'es' ? 'Activar audio' : 'Unmute'}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            <span>{lang === 'es' ? 'Con audio' : 'Sound on'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Resumen del Mensaje en el Pie del Video */}
                    <div className="absolute bottom-2 inset-x-2 text-center pointer-events-none">
                      <span className="inline-block px-2 py-1 rounded bg-black/80 text-white text-[10px] font-medium border border-white/10 leading-tight">
                        {lang === 'es' ? '«Queremos escucharte y orientar tus opciones»' : '“We are here to listen and guide your case”'}
                      </span>
                    </div>
                  </div>

                  {/* 3 ÁREAS PRINCIPALES (PASTILLAS RESUMEN) */}
                  <div className="grid grid-cols-3 gap-1.5 text-center pt-0.5">
                    <div className="p-1.5 bg-[#081426] rounded-lg border border-blue-900/60">
                      <span className="block text-amber-400 font-bold text-[10px] sm:text-[11px]">🏛️ Inmigración</span>
                      <span className="text-[9px] text-slate-300">Asilo & Visas</span>
                    </div>
                    <div className="p-1.5 bg-[#081426] rounded-lg border border-blue-900/60">
                      <span className="block text-amber-400 font-bold text-[10px] sm:text-[11px]">⚖️ Laboral</span>
                      <span className="text-[9px] text-slate-300">Abuso & Salarios</span>
                    </div>
                    <div className="p-1.5 bg-[#081426] rounded-lg border border-blue-900/60">
                      <span className="block text-amber-400 font-bold text-[10px] sm:text-[11px]">🛡️ Fianzas</span>
                      <span className="text-[9px] text-slate-300">ICE & Detención</span>
                    </div>
                  </div>

                  {/* DOS BOTONES CLAROS DE CONTACTO DIRECTO */}
                  <div className="space-y-2 pt-1">
                    <a
                      href={`tel:${FIRM_CONFIG.primaryPhoneRaw}`}
                      onClick={() => analytics.trackPhoneClick('hero_advisor_call')}
                      className="w-full py-2.5 px-3 bg-[#0B2545] hover:bg-[#133A6B] text-white rounded-xl font-bold text-xs sm:text-sm border border-amber-400/50 flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-95"
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>{lang === 'es' ? `Llamar al Bufete: ${FIRM_CONFIG.primaryPhone}` : `Call Firm: ${FIRM_CONFIG.primaryPhone}`}</span>
                    </a>

                    <a
                      href={FIRM_CONFIG.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => analytics.trackWhatsAppClick('hero_advisor_whatsapp')}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{lang === 'es' ? 'Contactar por WhatsApp' : 'Chat via WhatsApp'}</span>
                    </a>
                  </div>

                  {/* Alternativa para pasar a la Pestaña 2 */}
                  <div className="text-center pt-1 border-t border-blue-900/50">
                    <button
                      type="button"
                      onClick={() => setContactTab('form')}
                      className="text-[11px] text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      {lang === 'es'
                        ? '¿Prefieres que nosotros te contactemos? Llena el formulario aquí →'
                        : 'Prefer us to call you? Fill the form here →'}
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* PESTAÑA 2: DEJAR MIS DATOS (FORMULARIO CONFIDENCIAL ACTUAL)     */}
              {/* ============================================================== */}
              {contactTab === 'form' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-800/60">
                    <div>
                      <h3 className="font-serif text-sm sm:text-base font-bold text-white">
                        {lang === 'es' ? 'Consulta Confidencial Inmediata' : 'Confidential Initial Inquiry'}
                      </h3>
                      <p className="text-[11px] text-amber-400 font-medium">
                        {lang === 'es' ? 'Respuesta prioritaria en menos de 2 horas' : 'Priority review under 2 hours'}
                      </p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#081426] border border-amber-400/40 flex items-center justify-center text-amber-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {formSubmitted ? (
                    <div className="py-4 text-center space-y-3 animate-in fade-in duration-300">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif text-sm sm:text-base font-bold text-white">
                          {lang === 'es' ? '¡Consulta Recibida con Éxito!' : 'Inquiry Submitted Successfully!'}
                        </h4>
                        <p className="text-[11px] text-slate-200">
                          {lang === 'es' 
                            ? `Gracias ${formData.name}. Su solicitud ha quedado registrada en nuestro sistema legal.`
                            : `Thank you ${formData.name}. Your inquiry is recorded in our legal system.`}
                        </p>
                      </div>

                      {leadResult && (
                        <div className="bg-[#081426]/90 border border-blue-700/60 rounded-xl p-3 text-xs text-left space-y-1 text-slate-200">
                          <div className="flex justify-between border-b border-blue-900/60 pb-1">
                            <span className="text-slate-400">{lang === 'es' ? 'Folio de Consulta:' : 'Inquiry ID:'}</span>
                            <span className="font-mono font-bold text-amber-400">{leadResult.leadId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">{lang === 'es' ? 'SLA de Respuesta:' : 'Response SLA:'}</span>
                            <span className="font-semibold text-emerald-400">{leadResult.estimatedResponseTime}</span>
                          </div>
                        </div>
                      )}

                      <div className="pt-1 flex flex-col gap-2">
                        <a
                          href={`tel:${FIRM_CONFIG.primaryPhoneRaw}`}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center space-x-1.5 shadow-md transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{lang === 'es' ? `Llamar al ${FIRM_CONFIG.primaryPhone}` : `Call ${FIRM_CONFIG.primaryPhone}`}</span>
                        </a>
                        <button
                          onClick={handleReset}
                          className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {lang === 'es' ? 'Enviar otra consulta' : 'Submit another query'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-2.5">
                      {errorMessage && (
                        <div className="p-2 bg-red-900/60 border border-red-500/40 text-red-200 text-xs rounded-lg flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-200 mb-0.5">
                          {lang === 'es' ? 'Nombre Completo *' : 'Full Name *'}
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder={lang === 'es' ? 'Ej. Mario González' : 'E.g. Alexander Smith'}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-1.5 bg-[#081426] border border-blue-800/80 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-200 mb-0.5">
                          {lang === 'es' ? 'Teléfono Móvil *' : 'Mobile Phone *'}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          placeholder="(314) 000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3 py-1.5 bg-[#081426] border border-blue-800/80 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-200 mb-0.5">
                          {lang === 'es' ? 'Área de Interés' : 'Immigration Matter'}
                        </label>
                        <select
                          value={formData.caseType}
                          onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
                          className="w-full px-3 py-1.5 bg-[#081426] border border-blue-800/80 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="asilo">{lang === 'es' ? 'Asilo Político / Refugio' : 'Political Asylum'}</option>
                          <option value="deportacion">{lang === 'es' ? 'Defensa contra Deportación / Corte EOIR' : 'Deportation Defense / EOIR'}</option>
                          <option value="familiar">{lang === 'es' ? 'Residencia / Petición Familiar I-130' : 'Family Petition / Green Card'}</option>
                          <option value="inversion">{lang === 'es' ? 'Visas de Inversión (E-2 y EB-5)' : 'Investor Visas (E-2 & EB-5)'}</option>
                          <option value="empleo">{lang === 'es' ? 'Visas de Talento O-1 / EB-2 NIW' : 'Talent & Employment Visas'}</option>
                          <option value="humanitario">{lang === 'es' ? 'Protección VAWA / Visas U y T' : 'VAWA / U-Visa Relief'}</option>
                        </select>
                      </div>

                      <div className="flex items-start space-x-2 pt-0.5">
                        <input
                          type="checkbox"
                          id="heroSmsConsent"
                          checked={formData.smsConsent}
                          onChange={(e) => setFormData({ ...formData, smsConsent: e.target.checked })}
                          className="mt-0.5 rounded border-blue-700 text-emerald-500 focus:ring-emerald-500 bg-[#081426]"
                        />
                        <label htmlFor="heroSmsConsent" className="text-[10px] text-slate-300 leading-snug">
                          {lang === 'es' 
                            ? 'Acepto recibir confirmaciones y llamadas confidenciales sobre mi consulta.' 
                            : 'I consent to receive case updates via confidential SMS/call.'}
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-emerald-900/30 transition-all cursor-pointer flex items-center justify-center space-x-2 mt-1 disabled:opacity-50 active:scale-98"
                      >
                        <span>{loading ? (lang === 'es' ? 'Registrando...' : 'Submitting...') : (lang === 'es' ? 'Solicitar Asesoría' : 'Submit Consultation')}</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )}

                  {/* Alternativa para pasar a la Pestaña 1 */}
                  <div className="text-center pt-1 border-t border-blue-900/50">
                    <button
                      type="button"
                      onClick={() => setContactTab('advisor')}
                      className="text-[11px] text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      {lang === 'es'
                        ? '¿Prefieres no llenar formularios? Hablar directamente con un asesor →'
                        : 'Prefer not to fill forms? Talk directly to an advisor →'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
