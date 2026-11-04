import React, { useState } from 'react';
import { 
  Play, Building2, BookOpen, Users, Landmark, 
  Sparkles, CheckCircle2, Volume2, ShieldCheck 
} from 'lucide-react';
import { FIRM_CONFIG } from '../data/demoData';

export default function VideoShowcase({ lang, onOpenVideoModal }) {
  const [activeTab, setActiveTab] = useState('offices');

  const scenes = {
    offices: {
      titleEs: "Salas de Juntas & Oficinas en Brickell (Miami)",
      titleEn: "Executive Boardrooms & Brickell Headquarters (Miami)",
      descEs: "Espacios corporativos de alto nivel diseñados para garantizar máxima confidencialidad, tecnología de videoconferencia con cortes federales y comodidad para las familias.",
      descEn: "High-tier corporate spaces designed for absolute client confidentiality, federal court video conferencing, and comfort for visiting families.",
      image: "/images/showcase/boardroom.webp",
      tagEs: "Infraestructura Corporativa",
      tagEn: "Corporate Infrastructure"
    },
    meetings: {
      titleEs: "Estrategia Legal & Litigio en Equipo",
      titleEn: "Legal Strategy & Team Case Review",
      descEs: "Nuestros abogados de litigio analizan cada expediente de forma colegiada, simulando audiencias ante cortes de inmigración y preparando testimonios periciales.",
      descEn: "Our litigation team conducts collaborative case reviews, simulating EOIR court hearings and orchestrating expert testimony for trial.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      tagEs: "Simulacros de Audiencia",
      tagEn: "Courtroom Simulation"
    },
    library: {
      titleEs: "Biblioteca Jurídica & Precedentes Federales",
      titleEn: "Legal Library & Federal Case Law Research",
      descEs: "Acceso a las bases de datos de jurisprudencia migratoria más exhaustivas de EE. UU., precedentes de la BIA y decisiones de los 13 Circuitos de Apelación.",
      descEn: "Exhaustive immigration legal library, tracking precedent decisions from the Board of Immigration Appeals (BIA) and all 13 Federal Circuit Courts.",
      image: "/images/showcase/library.webp",
      tagEs: "Rigor Jurisprudencial",
      tagEn: "Federal Precedents"
    },
    skyline: {
      titleEs: "Presencia Federal en las Principales Ciudades",
      titleEn: "Federal Footprint in Key U.S. Metros",
      descEs: "Sedes físicas estratégicas en los centros neurálgicos de inmigración: Miami, Orlando, Houston y Nueva York, con capacidad de litigar en todo el territorio nacional.",
      descEn: "Strategic physical offices in key hubs: Miami, Orlando, Houston, and New York, with full federal authority to represent clients across all 50 states.",
      image: "/images/showcase/skyline.webp",
      tagEs: "Alcance Nacional",
      tagEn: "Nationwide Reach"
    }
  };

  const tabs = [
    { id: 'offices', icon: Building2, labelEs: "Sedes & Salas de Juntas", labelEn: "Offices & Boardrooms" },
    { id: 'meetings', icon: Users, labelEs: "Equipo en Reunión", labelEn: "Attorney Strategy" },
    { id: 'library', icon: BookOpen, labelEs: "Biblioteca Jurídica", labelEn: "Legal Research" },
    { id: 'skyline', icon: Landmark, labelEs: "Distritos Financieros", labelEn: "Federal Footprint" }
  ];

  const currentScene = scenes[activeTab];

  return (
    <section id="video-showcase" className="py-20 bg-[#07152B] text-white relative overflow-hidden border-b border-blue-900/60 scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Cabecera de Sección */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1E3D] border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'es' ? 'Presentación Audiovisual' : 'Institutional Video'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                Instalaciones Corporativas de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Primer Nivel</span>
              </>
            ) : (
              <>
                Premier Corporate <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Facilities & Practice</span>
              </>
            )}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
            {lang === 'es' 
              ? 'Conozca nuestras oficinas en los distritos financieros de Miami, Houston y Nueva York. Salas de juntas equipadas para litigio federal y un equipo volcado en la victoria de su caso.'
              : 'Tour our corporate suites in Miami, Houston, and New York. Purpose-built facilities for federal hearings and a dedicated legal staff committed to your case.'
            }
          </p>

          {/* Navegación por Pestañas de Escenas */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-md'
                      : 'bg-[#0B1E3D] text-slate-300 hover:text-white border border-blue-800/80 hover:bg-[#0F274E]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span>{lang === 'es' ? t.labelEs : t.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* REPRODUCTOR VISUAL PRINCIPAL */}
        <div className="relative rounded-2xl overflow-hidden border border-blue-800/80 shadow-2xl group bg-[#050D1A]">
          <div className="relative h-[380px] sm:h-[480px] lg:h-[520px] w-full overflow-hidden">
            <img
              src={currentScene.image}
              alt={currentScene.titleEs}
              width="1000"
              height="600"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-1000"
            />
            {/* Gradientes cinematográficos */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050D1A]/95 via-[#050D1A]/40 to-transparent pointer-events-none" />

            {/* Botón Central de Play */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={onOpenVideoModal}
                className="relative flex items-center justify-center w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-2xl group cursor-pointer transition-all duration-300 hover:scale-105 border-2 border-amber-300/80"
                aria-label="Reproducir video institucional"
              >
                <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-25" />
                <Play className="w-8 h-8 fill-slate-950 ml-1 text-slate-950" />
              </button>
            </div>

            {/* Badge de Escena */}
            <div className="absolute top-5 left-5">
              <span className="px-3.5 py-1.5 rounded-md bg-[#081426]/90 backdrop-blur-md text-amber-300 text-xs font-semibold tracking-wider uppercase border border-blue-800 shadow-md">
                {lang === 'es' ? currentScene.tagEs : currentScene.tagEn}
              </span>
            </div>

            {/* Badge de Calidad */}
            <div className="absolute top-5 right-5 flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-white font-mono text-[10px] font-bold border border-white/20">
                4K UHD
              </span>
            </div>

            {/* Barra Inferior con Título */}
            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 bg-gradient-to-t from-[#050D1A] via-[#050D1A]/85 to-transparent text-left">
              <div className="max-w-3xl space-y-1.5">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  {lang === 'es' ? currentScene.titleEs : currentScene.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                  {lang === 'es' ? currentScene.descEs : currentScene.descEn}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
