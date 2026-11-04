import React from 'react';
import { SUCCESS_STORIES } from '../data/demoData';
import { Award, CheckCircle2, Calendar, ArrowRight } from 'lucide-react';

export default function SuccessStories({ lang, onOpenEvaluator }) {
  return (
    <section id="casos-exito" className="py-20 bg-[#081426] text-white relative scroll-mt-28 border-b border-blue-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1E3D] border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'es' ? 'Precedentes & Resultados' : 'Proven Track Record'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                Casos y Resoluciones <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Favorables</span>
              </>
            ) : (
              <>
                Recent Notable <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Case Approvals</span>
              </>
            )}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
            {lang === 'es' 
              ? 'En el Derecho de Inmigración, la victoria se mide en familias reunificadas, órdenes de deportación canceladas y futuros protegidos bajo la ley estadounidense.'
              : 'In Immigration Law, victory is defined by families united, deportation orders vacated, and futures secured under United States law.'
            }
          </p>
        </div>

        {/* Grid de Casos de Éxito en Azul Corporativo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {SUCCESS_STORIES.map((story, idx) => (
            <div
              key={idx}
              className="bg-[#0B1E3D] border border-blue-800/60 hover:border-amber-400/50 rounded-2xl p-7 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:bg-[#0F274E]"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-0.5 bg-[#081426] border border-blue-800 text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {story.badge}
                  </span>
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{story.timeline}</span>
                  </div>
                </div>

                <h3 className="font-serif text-xl font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                  {lang === 'es' ? story.titleEs : story.titleEn}
                </h3>

                <div className="text-xs font-semibold text-emerald-400">
                  {story.category}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  {lang === 'es' ? story.summaryEs : story.summaryEn}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-blue-900/60 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{story.result}</span>
                </div>

                <button
                  onClick={onOpenEvaluator}
                  className="text-xs font-semibold text-slate-300 hover:text-amber-300 flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <span>{lang === 'es' ? 'Consultar caso similar' : 'Inquire on similar case'}</span>
                  <ArrowRight className="w-3 h-3 text-amber-400" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Disclaimer Legal Ético */}
        <div className="text-center text-[11px] text-slate-400 max-w-2xl mx-auto italic leading-normal">
          {lang === 'es' 
            ? '*Descargo de Responsabilidad: Cada caso migratorio es único y depende de hechos y leyes específicas. Los resultados pasados no garantizan un desenlace idéntico para casos futuros.' 
            : '*Legal Disclaimer: Past case outcomes do not guarantee a similar result in future legal proceedings. Every immigration case depends on unique factual and legal circumstances.'}
        </div>

      </div>
    </section>
  );
}
