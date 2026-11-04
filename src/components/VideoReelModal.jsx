import React, { useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Shield, ArrowRight } from 'lucide-react';
import { FIRM_CONFIG } from '../data/demoData';

export default function VideoReelModal({ isOpen, onClose, lang, onOpenEvaluator }) {
  if (!isOpen) return null;

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  const chapters = [
    { titleEs: "1. Trayectoria & Presencia Federal", titleEn: "1. Federal History & Footprint", time: "0:00 - 0:45" },
    { titleEs: "2. Oficinas & Salas de Juicio Simulado", titleEn: "2. Modern Offices & Mock Trial", time: "0:45 - 1:30" },
    { titleEs: "3. Estrategia en Cortes de Inmigración", titleEn: "3. Courtroom Advocacy", time: "1:30 - 2:15" },
    { titleEs: "4. Familias e Inversionistas Protegidos", titleEn: "4. Protecting Clients", time: "2:15 - 3:00" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-charcoal border border-linen-dark rounded-2xl overflow-hidden shadow-elevated flex flex-col max-h-[92vh]">
        
        {/* Barra Superior del Reproductor en Verde Petróleo */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-teal text-white border-b border-teal-deep">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-teal-deep flex items-center justify-center border border-bronze/40">
              <Shield className="w-4 h-4 text-bronze-light" />
            </div>
            <div>
              <h4 className="font-serif text-sm sm:text-base font-bold text-white">
                {lang === 'es' ? 'Presentación Institucional: Valenzuela & Sterling' : 'Corporate Presentation: Valenzuela & Sterling'}
              </h4>
              <p className="text-[11px] text-slate-300">
                {lang === 'es' ? 'Recorrido por Nuestras Sedes y Filosofía de Litigio' : 'Corporate Tour & Immigration Litigation Philosophy'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-teal-deep rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar video"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENEDOR DE VIDEO */}
        <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
          
          {/* Badge Identificador de Espacio para Google Flow */}
          <div className="absolute top-4 left-4 z-20 bg-[#092925]/90 backdrop-blur-md border border-[#B88656]/50 rounded-lg px-3 py-1.5 shadow-lg flex items-center space-x-2 text-white text-xs">
            <span className="w-2 h-2 rounded-full bg-[#B88656] animate-pulse" />
            <span className="font-semibold text-[#B88656]">
              {lang === 'es' ? 'ESPACIO PREPARADO PARA VIDEO DEFINITIVO (GOOGLE FLOW)' : 'SPACE RESERVED FOR FINAL VIDEO (GOOGLE FLOW)'}
            </span>
          </div>

          <video
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-business-people-walking-in-an-office-corridor-4876-large.mp4" type="video/mp4" />
            <source src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-people-working-together-in-an-office-4877-large.mp4" type="video/mp4" />
            Tu navegador no soporta el tag de video.
          </video>

          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-black/30 pointer-events-none" />

          {/* Subtítulo institucional */}
          <div className="absolute bottom-16 inset-x-8 text-center pointer-events-none">
            <span className="inline-block px-4 py-1.5 rounded-lg bg-black/75 text-white text-xs sm:text-sm font-medium tracking-wide border border-white/10 shadow-lg">
              {lang === 'es' 
                ? '«Cada expediente migratorio representa el sueño y la estabilidad de una familia entera. En Valenzuela & Sterling, litigamos con rigor y devoción absoluta.»' 
                : '“Every immigration petition represents a family’s American dream. At Valenzuela & Sterling, we litigate with relentless rigor and devotion.”'
              }
            </span>
          </div>

          {/* Controles flotantes */}
          <div className="absolute bottom-4 inset-x-4 flex items-center justify-between bg-charcoal/90 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 text-bronze-light hover:text-white transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-bronze-light" />}
              </button>

              <span className="text-[11px] text-slate-400 font-mono">01:42 / 03:00</span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-bronze-light font-semibold uppercase tracking-wider">
                {lang === 'es' ? 'Clip Provisional — Listo para Producción con Google Flow' : 'Provisional Clip — Ready for Google Flow'}
              </span>
            </div>
          </div>
        </div>

        {/* Barra Inferior de Capítulos */}
        <div className="p-4 sm:p-5 bg-teal text-white border-t border-teal-deep flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
            {chapters.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => setActiveChapter(idx)}
                className={`p-2 rounded text-left transition-colors cursor-pointer ${
                  activeChapter === idx ? 'bg-teal-deep border border-bronze/60 text-white' : 'bg-teal-dark/50 text-slate-300 hover:text-white'
                }`}
              >
                <div className="text-[11px] font-semibold truncate">{lang === 'es' ? ch.titleEs : ch.titleEn}</div>
                <div className="text-[10px] text-bronze-light">{ch.time}</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenEvaluator();
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-bronze hover:bg-bronze-light text-white font-medium text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>{lang === 'es' ? 'Consultar con un Abogado' : 'Consult with an Attorney'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
