import React, { useState } from 'react';
import { FAQS } from '../data/demoData';
import { HelpCircle, ChevronDown, ShieldCheck } from 'lucide-react';

export default function FaqSection({ lang }) {
  const [openIdx, setOpenIdx] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faqs" className="py-20 bg-[#0B1E3D] text-white relative scroll-mt-28 border-b border-blue-900/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Cabecera */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#081426] border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'es' ? 'Claridad Jurídica' : 'Legal FAQs'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                Preguntas Frecuentes sobre <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Inmigración en EE. UU.</span>
              </>
            ) : (
              <>
                Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Immigration Questions</span>
              </>
            )}
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed font-light">
            {lang === 'es' 
              ? 'Respuestas directas de nuestros abogados a las inquietudes más comunes sobre derechos legales, plazos procesales y confidencialidad.'
              : 'Direct legal answers regarding constitutional protections, procedural timelines, and attorney-client confidentiality.'
            }
          </p>
        </div>

        {/* Acordeón de FAQs en Azul Corporativo */}
        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-[#081426] border border-blue-800/70 rounded-xl overflow-hidden transition-all duration-200 ease-out shadow-lg hover:border-amber-400/50"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  className="w-full text-left p-5 flex items-center justify-between space-x-4 cursor-pointer hover:bg-[#0E254B] transition-colors duration-200"
                >
                  <span className="font-serif text-base sm:text-lg font-semibold text-white">
                    {lang === 'es' ? faq.qEs : faq.qEn}
                  </span>
                  <div className={`p-1.5 rounded-full bg-[#0B1E3D] text-amber-400 transition-transform duration-200 ease-out motion-reduce:transition-none border border-blue-800 ${isOpen ? 'rotate-180 bg-emerald-600 text-white border-emerald-500' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <div
                  id={`faq-answer-${idx}`}
                  role="region"
                  className={`grid transition-all duration-200 ease-out motion-reduce:transition-none ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-2 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-blue-900/60 space-y-2.5 font-light text-left">
                      <p>{lang === 'es' ? faq.aEs : faq.aEn}</p>
                      <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-medium pt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span>{lang === 'es' ? 'Validado bajo el Código de Inmigración y Nacionalidad (INA)' : 'Governed under Immigration & Nationality Act (INA)'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
