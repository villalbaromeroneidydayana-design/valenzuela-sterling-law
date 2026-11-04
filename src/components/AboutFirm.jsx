import React from 'react';
import { 
  Building2, Compass, Shield, HeartHandshake, 
  Scale, BookOpen, CheckCircle2, ArrowRight, Sparkles, 
  Users, Lock, Landmark, UserCheck 
} from 'lucide-react';
import { FIRM_ABOUT } from '../data/demoData';

export default function AboutFirm({ lang, onOpenEvaluator }) {
  return (
    <section id="la-firma" className="py-20 bg-[#0B1E3D] text-white relative overflow-hidden border-b border-blue-900/60 scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
        
        {/* 1. CABECERA INSTITUCIONAL EDITORIAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#081426] border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Landmark className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'es' ? 'Presentación Institucional' : 'About the Law Firm'}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
              {lang === 'es' ? (
                <>
                  Excelencia y Ética Jurídica al Servicio de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Comunidad Inmigrante</span>
                </>
              ) : (
                <>
                  Legal Excellence & Ethical Advocacy for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Immigrant Community</span>
                </>
              )}
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
              {lang === 'es' ? FIRM_ABOUT.overviewEs : FIRM_ABOUT.overviewEn}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start space-x-3 bg-[#081426] border border-blue-800/80 p-4 rounded-xl shadow-lg">
                <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <strong className="text-white block font-serif text-sm">
                    {lang === 'es' ? 'Práctica Exclusiva' : 'Exclusive Practice'}
                  </strong>
                  <span>{lang === 'es' ? '100% enfocados en la ley federal de inmigración de EE. UU.' : '100% focused on U.S. Federal Immigration Law.'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-[#081426] border border-blue-800/80 p-4 rounded-xl shadow-lg">
                <Users className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <strong className="text-white block font-serif text-sm">
                    {lang === 'es' ? 'Representación Bilingüe' : 'Bilingual Advocacy'}
                  </strong>
                  <span>{lang === 'es' ? 'Atención cercana y personalizada en español e inglés.' : 'Direct personal counsel in English and Spanish.'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenEvaluator}
                className="inline-flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-lg cursor-pointer border border-amber-300/60"
              >
                <span>{lang === 'es' ? 'Solicitar Evaluación Confidencial' : 'Request Confidential Evaluation'}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>

          {/* Fotografía Arquitectónica de Corte / Biblioteca */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-blue-800/80 group bg-[#081426]">
              <img
                src={FIRM_ABOUT.images.courthouse}
                alt={lang === 'es' ? 'Corte Federal de Inmigración' : 'Federal Immigration Court'}
                width="1200"
                height="800"
                loading="lazy"
                decoding="async"
                className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081426]/90 via-transparent to-transparent" />
              
              <div className="absolute bottom-5 inset-x-5 bg-[#081426]/95 backdrop-blur-md border border-blue-700/80 p-4 rounded-xl shadow-xl text-left">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'es' ? 'Filosofía de Litigio' : 'Litigation Philosophy'}</span>
                </div>
                <p className="text-xs text-slate-200 mt-1 italic font-serif">
                  {lang === 'es' 
                    ? '«Defender a un inmigrante es defender el principio de dignidad y debido proceso que sostiene a esta nación.»' 
                    : '“To advocate for an immigrant is to defend the core principles of dignity and due process that uphold this nation.”'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* 2. MISIÓN Y VISIÓN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          
          {/* Misión */}
          <div className="bg-[#081426] border border-blue-800/60 p-8 rounded-2xl shadow-xl space-y-4 hover:border-amber-400/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#0B1E3D] border border-blue-800 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-white">
              {lang === 'es' ? 'Nuestra Misión' : 'Our Mission'}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed font-light">
              {lang === 'es' ? FIRM_ABOUT.missionEs : FIRM_ABOUT.missionEn}
            </p>
          </div>

          {/* Visión */}
          <div className="bg-[#081426] border border-blue-800/60 p-8 rounded-2xl shadow-xl space-y-4 hover:border-amber-400/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#0B1E3D] border border-blue-800 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-white">
              {lang === 'es' ? 'Nuestra Visión' : 'Our Vision'}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed font-light">
              {lang === 'es' ? FIRM_ABOUT.visionEs : FIRM_ABOUT.visionEn}
            </p>
          </div>

        </div>

        {/* 3. ENFOQUE PERSONALIZADO Y FILOSOFÍA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          
          <div className="bg-[#081426] border border-blue-800/60 p-7 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center space-x-2.5">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-serif text-xl font-bold text-white">
                {lang === 'es' ? 'Enfoque de Atención Personalizada' : 'Personalized Client Care'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              {lang === 'es'
                ? 'Rechazamos el modelo de procesamiento masivo o industrial. Cada cliente es asignado directamente a un abogado responsable que conoce su historia de principio a fin, manteniendo canales de comunicación transparentes y citas preparatorias previas a cada instancia oficial.'
                : 'We reject assembly-line case handling. Every client is assigned directly to a lead attorney who knows their case from start to finish, providing open communication, constant tracking, and dedicated prep sessions.'}
            </p>
          </div>

          <div className="bg-[#081426] border border-blue-800/60 p-7 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center space-x-2.5">
              <Scale className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif text-xl font-bold text-white">
                {lang === 'es' ? 'Filosofía de Representación Jurídica' : 'Litigation & Advocacy Philosophy'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              {lang === 'es'
                ? 'Nuestra filosofía se basa en la defensa activa y proactiva del debido proceso. No nos limitamos a llenar formularios; construimos expedientes probatorios blindados con argumentos jurisprudenciales sólidos para proteger el futuro de su familia ante cualquier tribunal.'
                : 'Our philosophy centers on vigorous protection of due process. We do not merely fill out government forms; we engineer fortified evidentiary records with sound case-law backing to defend your family.'}
            </p>
          </div>

        </div>

        {/* 4. PRINCIPIOS DE TRABAJO Y ÉTICA */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">
              {lang === 'es' ? 'Fundamentos Deontológicos' : 'Core Ethical Pillars'}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              {lang === 'es' ? 'Principios de Trabajo y Ética Profesional' : 'Work Principles & Professional Ethics'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
            {FIRM_ABOUT.principles.map((pr, idx) => {
              const romanNums = ['I', 'II', 'III', 'IV'];
              return (
                <div 
                  key={idx}
                  className="bg-[#081426] border border-blue-800/60 p-6 rounded-xl shadow-lg hover:border-amber-400/50 transition-colors space-y-2.5"
                >
                  <div className="text-amber-400 font-serif text-sm font-bold tracking-wider">
                    {romanNums[idx]}.
                  </div>
                  <h4 className="font-serif text-base font-bold text-white">
                    {lang === 'es' ? pr.titleEs : pr.titleEn}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {lang === 'es' ? pr.descEs : pr.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
