import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, 
  Sparkles, Lock, AlertCircle, FileCheck, Phone, Send, Clock, Video, UserCheck
} from 'lucide-react';
import { FIRM_CONFIG, PRACTICE_AREAS } from '../data/demoData';
import { analytics } from '../services/analytics';

export default function EligibilityEvaluator({ lang = 'es', isOpen = false, onClose, initialPracticeId = 'residencia-green-card' }) {
  const [step, setStep] = useState(1);
  const [selectedPracticeId, setSelectedPracticeId] = useState(initialPracticeId);
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Sincronizar si cambia initialPracticeId
  useEffect(() => {
    if (initialPracticeId) {
      setSelectedPracticeId(initialPracticeId);
    }
  }, [initialPracticeId]);

  // Respuestas dinámicas a las preguntas de la especialidad
  const [dynamicAnswers, setDynamicAnswers] = useState({});

  // Datos de contacto y consulta
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredLanguage: lang,
    consultationType: 'telefonica', // telefonica | presencial | zoom
    state: 'Florida',
    notes: '',
    smsConsent: true
  });

  // Especialidad actual seleccionada
  const currentArea = PRACTICE_AREAS.find(p => p.id === selectedPracticeId) || PRACTICE_AREAS[0];

  // Iniciar telemetría al montar o cambiar
  useEffect(() => {
    analytics.trackEvaluatorStart(selectedPracticeId);
  }, [selectedPracticeId]);

  const handleNextStep = () => {
    const next = step + 1;
    setStep(next);
    analytics.trackEvaluatorStep(selectedPracticeId, next, 3);
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleDynamicAnswerChange = (questionId, value) => {
    setDynamicAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage(lang === 'es' ? 'Por favor complete su nombre y teléfono de contacto.' : 'Please enter your name and phone number.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        preferredLanguage: formData.preferredLanguage || lang,
        consultationType: formData.consultationType,
        state: formData.state,
        notes: formData.notes,
        smsConsent: formData.smsConsent,
        practiceAreaId: currentArea.id,
        practiceAreaTitle: currentArea.titleEs,
        answers: dynamicAnswers,
        submittedAt: new Date().toISOString()
      };

      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setSubmittedData(result);
        analytics.trackEvaluatorCompleted(currentArea.id);
      } else {
        setErrorMessage(result.error || (lang === 'es' ? 'Error al registrar su evaluación. Intente nuevamente.' : 'Error submitting evaluation. Please try again.'));
      }
    } catch (err) {
      setErrorMessage(lang === 'es' ? 'No se pudo conectar con el servidor seguro. Llámenos directamente.' : 'Connection error. Please call our direct line.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setStep(1);
    setDynamicAnswers({});
    setFormData({
      name: '',
      phone: '',
      email: '',
      preferredLanguage: lang,
      consultationType: 'telefonica',
      state: 'Florida',
      notes: '',
      smsConsent: true
    });
    if (onClose) onClose();
  };

  const handleClose = () => {
    if (!submittedData && step > 1) {
      analytics.trackEvaluatorAbandon(selectedPracticeId, step);
    }
    if (onClose) onClose();
  };

  const content = (
    <div className="bg-[#0B1E3D] border border-blue-900/60 rounded-2xl p-6 sm:p-10 shadow-2xl relative max-w-3xl w-full mx-auto text-white text-left">
      
      {/* Barra de progreso de 3 etapas */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'es' ? 'Cuestionario Orientativo Preliminar de Admisión' : 'Preliminary Intake Guidance Questionnaire'}</span>
          </span>
          <span className="text-slate-300 font-medium">
            {lang === 'es' ? `Etapa ${step} de 3` : `Step ${step} of 3`}
          </span>
        </div>

        <div className="w-full bg-[#081426] h-2 rounded-full overflow-hidden border border-blue-900/60">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {submittedData ? (
        <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200 motion-reduce:animate-none">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 px-2.5 py-0.5 rounded bg-[#081426] border border-amber-400/30">
              {lang === 'es' ? 'Registro de Consulta Preliminar' : 'Preliminary Intake Recorded'}
            </span>
            <h3 className="font-serif text-2xl font-bold text-white pt-1">
              {lang === 'es' ? '¡Cuestionario Recibido con Éxito!' : 'Questionnaire Received Successfully!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed font-light">
              {lang === 'es' 
                ? `Estimado(a) ${formData.name}, los parámetros iniciales de su caso en «${currentArea.titleEs}» han sido registrados para revisión individual por parte de un abogado autorizado.` 
                : `Dear ${formData.name}, your initial case parameters for "${currentArea.titleEn}" have been received for individualized review by a licensed attorney.`}
            </p>
          </div>

          {/* Resumen del Registro */}
          <div className="bg-[#081426] border border-blue-900/60 rounded-xl p-4 max-w-md mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between border-b border-blue-900/40 pb-1.5">
              <span className="text-slate-400">{lang === 'es' ? 'Folio de Registro:' : 'Intake ID:'}</span>
              <span className="font-mono font-bold text-amber-400">{submittedData.evalId}</span>
            </div>
            <div className="flex justify-between border-b border-blue-900/40 pb-1.5">
              <span className="text-slate-400">{lang === 'es' ? 'Materia Jurídica:' : 'Practice Area:'}</span>
              <span className="font-semibold text-white">{currentArea.titleEs}</span>
            </div>
            <div className="flex justify-between border-b border-blue-900/40 pb-1.5">
              <span className="text-slate-400">{lang === 'es' ? 'Modalidad Preferida:' : 'Preferred Mode:'}</span>
              <span className="font-semibold text-white capitalize">
                {formData.consultationType === 'telefonica' && (lang === 'es' ? 'Consulta Telefónica' : 'Phone Call')}
                {formData.consultationType === 'zoom' && (lang === 'es' ? 'Videollamada Remota (Zoom)' : 'Zoom Video')}
                {formData.consultationType === 'presencial' && (lang === 'es' ? 'Presencial en Sede' : 'In-Person at Office')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{lang === 'es' ? 'Siguiente Paso:' : 'Next Step:'}</span>
              <span className="font-semibold text-emerald-400">{lang === 'es' ? 'Revisión por Abogado Autorizado' : 'Licensed Attorney Review'}</span>
            </div>
          </div>

          {/* Aviso ético obligatorio */}
          <div className="p-3 bg-[#081426]/70 border border-blue-900/60 rounded-lg text-[11px] text-slate-300 leading-relaxed max-w-md mx-auto">
            <ShieldCheck className="w-4 h-4 text-amber-400 inline mr-1 -mt-0.5" />
            {lang === 'es' 
              ? 'Aviso Obligatorio: Este cuestionario orientativo preliminar no emite diagnósticos legales, no determina elegibilidad automática ni garantiza resultados. Todo análisis de viabilidad depende exclusivamente de la evaluación humana de un abogado autorizado.'
              : 'Mandatory Notice: This preliminary intake questionnaire does not issue legal diagnoses, does not determine eligibility automatically, and does not guarantee results. Any determination of viability depends exclusively on human review by a licensed attorney.'}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`tel:${FIRM_CONFIG.primaryPhoneRaw}`}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'es' ? 'Llamar al Bufete Ahora' : 'Call Law Firm Now'}</span>
            </a>

            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#081426] hover:bg-[#061224] text-slate-200 border border-blue-900/60 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
            >
              {lang === 'es' ? 'Nueva Evaluación' : 'New Assessment'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">

          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ETAPA 1: SELECCIÓN DE ESPECIALIDAD */}
          {step === 1 && (
            <div className="space-y-4 transition-opacity duration-200 ease-out motion-reduce:transition-none animate-in fade-in duration-200">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                  {lang === 'es' ? 'Paso 1: Identificación de Materia' : 'Step 1: Practice Selection'}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  {lang === 'es' ? '¿En qué área migratoria necesita asesoría legal?' : 'What immigration legal matter do you need assistance with?'}
                </h3>
                <p className="text-xs text-slate-300 font-light">
                  {lang === 'es' 
                    ? 'Seleccione la especialidad para adaptar las preguntas y asignar a los abogados de guardia adecuados.' 
                    : 'Select a specialty to adapt diagnostic questions and route to our specialized attorneys.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 max-h-[380px] overflow-y-auto pr-1">
                {PRACTICE_AREAS.map((practice) => {
                  const isSelected = selectedPracticeId === practice.id;
                  return (
                    <button
                      key={practice.id}
                      type="button"
                      onClick={() => setSelectedPracticeId(practice.id)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-[#0F274E] border-amber-400 text-white shadow-md ring-1 ring-amber-400/40' 
                          : 'bg-[#081426] border-blue-900/60 text-slate-300 hover:border-amber-400/50 hover:bg-[#0d2244]'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-amber-400">
                          {practice.category}
                        </span>
                        <div className="font-semibold text-xs text-white leading-tight">
                          {lang === 'es' ? practice.titleEs : practice.titleEn}
                        </div>
                      </div>
                      <div className="flex items-center justify-end pt-2">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-amber-400 bg-amber-400 text-[#081426]' : 'border-blue-800'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-[#081426]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-blue-900/60">
                <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'es' ? '100% Confidencial' : '100% Confidential'}</span>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center space-x-1.5 cursor-pointer transition-colors"
                >
                  <span>{lang === 'es' ? 'Continuar a las Preguntas' : 'Continue to Questions'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 2: PREGUNTAS DINÁMICAS ESPECÍFICAS DE LA ESPECIALIDAD */}
          {step === 2 && (
            <div className="space-y-4 transition-opacity duration-200 ease-out motion-reduce:transition-none animate-in fade-in duration-200">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                  {lang === 'es' ? 'Paso 2: Criterios Clave de Elegibilidad' : 'Step 2: Key Eligibility Criteria'}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  {lang === 'es' ? `Cuestionario Adaptativo: ${currentArea.titleEs}` : `Adaptive Questions: ${currentArea.titleEn}`}
                </h3>
                <p className="text-xs text-slate-300 font-light">
                  {lang === 'es' 
                    ? 'Responda estas 3 preguntas específicas para que nuestro equipo legal dimensione la viabilidad de su caso.' 
                    : 'Answer these 3 targeted questions so our legal team can assess case viability.'}
                </p>
              </div>

              <div className="space-y-4 pt-1">
                {currentArea.dynamicQuestions && currentArea.dynamicQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="bg-[#081426] border border-blue-900/60 rounded-xl p-3.5 space-y-2">
                    <label className="block text-xs font-bold text-white">
                      <span className="text-amber-400 mr-1.5">{idx + 1}.</span>
                      {lang === 'es' ? q.labelEs : q.labelEn}
                    </label>

                    <div className="space-y-1.5">
                      {q.options.map((opt, oIdx) => {
                        const isChecked = dynamicAnswers[q.id] === opt.value;
                        return (
                          <label
                            key={oIdx}
                            className={`flex items-start space-x-2.5 p-2 rounded-lg border transition-all cursor-pointer text-xs ${
                              isChecked
                                ? 'bg-[#0F274E] border-amber-400 text-white font-medium shadow-xs ring-1 ring-amber-400/30'
                                : 'bg-[#061224] border-blue-900/40 hover:border-blue-800 text-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={opt.value}
                              checked={isChecked}
                              onChange={() => handleDynamicAnswerChange(q.id, opt.value)}
                              className="mt-0.5 text-emerald-500 focus:ring-emerald-500"
                            />
                            <span>{lang === 'es' ? opt.labelEs : opt.labelEn}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-blue-900/60">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 bg-[#081426] text-slate-300 text-xs font-medium rounded-lg hover:bg-[#061224] border border-blue-900/60 flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'es' ? 'Cambiar Especialidad' : 'Change Specialty'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center space-x-1.5 cursor-pointer transition-colors"
                >
                  <span>{lang === 'es' ? 'Paso Final: Datos de Contacto' : 'Final Step: Contact Details'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 3: DATOS DE CONTACTO Y ENVÍO A BÓVEDA SEGURA */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4 transition-opacity duration-200 ease-out motion-reduce:transition-none animate-in fade-in duration-200">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                  {lang === 'es' ? 'Paso 3: Envío Seguro al Equipo Legal' : 'Step 3: Secure Delivery to Legal Team'}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  {lang === 'es' ? '¿A dónde enviamos el diagnóstico y con quién nos comunicamos?' : 'Where should we send your preliminary review?'}
                </h3>
                <p className="text-xs text-slate-300 font-light">
                  {lang === 'es' 
                    ? 'Garantía absoluta de confidencialidad. Sin costo por la evaluación inicial.' 
                    : 'Absolute confidentiality under ethical rules. No cost for initial assessment.'}
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    {lang === 'es' ? 'Nombre y Apellidos *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'es' ? 'Ej. Mario González' : 'E.g. Alexander Smith'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#081426] border border-blue-900/60 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      {lang === 'es' ? 'Teléfono Móvil (WhatsApp o Llamadas) *' : 'Mobile Phone *'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(314) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#081426] border border-blue-900/60 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      {lang === 'es' ? 'Correo Electrónico' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      placeholder="nombre@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#081426] border border-blue-900/60 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      {lang === 'es' ? 'Modalidad Preferida de Consulta' : 'Preferred Consultation Mode'}
                    </label>
                    <select
                      value={formData.consultationType}
                      onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                      className="w-full px-3 py-2 bg-[#081426] border border-blue-900/60 rounded-md text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="telefonica" className="bg-[#081426] text-white">{lang === 'es' ? 'Consulta Telefónica Confidencial' : 'Confidential Phone Call'}</option>
                      <option value="zoom" className="bg-[#081426] text-white">{lang === 'es' ? 'Videollamada Remota (Zoom)' : 'Remote Video (Zoom)'}</option>
                      <option value="presencial" className="bg-[#081426] text-white">{lang === 'es' ? 'Presencial en Oficinas (Miami / Orlando / Houston / NY)' : 'In-Person (Miami/Orlando/Houston/NY)'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      {lang === 'es' ? 'Idioma de Preferencia' : 'Preferred Language'}
                    </label>
                    <select
                      value={formData.preferredLanguage}
                      onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                      className="w-full px-3 py-2 bg-[#081426] border border-blue-900/60 rounded-md text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="es" className="bg-[#081426] text-white">Español</option>
                      <option value="en" className="bg-[#081426] text-white">English</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    {lang === 'es' ? 'Detalles o fechas límites que debamos conocer (opcional)' : 'Key deadlines or details (optional)'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={lang === 'es' ? 'Detalle si tiene audiencia, fecha límite de salida voluntaria o vencimiento...' : 'Note any court date, deadline or critical circumstance...'}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#081426] border border-blue-900/60 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-start space-x-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="evalSmsConsent"
                    checked={formData.smsConsent}
                    onChange={(e) => setFormData({ ...formData, smsConsent: e.target.checked })}
                    className="mt-0.5 rounded border-blue-900 bg-[#081426] text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="evalSmsConsent" className="text-[10px] text-slate-400 leading-snug">
                    {lang === 'es' 
                      ? 'Consiento recibir mensajes de texto (SMS) y llamadas confidenciales sobre el estado de esta evaluación de caso.' 
                      : 'I consent to receive text messages (SMS) and confidential calls regarding this case assessment.'}
                  </label>
                </div>
              </div>

              {/* Aviso Ético Transparente */}
              <div className="p-3 bg-[#081426] rounded-lg border border-blue-900/60 text-[11px] text-slate-300 leading-relaxed flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  {lang === 'es'
                    ? 'Aviso Importante: Este cuestionario orientativo preliminar recopila información básica para coordinar una consulta jurídica formal. No constituye asesoría legal vinculante ni determina elegibilidad de forma automática. Todo análisis de fondo requiere la revisión directa de un abogado autorizado.'
                    : 'Important Notice: This preliminary intake questionnaire collects basic information to coordinate a formal legal consultation. It does not constitute binding legal advice nor automatically determine eligibility. Any substantive case review requires direct evaluation by a licensed attorney.'}
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-blue-900/60">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 bg-[#081426] text-slate-300 text-xs font-medium rounded-lg hover:bg-[#061224] border border-blue-900/60 flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'es' ? 'Volver a Preguntas' : 'Back to Questions'}</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <span>{loading ? (lang === 'es' ? 'Procesando...' : 'Processing...') : (lang === 'es' ? 'Enviar Evaluación Segura' : 'Submit Secure Evaluation')}</span>
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                </button>
              </div>
            </form>
          )}

        </div>
      )}

    </div>
  );

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050D1A]/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
        <div className="relative w-full max-w-3xl my-8">
          <button
            onClick={handleClose}
            className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-[#081426] border border-blue-900/60 text-slate-300 flex items-center justify-center hover:bg-[#0F274E] hover:text-white transition-colors cursor-pointer shadow-subtle"
            aria-label="Cerrar evaluador"
          >
            ✕
          </button>
          {content}
        </div>
      </div>
    );
  }

  return (
    <section id="evaluador" className="py-20 bg-[#07152B] text-white relative overflow-hidden border-b border-blue-900/60 scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#081426] border border-amber-400/40 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <FileCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'es' ? 'Orientación Inicial de Caso' : 'Initial Case Intake'}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            {lang === 'es' ? 'Cuestionario Orientativo Preliminar de Admisión' : 'Preliminary Intake Guidance Questionnaire'}
          </h2>
          <p className="text-slate-300 text-sm font-light">
            {lang === 'es' 
              ? 'Complete este cuestionario orientativo en 3 etapas. Un abogado autorizado examinará sus parámetros iniciales para coordinar una consulta jurídica formal.' 
              : 'Complete this 3-step intake questionnaire. A licensed attorney will review your parameters to coordinate a formal legal consultation.'}
          </p>
        </div>

        {content}
      </div>
    </section>
  );
}