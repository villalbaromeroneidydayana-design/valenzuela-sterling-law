import React, { useState } from 'react';
import { PRACTICE_AREAS, FIRM_CONFIG } from '../data/demoData';
import { 
  Scale, Users, HeartHandshake, Briefcase, 
  Sparkles, FileText, CheckCircle2, ArrowRight, 
  X, Phone, MessageCircle, HelpCircle, AlertCircle, Lock
} from 'lucide-react';
import { analytics } from '../services/analytics';

export default function PracticeAreas({ lang, onSelectPractice, onOpenCallRequest }) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeModalPractice, setActiveModalPractice] = useState(null);

  const filters = [
    { id: 'all', labelEs: 'Todas las Especialidades (12)', labelEn: 'All Specialties (12)' },
    { id: 'familia', labelEs: 'Familia & Ciudadanía', labelEn: 'Family & Citizenship' },
    { id: 'defensa', labelEs: 'Defensa contra Deportación & Asilo', labelEn: 'Deportation Defense & Asylum' },
    { id: 'corporativo', labelEs: 'Visas de Inversión & Empleo', labelEn: 'Business & Investor Visas' },
    { id: 'humanitario', labelEs: 'Alivio Humanitario & VAWA', labelEn: 'Humanitarian & VAWA' },
  ];

  const filteredAreas = selectedFilter === 'all' 
    ? PRACTICE_AREAS 
    : PRACTICE_AREAS.filter(area => area.category === selectedFilter);

  const getIcon = (id) => {
    switch (id) {
      case 'residencia-green-card':
      case 'peticiones-familiares':
      case 'ciudadania-naturalizacion':
        return <Users className="w-5 h-5 text-amber-400" />;
      case 'asilo-politico':
      case 'defensa-deportacion':
      case 'perdones-migratorios':
        return <Scale className="w-5 h-5 text-amber-400" />;
      case 'visas-inversion-eb5-e2':
      case 'visas-trabajo-empleo':
      case 'visas-talento-o1-eb1':
        return <Briefcase className="w-5 h-5 text-amber-400" />;
      case 'programa-vawa':
      case 'visa-u-visa-t':
      case 'tps-daca':
        return <HeartHandshake className="w-5 h-5 text-amber-400" />;
      default:
        return <FileText className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleOpenPracticeDetail = (area) => {
    setActiveModalPractice(area);
    analytics.trackServiceView(area.id, area.category);
  };

  const handleStartEvaluation = (practiceId) => {
    setActiveModalPractice(null);
    onSelectPractice(practiceId);
  };

  const handleWhatsAppPractice = (area) => {
    const text = encodeURIComponent(area.whatsappPrefill || `Hola Valenzuela & Sterling, deseo una consulta sobre ${area.titleEs}`);
    analytics.trackWhatsAppClick('practice_modal', area.id);
    window.open(`https://wa.me/${FIRM_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <section id="servicios" className="py-20 bg-[#081426] text-white relative scroll-mt-28 border-b border-blue-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Encabezado del Directorio */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1E3D] border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'es' ? 'Directorio Especializado en Inmigración' : 'Specialized Immigration Directory'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                Nuestras Principales <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Áreas de Práctica</span>
              </>
            ) : (
              <>
                Our Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Immigration Practice Areas</span>
              </>
            )}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
            {lang === 'es' 
              ? 'Explore cada especialidad para conocer los criterios legales, las situaciones cotidianas que atendemos y comience su evaluación de caso de inmediato.'
              : 'Explore each legal practice area to review requirements, typical scenarios handled, and initiate your immediate case assessment.'
            }
          </p>

          {/* Filtros de Categorías */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-md'
                    : 'bg-[#0B1E3D] text-slate-300 hover:text-white border border-blue-800/80 hover:bg-[#0F274E]'
                }`}
              >
                {lang === 'es' ? f.labelEs : f.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Visual de 12 Especialidades - Tarjetas en Azul Corporativo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAreas.map((area) => (
            <div
              key={area.id}
              className="bg-[#0B1E3D] border border-blue-800/60 hover:border-amber-400/50 rounded-xl p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 motion-reduce:transition-none hover:shadow-2xl hover:bg-[#0F274E] flex flex-col justify-between group text-left"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#081426] border border-blue-800/80 flex items-center justify-center group-hover:border-amber-400/40 transition-colors duration-200">
                    {getIcon(area.id)}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 px-2.5 py-0.5 rounded bg-[#081426] border border-blue-800/80">
                    {area.category.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors duration-200 leading-snug">
                    {lang === 'es' ? area.titleEs : area.titleEn}
                  </h3>
                  <p className="text-xs text-amber-400 font-medium mt-1">
                    {lang === 'es' ? area.taglineEs : area.taglineEn}
                  </p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 font-light">
                  {lang === 'es' ? area.descriptionEs : area.descriptionEn}
                </p>
              </div>

              {/* Acciones de la Tarjeta Compacta */}
              <div className="pt-4 mt-3 border-t border-blue-900/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenPracticeDetail(area)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1.5 transition-colors duration-200 cursor-pointer"
                >
                  <span>{lang === 'es' ? 'Explorar Especialidad' : 'Explore Area'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleStartEvaluation(area.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-md shadow-sm transition-all duration-200 cursor-pointer"
                >
                  <span>{lang === 'es' ? 'Consultar' : 'Inquire'}</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* MODAL DETALLADO DE EXPERIENCIA INTERACTIVA */}
      {activeModalPractice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-200 motion-reduce:transition-none overflow-y-auto">
          <div className="bg-[#0B1E3D] border border-blue-700/80 rounded-2xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto text-left my-8 transform transition-all duration-200 ease-out animate-in fade-in zoom-in-95 motion-reduce:animate-none text-white">
            
            <button
              onClick={() => setActiveModalPractice(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Encabezado */}
            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#081426] border border-blue-800 flex items-center justify-center flex-shrink-0 mt-1">
                {getIcon(activeModalPractice.id)}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-amber-400 uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#081426] border border-blue-800">
                  {lang === 'es' ? 'Especialidad Jurídica' : 'Legal Specialty'} • {activeModalPractice.category.toUpperCase()}
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  {lang === 'es' ? activeModalPractice.titleEs : activeModalPractice.titleEn}
                </h3>
                <p className="text-xs text-amber-300 font-medium">
                  {lang === 'es' ? activeModalPractice.taglineEs : activeModalPractice.taglineEn}
                </p>
              </div>
            </div>

            {/* Explicación del Servicio */}
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
              {lang === 'es' ? activeModalPractice.descriptionEs : activeModalPractice.descriptionEn}
            </p>

            {/* Bloque 1: Situaciones que Puede Atender */}
            {activeModalPractice.situations && activeModalPractice.situations.length > 0 && (
              <div className="bg-[#081426] border border-blue-800/80 rounded-xl p-4 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'es' ? 'Situaciones Concretas que Atendemos:' : 'Typical Scenarios Handled:'}</span>
                </h4>
                <ul className="space-y-2">
                  {activeModalPractice.situations.map((sit, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                      <span>{lang === 'es' ? sit.es : sit.en}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bloque 2: Preguntas Orientativas ("¿Se identifica?") */}
            {activeModalPractice.guidingQuestions && activeModalPractice.guidingQuestions.length > 0 && (
              <div className="bg-[#0F274E]/80 border border-blue-800/80 rounded-xl p-4 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'es' ? 'Preguntas Orientativas para Identificar su Caso:' : 'Guiding Self-Assessment Questions:'}</span>
                </h4>
                <div className="space-y-1.5">
                  {activeModalPractice.guidingQuestions.map((gq, idx) => (
                    <div key={idx} className="p-2 bg-[#081426] rounded-lg border border-blue-800 text-xs text-slate-300 flex items-center space-x-2">
                      <span className="text-amber-400 font-bold text-[11px]">{idx + 1}.</span>
                      <span className="italic">{lang === 'es' ? gq.es : gq.en}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aspectos Clave */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                {lang === 'es' ? 'Garantías y Alcance de Representación:' : 'Scope of Legal Representation:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {activeModalPractice.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Aviso de Confidencialidad y Orientación */}
            <div className="flex items-center space-x-2 text-[11px] text-slate-300 bg-[#081426] p-2.5 rounded-lg border border-blue-900/80">
              <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>
                {lang === 'es' 
                  ? 'La información enviada será tratada bajo estricta reserva profesional para coordinar una consulta jurídica individualizada con un abogado autorizado.'
                  : 'All information provided will be treated with professional discretion to coordinate an individualized legal consultation with a licensed attorney.'}
              </span>
            </div>

            {/* Acciones de Conversión Múltiples */}
            <div className="pt-4 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              
              {/* WhatsApp Contextualizado */}
              <button
                onClick={() => handleWhatsAppPractice(activeModalPractice)}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{lang === 'es' ? 'Consultar por WhatsApp' : 'Inquire on WhatsApp'}</span>
              </button>

              {/* Botón Principal: Iniciar Cuestionario Orientativo */}
              <button
                onClick={() => handleStartEvaluation(activeModalPractice.id)}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer border border-amber-300/60"
              >
                <span>{lang === 'es' ? 'Iniciar Cuestionario Orientativo' : 'Start Guidance Questionnaire'}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

            </div>

          </div>
        </div>
      )}

    </section>
  );
}
