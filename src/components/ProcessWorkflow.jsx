import React, { useState } from 'react';
import { 
  FileSearch, Compass, FolderCheck, UserCheck, 
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, ShieldAlert, Sparkles 
} from 'lucide-react';
import { CASE_PROCESS } from '../data/demoData';

export default function ProcessWorkflow({ lang, onOpenEvaluator }) {
  const [activeStep, setActiveStep] = useState(1);

  const getStepIcon = (num) => {
    switch (num) {
      case 1:
        return <FileSearch className="w-5 h-5 text-amber-400" />;
      case 2:
        return <Compass className="w-5 h-5 text-amber-400" />;
      case 3:
        return <FolderCheck className="w-5 h-5 text-amber-400" />;
      case 4:
        return <UserCheck className="w-5 h-5 text-amber-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  const handlePrevStep = () => {
    setActiveStep(prev => (prev > 1 ? prev - 1 : 4));
  };

  const handleNextStep = () => {
    setActiveStep(prev => (prev < 4 ? prev + 1 : 1));
  };

  return (
    <section id="proceso" className="py-20 bg-[#081426] text-white relative overflow-hidden border-b border-blue-900/60 scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Cabecera de Sección */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1E3D] border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'es' ? 'Metodología Jurídica' : 'Representation Workflow'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                Cómo Funciona Nuestro <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Proceso de Representación</span>
              </>
            ) : (
              <>
                Our Four-Stage <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Representation Process</span>
              </>
            )}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
            {lang === 'es' ? CASE_PROCESS.subheadlineEs : CASE_PROCESS.subheadlineEn}
          </p>
        </div>

        {/* NAVEGACIÓN DE LAS 4 ETAPAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CASE_PROCESS.steps.map((st) => {
            const isSelected = activeStep === st.stepNumber;
            return (
              <button
                key={st.stepNumber}
                onClick={() => setActiveStep(st.stepNumber)}
                className={`p-6 rounded-xl text-left border transition-all duration-200 ease-out flex flex-col justify-between cursor-pointer motion-reduce:transition-none ${
                  isSelected
                    ? 'bg-[#0F274E] border-amber-400 shadow-xl ring-1 ring-amber-400/30 -translate-y-0.5'
                    : 'bg-[#0B1E3D] border-blue-800/60 hover:border-amber-400/40 hover:bg-[#0E254B] hover:-translate-y-0.5'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                      isSelected ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-[#081426] text-slate-300 border border-blue-800'
                    }`}>
                      0{st.stepNumber}
                    </span>
                    <div className="p-2 rounded-lg bg-[#081426] border border-blue-800">
                      {getStepIcon(st.stepNumber)}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                      {lang === 'es' ? st.durationEs : st.durationEn}
                    </span>
                    <h3 className="font-serif text-base font-bold text-white mt-1 leading-snug">
                      {lang === 'es' ? st.titleEs : st.titleEn}
                    </h3>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-900/60 flex items-center justify-between text-xs text-slate-300">
                  <span className="text-[11px] font-medium">
                    {isSelected ? (lang === 'es' ? 'Fase activa' : 'Active phase') : (lang === 'es' ? 'Ver detalles' : 'View details')}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-1 text-amber-400' : 'text-slate-400'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* DETALLE EXPANDIDO DE LA ETAPA SELECCIONADA */}
        {(() => {
          const current = CASE_PROCESS.steps.find(s => s.stepNumber === activeStep) || CASE_PROCESS.steps[0];
          return (
            <div className="bg-[#0B1E3D] border border-blue-700/80 rounded-2xl p-8 sm:p-10 shadow-2xl transition-opacity duration-200 ease-out motion-reduce:transition-none animate-in fade-in duration-200 text-left">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <span>{lang === 'es' ? `Etapa 0${current.stepNumber} en Profundidad` : `Stage 0${current.stepNumber} In-Depth`}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{lang === 'es' ? current.durationEs : current.durationEn}</span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    {lang === 'es' ? current.titleEs : current.titleEn}
                  </h3>

                  <p className="text-sm text-slate-200 leading-relaxed font-light">
                    {lang === 'es' ? current.summaryEs : current.summaryEn}
                  </p>

                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    <button
                      onClick={onOpenEvaluator}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md cursor-pointer transition-all border border-amber-300/60"
                    >
                      <span>{lang === 'es' ? 'Iniciar Esta Etapa' : 'Begin This Stage'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handlePrevStep}
                        className="px-3 py-2 bg-[#081426] hover:bg-[#16386E] text-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1 cursor-pointer transition-colors border border-blue-800"
                      >
                        <ArrowLeft className="w-3 h-3 text-amber-400" />
                        <span>{lang === 'es' ? 'Anterior' : 'Prev'}</span>
                      </button>

                      <button
                        onClick={handleNextStep}
                        className="px-3 py-2 bg-[#081426] hover:bg-[#16386E] text-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1 cursor-pointer transition-colors border border-blue-800"
                      >
                        <span>{lang === 'es' ? 'Siguiente' : 'Next'}</span>
                        <ArrowRight className="w-3 h-3 text-amber-400" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#081426] border border-blue-800/80 p-6 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'es' ? 'Acciones Clave en Esta Fase:' : 'Key Actions in This Phase:'}</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {(lang === 'es' ? current.actionsEs : current.actionsEn).map((act, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-200 leading-relaxed">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          );
        })()}

        {/* NOTA ÉTICA OBLIGATORIA */}
        <div className="bg-[#050D1A] border border-blue-900/60 p-4 sm:p-5 rounded-xl flex items-start space-x-3.5 max-w-4xl mx-auto text-xs text-slate-300 leading-relaxed text-left">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p>
            {lang === 'es' ? CASE_PROCESS.disclaimerEs : CASE_PROCESS.disclaimerEn}
          </p>
        </div>

      </div>
    </section>
  );
}
