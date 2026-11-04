import React from 'react';
import { OFFICES } from '../data/demoData';
import { MapPin, Phone, Clock, ArrowUpRight, Building2 } from 'lucide-react';

export default function OfficeLocations({ lang, onOpenEvaluator }) {
  return (
    <section id="sedes" className="py-20 bg-[#07152B] text-white relative scroll-mt-28 border-b border-blue-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1E3D] border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'es' ? 'Infraestructura Corporativa' : 'Corporate Footprint'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                Nuestras Sedes en los <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Distritos Financieros de EE. UU.</span>
              </>
            ) : (
              <>
                Our Offices in Leading <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">U.S. Business Districts</span>
              </>
            )}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
            {lang === 'es' 
              ? 'Espacios para atención corporativa y salas de conferencias. Atendemos consultas presenciales mediante previa cita y procesos remotos con validez federal en los 50 estados de la Unión Americana.'
              : 'Corporate conference facilities and executive meeting suites. Offering in-person consultations by prior appointment and remote federal representation across all 50 states.'
            }
          </p>

          <div className="inline-flex items-center space-x-1.5 text-[11px] text-slate-300 bg-[#050D1A] border border-blue-900 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>
              {lang === 'es'
                ? 'Direcciones sujetas a confirmación final de registro de arrendamiento. Atención presencial sujeta a previa cita confirmada.'
                : 'Corporate locations subject to final lease registration. In-person service strictly by confirmed appointment.'
              }
            </span>
          </div>
        </div>

        {/* Grid de 4 Sedes en Azul Corporativo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {OFFICES.map((office, idx) => (
            <div
              key={idx}
              className="bg-[#0B1E3D] border border-blue-800/60 hover:border-amber-400/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:bg-[#0F274E]"
            >
              {/* Foto de la sede / distrito */}
              <div className="relative h-44 overflow-hidden bg-[#050D1A]">
                <img
                  src={office.image}
                  alt={office.city}
                  width="800"
                  height="500"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E3D]/90 via-transparent to-transparent" />
                
                {office.isHQ && (
                  <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded shadow-sm">
                    {lang === 'es' ? 'Sede Principal' : 'Headquarters'}
                  </div>
                )}
              </div>

              {/* Contenido de la sede */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-300">
                      {lang === 'es' ? office.city : office.cityEn}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {office.address}
                  </p>

                  {office.verificationNoteEs && (
                    <div className="text-[10px] text-amber-300 bg-[#081426] px-2 py-1 rounded border border-amber-400/30 leading-tight">
                      {lang === 'es' ? office.verificationNoteEs : office.verificationNoteEn}
                    </div>
                  )}

                  <div className="pt-2 space-y-1.5 text-[11px] text-slate-300">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <a href={`tel:${office.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-amber-300 font-semibold text-white">
                        {office.phone}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'es' ? office.hours : office.hoursEn}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-900/60 mt-3">
                  <button
                    onClick={onOpenEvaluator}
                    className="w-full py-2 bg-[#081426] hover:bg-emerald-600 hover:text-white text-xs font-semibold text-slate-200 rounded-lg border border-blue-800/80 transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <span>{lang === 'es' ? 'Solicitar Cita en esta Sede' : 'Request Appointment'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
