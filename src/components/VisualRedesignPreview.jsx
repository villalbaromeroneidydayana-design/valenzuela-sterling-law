import React, { useState } from 'react';
import { 
  Shield, Phone, CheckCircle2, Star, ArrowRight, Award, Lock, 
  Scale, FileCheck, Users, Briefcase, ChevronRight, Play, Globe2 
} from 'lucide-react';
import { FIRM_CONFIG, ATTORNEYS, TESTIMONIALS } from '../data/demoData';

export default function VisualRedesignPreview({ lang = 'es' }) {
  return (
    <div className="min-h-screen bg-[#081426] text-white font-sans antialiased">
      
      {/* 1. TOP BAR INSTITUCIONAL (Azul Noche Profundo + Verde Acento) */}
      <div className="bg-[#050D1A] border-b border-blue-900/40 text-xs py-2 px-4 sm:px-8 text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <a href="tel:+13146185666" className="flex items-center space-x-2 text-white hover:text-amber-400 transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Urgencias 24/7: <strong className="text-white font-bold tracking-wider">+1 (314) 618-5666</strong></span>
            </a>
            <span className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Atención Inmediata en Español</span>
            </span>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span className="text-slate-400">Miami • Orlando • Houston • New York</span>
            <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-amber-400 font-bold text-[11px]">ES</span>
          </div>
        </div>
      </div>

      {/* 2. ENCABEZADO MODERNO (Azul Corporativo #0B1E3D + Detalles Amarillo Oro) */}
      <header className="sticky top-0 z-40 bg-[#0B1E3D]/95 backdrop-blur-md border-b border-blue-900/60 shadow-xl py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
              <Shield className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
                VALENZUELA <span className="text-amber-400 italic">&</span> STERLING
              </div>
              <div className="text-[9px] uppercase tracking-[0.24em] font-semibold text-emerald-400">
                • ABOGADOS DE INMIGRACIÓN & DEFENSA LABORAL USA
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-slate-200">
            <a href="#servicios" className="text-white hover:text-amber-400 transition-colors">Servicios Migratorios</a>
            <a href="#laboral" className="text-white hover:text-amber-400 transition-colors">Defensa Laboral</a>
            <a href="#abogados" className="text-white hover:text-amber-400 transition-colors">Abogados</a>
            <a href="#testimonios" className="text-white hover:text-amber-400 transition-colors">Testimonios</a>
            <a href="#fianzas" className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <span>Fianzas</span>
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 cursor-pointer">
              Evaluar Mi Caso
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO COMPACTO & IMPACTANTE (Fondo Azul Marino #0B1E3D + Contrastes en Amarillo & Verde) */}
      <section className="relative overflow-hidden py-10 lg:py-14 bg-gradient-to-b from-[#0B1E3D] via-[#0E254B] to-[#081426] border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Mensaje Principal */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Firma de Litigio Federal & Defensa en los 50 Estados</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[3.25rem] font-bold text-white tracking-tight leading-[1.14]">
                Defensa Jurídica de Alto Nivel en <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Inmigración y Derechos Laborales</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-200 max-w-xl leading-relaxed font-light">
                Representación legal rigurosa para familias, trabajadores y empresarios en Estados Unidos. Casos complejos ante USCIS, Cortes de Inmigración (EOIR) y Reclamaciones de Salarios.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-xl shadow-amber-500/30 transition-all flex items-center space-x-2 cursor-pointer">
                  <span>Evaluación de Caso Confidencial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a href="tel:+13146185666" className="px-5 py-3.5 bg-[#0F274E] hover:bg-[#16386E] text-white font-semibold text-xs sm:text-sm rounded-lg border border-blue-700/60 transition-all flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Llamar: +1 (314) 618-5666</span>
                </a>
              </div>

              {/* Métricas con fondo azul noche */}
              <div className="pt-4 mt-2 border-t border-blue-900/60 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="border-l-2 border-amber-400 pl-3">
                  <div className="font-serif text-2xl font-bold text-amber-400">50</div>
                  <div className="text-[11px] text-slate-300">Estados con Práctica</div>
                </div>
                <div className="border-l-2 border-emerald-400 pl-3">
                  <div className="font-serif text-2xl font-bold text-emerald-400">Federal</div>
                  <div className="text-[11px] text-slate-300">Litigio EOIR & BIA</div>
                </div>
                <div className="border-l-2 border-amber-400 pl-3">
                  <div className="font-serif text-2xl font-bold text-amber-400">Bilingüe</div>
                  <div className="text-[11px] text-slate-300">Atención 100% Español</div>
                </div>
                <div className="border-l-2 border-emerald-400 pl-3">
                  <div className="font-serif text-2xl font-bold text-emerald-400">USCIS</div>
                  <div className="text-[11px] text-slate-300">Trámites y Ajustes</div>
                </div>
              </div>
            </div>

            {/* Tarjeta de Consulta Directa */}
            <div className="lg:col-span-5">
              <div className="bg-[#0F274E]/90 backdrop-blur-xl border border-blue-800/80 rounded-2xl p-6 shadow-2xl relative">
                <div className="flex items-center justify-between pb-3 border-b border-blue-800/60 mb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">Consulta Confidencial Inmediata</h3>
                    <p className="text-xs text-amber-400 font-medium">Respuesta prioritaria en menos de 2 horas</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#081426] border border-amber-400/40 flex items-center justify-center text-amber-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">Nombre Completo</label>
                    <input type="text" placeholder="Ej. Mario González" className="w-full px-3 py-2 bg-[#081426] border border-blue-800/80 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">Teléfono Móvil</label>
                    <input type="text" placeholder="(314) 000-0000" className="w-full px-3 py-2 bg-[#081426] border border-blue-800/80 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">Materia Jurídica</label>
                    <select className="w-full px-3 py-2 bg-[#081426] border border-blue-800/80 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400" disabled>
                      <option>Inmigración / Asilo / Residencia</option>
                      <option>Derecho Laboral / Salarios No Pagados</option>
                      <option>Fianzas Migratorias</option>
                    </select>
                  </div>
                  <button className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg hover:from-amber-300 hover:to-yellow-400 transition-all flex items-center justify-center space-x-2 mt-2 cursor-pointer">
                    <span>Solicitar Asesoría</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. ACREDITACIONES: Fondo Azul Noche Medio */}
      <section className="bg-[#050D1A] border-b border-blue-900/40 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <span className="text-amber-400 font-bold text-[11px] uppercase tracking-widest flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Acreditaciones Federales</span>
            </span>
            <h4 className="text-white font-serif text-sm font-bold">Respaldo y Colegiaturas Oficiales</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto text-xs">
            <div className="bg-[#0B1E3D] border border-blue-800/60 rounded-lg px-3 py-1.5 flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">BBB</span>
              <span className="text-white font-medium">A+ Rating</span>
            </div>
            <div className="bg-[#0B1E3D] border border-blue-800/60 rounded-lg px-3 py-1.5 flex items-center space-x-2">
              <span className="text-amber-400 font-bold">Avvo 10.0</span>
              <span className="text-white font-medium">Superb</span>
            </div>
            <div className="bg-[#0B1E3D] border border-blue-800/60 rounded-lg px-3 py-1.5 flex items-center space-x-2">
              <span className="text-amber-400 font-bold">4.9 ★</span>
              <span className="text-white font-medium">Google Reviews</span>
            </div>
            <div className="bg-[#0B1E3D] border border-blue-800/60 rounded-lg px-3 py-1.5 flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">AILA</span>
              <span className="text-white font-medium">Miembro Activo</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECCIÓN ALTERNANTE: Áreas de Práctica con Fondo Hielo Suave (#F0F4F8) para descanso visual */}
      <section className="py-14 bg-[#F0F4F8] text-[#0A192F] border-b border-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold uppercase tracking-wider">
              Áreas de Práctica
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#0B1E3D]">
              Inmigración, Defensa Laboral y <span className="text-amber-600">Fianzas</span>
            </h2>
            <p className="text-slate-600 text-sm">
              Servicios jurídicos especializados con asesoría estratégica personalizada para su caso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-blue-900/10 hover:border-amber-500 rounded-xl p-6 shadow-md transition-all hover:shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#0B1E3D] mb-1">Inmigración & Asilo</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Peticiones familiares I-130, Asilo afirmativo y defensivo, perdón I-601A y defensa contra deportación.
              </p>
              <span className="text-xs font-bold text-blue-900 group-hover:text-amber-600 flex items-center space-x-1">
                <span>Explorar Materias</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="bg-white border-2 border-blue-900/10 hover:border-emerald-600 rounded-xl p-6 shadow-md transition-all hover:shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-emerald-900 text-emerald-300 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#0B1E3D] mb-1">Derecho Laboral</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Despidos injustificados, salarios no pagados, horas extras, discriminación y represalias laborales.
              </p>
              <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
                <span>Ver Derechos Laborales</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="bg-white border-2 border-blue-900/10 hover:border-amber-500 rounded-xl p-6 shadow-md transition-all hover:shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#0B1E3D] mb-1">Fianzas Migratorias</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Orientación sobre fianzas de liberación I-352 y recuperación de fondos I-391 ante ICE.
              </p>
              <span className="text-xs font-bold text-amber-600 flex items-center space-x-1">
                <span>Solicitar Orientación</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECCIÓN AZUL PROFUNDO: Testimonios Reales */}
      <section className="py-14 bg-gradient-to-b from-[#081426] to-[#0B1E3D] text-white border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Casos Reales con Aprobación
            </span>
            <h2 className="font-serif text-3xl font-bold text-white">
              Familias que Hoy Viven con <span className="text-amber-400">Tranquilidad Legal</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="bg-[#0F274E] border border-blue-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-amber-400/60 transition-all">
                {t.image && (
                  <div className="relative h-52 overflow-hidden bg-slate-900">
                    <img src={t.image} alt={t.client} className="w-full h-full object-cover object-center" />
                    <div className="absolute top-3 left-3 bg-[#0B1E3D]/90 backdrop-blur-md text-emerald-400 font-bold text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/40 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Aprobación USCIS</span>
                    </div>
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <div className="flex text-amber-400 space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-200 italic font-light leading-relaxed">
                    "{t.quoteEs}"
                  </p>
                  <div className="pt-3 border-t border-blue-900/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{t.client}</div>
                      <div className="text-[11px] text-amber-400">{t.service}</div>
                    </div>
                    <span className="text-emerald-400 text-[10px] font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      Verificado
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FOOTER CORPORATIVO PREMIUM */}
      <footer className="bg-[#050D1A] py-10 px-4 sm:px-8 border-t border-blue-900/60 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-white font-serif font-bold text-base">Valenzuela & Sterling Immigration Law Group</span>
          </div>
          <div>
            1200 Brickell Avenue, Suite 1800, Miami, FL 33131 • Tel: <strong className="text-amber-400">+1 (314) 618-5666</strong>
          </div>
        </div>
      </footer>

    </div>
  );
}

