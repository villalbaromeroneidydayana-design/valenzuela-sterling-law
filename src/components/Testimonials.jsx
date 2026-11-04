import React from 'react';
import { TESTIMONIALS } from '../data/demoData';
import { Star, Quote, CheckCircle, MessageSquare } from 'lucide-react';

export default function Testimonials({ lang }) {
  return (
    <section className="py-20 bg-[#0B1E3D] text-white relative overflow-hidden border-b border-blue-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#081426] border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'es' ? 'Voz de Nuestros Clientes' : 'Client Testimonials'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                Familias que Hoy Viven con <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Tranquilidad Legal</span>
              </>
            ) : (
              <>
                Families Now Living with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Lawful Security</span>
              </>
            )}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
            {lang === 'es' 
              ? 'Conozca las experiencias de personas y familias a quienes hemos acompañado. Espacios preparados para testimonios definitivos con autorización formal de publicación.'
              : 'Client journeys and case experiences. Reserved spaces for definitive client stories and signed photo releases.'
            }
          </p>

          <div className="inline-flex items-center space-x-1.5 text-[11px] text-slate-300 bg-[#081426] border border-blue-900 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>
              {lang === 'es'
                ? 'Casos ilustrativos representativos — En proceso de recepción de fotografías autorizadas definitivas.'
                : 'Illustrative representative cases — Awaiting final signed photo release forms.'
              }
            </span>
          </div>
        </div>

        {/* Grid de 3 Testimonios Destacados en Azul Corporativo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-[#081426] border border-blue-800/60 hover:border-amber-400/50 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between relative group transition-all duration-300 hover:shadow-2xl hover:bg-[#0F274E]"
            >
              {/* Fotografía Enmarcada del Testimonio / Caso Aprobado */}
              {t.image && (
                <div className="relative h-56 sm:h-60 overflow-hidden bg-[#050D1A] border-b border-blue-900/60">
                  <img
                    src={t.image}
                    alt={`Testimonio de ${t.client}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#081426]/90 via-transparent to-transparent" />
                  
                  {/* Badge de Aprobación Oficial */}
                  <div className="absolute top-3 left-3 bg-[#081426]/90 backdrop-blur-md text-emerald-400 font-semibold text-[10px] sm:text-xs px-2.5 py-1 rounded-full border border-emerald-500/40 shadow-sm flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{lang === 'es' ? 'Caso Aprobado USCIS' : 'USCIS Approved'}</span>
                  </div>

                  {/* Badge de Foto Provisional en Espera de Autorización */}
                  <div className="absolute bottom-3 left-3 bg-[#050D1A]/90 backdrop-blur-md text-slate-200 text-[10px] px-2.5 py-1 rounded-md border border-white/20">
                    {lang === 'es' ? 'Foto Ilustrativa — En autorización' : 'Illustrative Photo — In Release'}
                  </div>

                  {/* Icono de Cita superpuesto */}
                  <div className="absolute bottom-3 right-3 bg-[#081426]/80 backdrop-blur-sm p-1.5 rounded-full text-amber-400">
                    <Quote className="w-4 h-4" />
                  </div>
                </div>
              )}

              <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Estrellas en Oro/Amarillo */}
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed font-light">
                    "{lang === 'es' ? t.quoteEs : t.quoteEn}"
                  </p>

                  {t.releaseNoteEs && (
                    <div className="text-[10px] text-slate-300 bg-[#0B1E3D] px-2 py-1 rounded border border-blue-900 mt-3">
                      {lang === 'es' ? t.releaseNoteEs : t.releaseNoteEn}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-blue-900/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-base font-bold text-white">
                      {t.client}
                    </h4>
                    <div className="text-[11px] text-slate-300">
                      {t.city} • <span className="text-amber-400 font-medium">{t.service}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold bg-[#0B1E3D] px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>{t.platform}</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
