import React, { useState, useEffect } from 'react';
import { 
  Phone, Shield, MapPin, ChevronDown, 
  Menu, X, FileCheck, ArrowRight, Lock 
} from 'lucide-react';
import { FIRM_CONFIG, OFFICES } from '../data/demoData';
import { analytics } from '../services/analytics';

export default function Header({ lang, setLang, onOpenEvaluator, onOpenCallRequest, onSelectPractice, onOpenPortal, onOpenAdmin }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [officesDropdownOpen, setOfficesDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      
      {/* 1. TOP UTILITY BAR: Azul Noche Profundo + Acentos en Dorado y Verde */}
      <div className="bg-[#050D1A] text-slate-300 text-xs py-1.5 px-4 sm:px-8 border-b border-blue-900/40 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center space-x-6">
            <a 
              href={`tel:${FIRM_CONFIG.primaryPhoneRaw}`} 
              onClick={() => analytics.trackPhoneClick('header_hotline')}
              className="flex items-center space-x-2 text-white hover:text-amber-400 font-medium transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {lang === 'es' ? 'Urgencias Legales 24/7:' : '24/7 Legal Hotline:'}{' '}
                <strong className="text-white font-bold tracking-wider">{FIRM_CONFIG.primaryPhone}</strong>
              </span>
            </a>

            <button
              onClick={onOpenCallRequest}
              className="hidden lg:flex items-center space-x-1 px-2.5 py-0.5 rounded bg-[#0B1E3D] hover:bg-[#16386E] text-amber-300 border border-amber-400/30 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <span>{lang === 'es' ? 'Solicitar Llamada' : 'Request Callback'}</span>
            </button>

            <div className="hidden lg:flex items-center space-x-2 text-slate-300 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{lang === 'es' ? 'Sedes en Miami • Orlando • Houston • New York' : 'Offices in Miami • Orlando • Houston • New York'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            
            {/* Selector de Sedes Desplegable */}
            <div className="relative">
              <button 
                onClick={() => setOfficesDropdownOpen(!officesDropdownOpen)}
                className="flex items-center space-x-1.5 text-slate-300 hover:text-amber-400 font-medium transition-colors cursor-pointer text-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'es' ? 'Ubicaciones' : 'Offices'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {officesDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-[#0B1E3D] border border-blue-700/60 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseLeave={() => setOfficesDropdownOpen(false)}
                >
                  <div className="px-4 py-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-widest border-b border-blue-900/60">
                    {lang === 'es' ? 'Sedes Físicas en EE. UU.' : 'U.S. Corporate Locations'}
                  </div>
                  {OFFICES.map((off, idx) => (
                    <a 
                      key={idx} 
                      href="#sedes"
                      onClick={() => setOfficesDropdownOpen(false)}
                      className="block px-4 py-2 text-xs text-white hover:bg-[#16386E] transition-colors"
                    >
                      <div className="font-semibold text-white">{lang === 'es' ? off.city : off.cityEn}</div>
                      <div className="text-[11px] text-slate-300 truncate">{off.address}</div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Portal del Cliente (Mi Expediente) */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (onOpenPortal) onOpenPortal();
              }}
              className="text-slate-300 hover:text-amber-400 flex items-center space-x-1.5 transition-colors text-xs font-medium cursor-pointer"
              title={lang === 'es' ? 'Consultar mi expediente seguro' : 'Access my secure client case portal'}
            >
              <FileCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'es' ? 'Portal del Cliente' : 'Client Portal'}</span>
            </button>

            {/* Acceso Personal de la Firma (Discreto) */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (onOpenAdmin) onOpenAdmin();
              }}
              className="text-slate-400 hover:text-amber-400 flex items-center space-x-1 transition-colors text-[11px] font-medium cursor-pointer"
              title={lang === 'es' ? 'Acceso administrativo del personal' : 'Staff backoffice access'}
            >
              <Lock className="w-3 h-3 text-slate-400 hover:text-amber-400" />
              <span className="hidden xl:inline">{lang === 'es' ? 'Personal' : 'Staff'}</span>
            </button>

            {/* Selector Bilingüe ES / EN */}
            <div className="flex items-center bg-[#07152B] border border-blue-900/60 rounded-md p-0.5">
              <button
                onClick={() => setLang('es')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  lang === 'es' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  lang === 'en' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. BARRA DE NAVEGACIÓN PRINCIPAL: Azul Corporativo #0B1E3D + Detalles Dorado y Verde */}
      <nav className={`w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0B1E3D]/95 backdrop-blur-md shadow-xl py-2 sm:py-2.5 border-b border-blue-800/80' 
          : 'bg-[#0B1E3D] py-2.5 sm:py-3 border-b border-blue-900/60'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-8 flex items-center justify-between gap-2 lg:gap-4">
          
          {/* Logotipo Institucional Premium */}
          <a href="#hero" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0 sm:mr-3 xl:mr-6">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 border border-amber-300/40 text-slate-950">
              <Shield className="w-5 h-5 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-serif text-base sm:text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  VALENZUELA
                </span>
                <span className="text-amber-400 font-serif text-sm italic">&</span>
                <span className="font-serif text-base sm:text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  STERLING
                </span>
              </div>
              <div className="text-[8px] sm:text-[9px] tracking-[0.22em] uppercase font-semibold text-emerald-400 flex items-center space-x-1.5">
                <span>•</span>
                <span>{lang === 'es' ? 'ABOGADOS DE INMIGRACIÓN USA' : 'U.S. IMMIGRATION ATTORNEYS'}</span>
              </div>
            </div>
          </a>

          {/* Enlaces de Navegación de Escritorio — Modelo Simplificado de 5 Pilares */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-6 2xl:space-x-8 text-xs xl:text-sm font-medium text-slate-200">
            
            {/* 1. Servicios Migratorios */}
            <a 
              href="#servicios" 
              className="hover:text-amber-400 text-white transition-colors py-1 flex items-center space-x-1"
            >
              <span>{lang === 'es' ? 'Servicios' : 'Practice Areas'}</span>
            </a>

            {/* 1-B. Fianzas Migratorias */}
            <a 
              href="#fianzas" 
              className="hover:text-amber-400 text-white transition-colors py-1 flex items-center space-x-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{lang === 'es' ? 'Fianzas' : 'Bonds'}</span>
            </a>

            {/* 2. Abogados y La Firma */}
            <a 
              href="#abogados" 
              className="hover:text-amber-400 transition-colors py-1"
            >
              <span>{lang === 'es' ? 'Abogados & Firma' : 'Attorneys & Firm'}</span>
            </a>

            {/* 3. Testimonios y Resultados */}
            <a 
              href="#testimonios" 
              className="hover:text-amber-400 transition-colors py-1"
            >
              <span>{lang === 'es' ? 'Testimonios' : 'Testimonials'}</span>
            </a>

            {/* 4. Guías Jurídicas y Blog */}
            <a 
              href="#blog" 
              className="hover:text-amber-400 transition-colors py-1"
            >
              <span>{lang === 'es' ? 'Guías & Noticias' : 'Guides & News'}</span>
            </a>

            {/* 5. Sedes Corporativas y Contacto */}
            <a 
              href="#sedes" 
              className="hover:text-amber-400 transition-colors py-1"
            >
              <span>{lang === 'es' ? 'Sedes & Contacto' : 'Offices & Contact'}</span>
            </a>

          </div>

          {/* CTA Principal de Conversión en Amarillo Dorado Vibrante */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={onOpenEvaluator}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-200 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 rounded-lg shadow-lg shadow-amber-500/20 cursor-pointer border border-amber-300/60 active:scale-95"
            >
              <span>{lang === 'es' ? 'Evaluar Mi Caso' : 'Evaluate My Case'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>

          {/* Botón de Menú Móvil */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="text-xs font-bold px-2 py-1 bg-[#050D1A] border border-blue-800 text-amber-400 rounded"
            >
              {lang === 'es' ? 'EN' : 'ES'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-[#16386E] rounded-lg transition-colors cursor-pointer"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* 3. MENÚ OFFCANVAS MÓVIL SIMPLIFICADO — 5 PILARES ACCESIBLES */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0D3B36] border-b border-white/10 px-6 py-6 space-y-6 shadow-2xl animate-in slide-in-from-top-3 duration-200">
            <div className="flex flex-col space-y-3.5 text-base font-medium text-slate-100">
              
              <a 
                href="#servicios" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-2 border-b border-white/10 flex items-center justify-between hover:text-[#B88656] text-[#B88656] font-semibold"
              >
                <span>{lang === 'es' ? '1. Servicios Migratorios (12 Áreas)' : '1. Practice Areas (12 Areas)'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a 
                href="#fianzas" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-2 border-b border-white/10 flex items-center justify-between hover:text-[#B88656]"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{lang === 'es' ? '2. Fianzas Migratorias & Fondos' : '2. Immigration Bonds & Recovery'}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>

              <a 
                href="#abogados" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-2 border-b border-white/10 flex items-center justify-between hover:text-[#B88656]"
              >
                <span>{lang === 'es' ? '3. Nuestros Abogados y La Firma' : '3. Attorneys & The Firm'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>

              <a 
                href="#testimonios" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-2 border-b border-white/10 flex items-center justify-between hover:text-[#B88656]"
              >
                <span>{lang === 'es' ? '4. Testimonios y Casos de Éxito' : '4. Testimonials & Results'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>

              <a 
                href="#blog" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-2 border-b border-white/10 flex items-center justify-between hover:text-[#B88656]"
              >
                <span>{lang === 'es' ? '5. Guías Legales y Noticias' : '5. Legal Guides & News'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>

              <a 
                href="#sedes" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-2 border-b border-white/10 flex items-center justify-between hover:text-[#B88656]"
              >
                <span>{lang === 'es' ? '6. Sedes Corporativas y Contacto' : '6. Office Locations & Contact'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>

              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenPortal) onOpenPortal();
                }} 
                className="w-full text-left py-2 border-b border-white/10 flex items-center justify-between text-amber-300 font-medium cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'es' ? 'Portal del Cliente — Mi Expediente' : 'Client Portal — My Case'}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

            </div>

            {/* Acciones Táctiles Primarias en Móvil */}
            <div className="pt-2 space-y-3">
              <a
                href={`tel:${FIRM_CONFIG.primaryPhoneRaw}`}
                onClick={() => analytics.trackPhoneClick('mobile_menu')}
                className="flex items-center justify-center space-x-2 w-full py-3.5 bg-[#092925] text-white rounded-xl font-bold text-sm border border-[#B88656]/30 active:scale-95 transition-transform"
              >
                <Phone className="w-4 h-4 text-[#B88656]" />
                <span>{lang === 'es' ? `Llamar 24/7: ${FIRM_CONFIG.primaryPhone}` : `Call 24/7: ${FIRM_CONFIG.primaryPhone}`}</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenEvaluator();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#A67C52] to-[#B88656] text-white rounded-xl font-bold uppercase tracking-wider text-sm shadow-xl active:scale-95 transition-transform cursor-pointer border border-[#B88656]/50 flex items-center justify-center space-x-2"
              >
                <span>{lang === 'es' ? 'Evaluar Mi Caso Gratis' : 'Free Case Evaluation'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </nav>
    </header>
  );
}
