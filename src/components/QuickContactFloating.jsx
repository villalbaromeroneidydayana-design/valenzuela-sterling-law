import React from 'react';
import { Phone, FileCheck, ArrowRight } from 'lucide-react';
import { FIRM_CONFIG } from '../data/demoData';
import { analytics } from '../services/analytics';

export default function QuickContactFloating({ lang, onOpenEvaluator }) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 sm:hidden bg-[#050D1A]/95 border-t border-blue-900/60 px-3 py-2.5 backdrop-blur-lg shadow-2xl flex items-center justify-between gap-2.5">
      {/* 1. Botón Llamar Inmediato */}
      <a
        href={`tel:${FIRM_CONFIG.primaryPhoneRaw}`}
        onClick={() => analytics.trackPhoneClick('floating_mobile')}
        className="flex-1 flex items-center justify-center space-x-2 py-3 bg-[#081426] hover:bg-[#16386E] border border-blue-800 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md"
      >
        <Phone className="w-4 h-4 text-emerald-400" />
        <span>{lang === 'es' ? 'Llamar 24/7' : 'Call 24/7'}</span>
      </a>

      {/* 2. Botón Evaluación de Elegibilidad Inmediata */}
      <button
        onClick={onOpenEvaluator}
        className="flex-[1.2] flex items-center justify-center space-x-1.5 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider active:scale-95 transition-all shadow-lg border border-amber-300/60 cursor-pointer"
      >
        <FileCheck className="w-4 h-4 text-slate-950" />
        <span>{lang === 'es' ? 'Evaluar Caso' : 'Evaluate Case'}</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
      </button>
    </div>
  );
}
