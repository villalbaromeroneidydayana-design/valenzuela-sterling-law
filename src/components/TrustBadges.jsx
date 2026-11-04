import React from 'react';
import { Award, Shield, CheckCircle, Lock, Scale, Globe2, FileText } from 'lucide-react';
import { FIRM_CONFIG } from '../data/demoData';

export default function TrustBadges({ lang }) {
  // Compromisos éticos verificables mientras los distintivos externos (BBB, Avvo, Google, AILA) permanecen ocultos
  const ethicalPillars = [
    {
      icon: Lock,
      titleEs: "Secreto Profesional",
      titleEn: "Privileged & Confidential",
      descEs: "Privilegio Abogado-Cliente Federal",
      descEn: "Federal Attorney-Client Privilege"
    },
    {
      icon: Scale,
      titleEs: "Rigor & Diligencia",
      titleEn: "Rigorous Due Diligence",
      descEs: "Auditoría probatoria en cada caso",
      descEn: "Evidentiary review in every matter"
    },
    {
      icon: CheckCircle,
      titleEs: "Transparencia Total",
      titleEn: "Total Fee Transparency",
      descEs: "Honorarios claros sin costos ocultos",
      descEn: "Clear fees with no hidden costs"
    },
    {
      icon: Globe2,
      titleEs: "Atención Bilingüe",
      titleEn: "100% Bilingual Service",
      descEs: "Español e Inglés sin intermediarios",
      descEn: "Spanish & English direct counsel"
    }
  ];

  return (
    <section className="bg-[#050D1A] border-b border-blue-900/40 py-3.5 sm:py-4 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          
          {/* Título de compromisos éticos */}
          <div className="text-center md:text-left space-y-0.5">
            <span className="text-amber-400 font-bold text-[11px] uppercase tracking-widest flex items-center justify-center md:justify-start space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'es' ? 'Compromiso Institucional' : 'Institutional Commitment'}</span>
            </span>
            <h3 className="text-white font-serif text-base sm:text-lg font-bold">
              {lang === 'es' ? 'Pilares Éticos y Garantías de Representación' : 'Ethical Pillars & Practice Standards'}
            </h3>
            <div className="text-[10px] text-slate-400 italic">
              {lang === 'es' 
                ? 'Distintivos de acreditación externa (BBB, Avvo, Google Reviews, AILA) ocultos temporalmente en espera de validación de perfiles oficiales.' 
                : 'External accreditations (BBB, Avvo, Google Reviews, AILA) temporarily hidden pending official profile confirmation.'}
            </div>
          </div>

          {/* Grid de 4 Pilares Éticos Verificables */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
            {ethicalPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="flex items-center space-x-2.5 bg-[#0B1E3D] border border-blue-800/60 rounded-lg px-3.5 py-2 shadow-md hover:border-amber-400/50 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-[#081426] text-amber-400 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white flex items-center space-x-1">
                      <span>{lang === 'es' ? pillar.titleEs : pillar.titleEn}</span>
                    </div>
                    <div className="text-[10px] text-slate-300 truncate max-w-[130px]">
                      {lang === 'es' ? pillar.descEs : pillar.descEn}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
