import React, { useState } from 'react';
import { ATTORNEYS } from '../data/demoData';
import { Award, Scale, BookOpen, Globe2, X, Phone, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export default function AttorneyTeam({ lang, onOpenEvaluator }) {
  const [selectedAttorney, setSelectedAttorney] = useState(null);

  return (
    <section id="abogados" className="py-20 bg-[#081426] text-white relative scroll-mt-28 border-b border-blue-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1E3D] border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'es' ? 'Cuerpo Jurídico de Litigio' : 'Legal Advocacy Team'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                Nuestros <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Abogados de Inmigración</span>
              </>
            ) : (
              <>
                Our Senior <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Immigration Attorneys</span>
              </>
            )}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
            {lang === 'es' 
              ? 'Cuerpo legal titular y especialistas de nuestra firma. Abogados licenciados con presencia en cortes federales, defensa laboral y riguroso apego ético.'
              : 'Principal legal counsel and specialists of our firm. Licensed attorneys practicing before federal immigration courts, labor defense, and strict ethical standards.'
            }
          </p>

          <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-300 bg-[#0B1E3D] border border-emerald-500/30 px-3.5 py-1 rounded-full">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>
              {lang === 'es'
                ? 'Perfiles profesionales verificados — Atención confidencial en Español e Inglés'
                : 'Verified attorney profiles — Confidential counsel in English and Spanish'
              }
            </span>
          </div>
        </div>

        {/* Grid de Abogados del Bufete */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {ATTORNEYS.map((attorney) => (
            <div
              key={attorney.id}
              className="bg-[#0B1E3D] border border-blue-800/60 hover:border-amber-400/60 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Retrato Profesional Oficial */}
              <div className="relative pt-8 pb-5 px-6 bg-gradient-to-b from-[#050D1A] via-[#081426] to-[#0B1E3D] flex flex-col items-center justify-center border-b border-blue-900/60">
                {/* Badge de idioma */}
                <div className="absolute top-3 right-3 bg-[#081426]/95 backdrop-blur-md border border-blue-800 text-amber-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                  <Globe2 className="w-3 h-3 text-amber-400" />
                  <span>{attorney.languages}</span>
                </div>

                {/* Retrato Circular Proporcional y Uniforme */}
                {attorney.image ? (
                  <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-amber-400/70 ring-4 ring-amber-400/10 shadow-2xl bg-[#081426] relative flex items-center justify-center group-hover:border-amber-300 transition-colors duration-300">
                    <img
                      src={attorney.image}
                      alt={attorney.name}
                      width={160}
                      height={160}
                      loading="eager"
                      decoding="sync"
                      fetchPriority="high"
                      onError={(e) => {
                        if (attorney.originalFile && !e.currentTarget.dataset.fallback) {
                          e.currentTarget.dataset.fallback = '1';
                          e.currentTarget.src = attorney.originalFile;
                        }
                      }}
                      className="w-full h-full object-cover object-center block"
                    />
                  </div>
                ) : (
                  <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-xl bg-gradient-to-br from-[#081426] via-[#0B1E3D] to-[#0F274E] relative flex flex-col items-center justify-center group-hover:scale-105 group-hover:border-amber-400 transition-all duration-500">
                    <Scale className="w-6 h-6 text-amber-400 mb-1 opacity-90" />
                    <span className="font-serif text-2xl font-bold tracking-wider text-amber-300">
                      {attorney.initials || 'VS'}
                    </span>
                    <span className="text-[8px] uppercase tracking-widest font-semibold text-emerald-400 mt-0.5">
                      {lang === 'es' ? 'Bufete USA' : 'Law Firm'}
                    </span>
                  </div>
                )}

                {/* Etiqueta de Perfil Verificado */}
                <div className="mt-3.5 inline-flex items-center space-x-1 text-[10px] text-amber-300 font-semibold uppercase tracking-wider bg-[#081426] px-3 py-0.5 rounded-full border border-amber-400/30 shadow-sm">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span>{lang === 'es' ? 'Miembro del Equipo Legal' : 'Verified Legal Counsel'}</span>
                </div>
              </div>

              {/* Contenido / Biografía */}
              <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {attorney.name}
                  </h3>
                  <div className="text-xs text-amber-400 font-medium mt-0.5">
                    {lang === 'es' ? attorney.roleEs : attorney.roleEn}
                  </div>
                  
                  <div className="text-[11px] text-slate-300 mt-2 flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{attorney.admissions}</span>
                  </div>

                  {attorney.pendingNoteEs && (
                    <div className="text-[11px] text-amber-300 bg-[#081426] border border-amber-400/30 rounded-lg p-2 mt-2.5 flex items-start space-x-1.5 leading-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                      <span>{lang === 'es' ? attorney.pendingNoteEs : attorney.pendingNoteEn}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed font-light">
                    {lang === 'es' ? attorney.bioEs : attorney.bioEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-blue-900/60 mt-4">
                  <button
                    onClick={() => setSelectedAttorney(attorney)}
                    className="w-full py-2.5 bg-[#081426] hover:bg-emerald-600 hover:text-white text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-1.5 border border-blue-800/80"
                  >
                    <span>{lang === 'es' ? 'Ver Perfil y Credenciales' : 'View Full Profile'}</span>
                    <ArrowRight className="w-3 h-3 text-amber-400" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Garantía Institucional y Representación Colegiada */}
        <div className="text-center text-xs text-slate-300 max-w-2xl mx-auto border border-blue-900/60 p-3.5 rounded-xl bg-[#050D1A] shadow-md flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            {lang === 'es' 
              ? 'Equipo legal multidisciplinario con representación en procesos migratorios federales y defensa laboral en Estados Unidos.' 
              : 'Multidisciplinary legal team with representation in U.S. federal immigration and labor rights advocacy.'}
          </span>
        </div>

      </div>

      {/* MODAL DETALLADO DE ABOGADO EN ESTILO AZUL CORPORATIVO */}
      {selectedAttorney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0B1E3D] border border-blue-700/80 rounded-2xl max-w-3xl w-full p-6 sm:p-8 relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-white">
            
            <button
              onClick={() => setSelectedAttorney(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div className="sm:col-span-1 rounded-xl p-4 bg-[#081426] flex flex-col items-center justify-center border border-blue-800/80">
                {selectedAttorney.image ? (
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-amber-400/70 ring-4 ring-amber-400/10 shadow-xl bg-[#081426]">
                    <img
                      src={selectedAttorney.image}
                      alt={selectedAttorney.name}
                      width={176}
                      height={176}
                      loading="eager"
                      decoding="sync"
                      onError={(e) => {
                        if (selectedAttorney.originalFile && !e.currentTarget.dataset.fallback) {
                          e.currentTarget.dataset.fallback = '1';
                          e.currentTarget.src = selectedAttorney.originalFile;
                        }
                      }}
                      className="w-full h-full object-cover object-center block"
                    />
                  </div>
                ) : (
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-xl bg-gradient-to-br from-[#081426] via-[#0B1E3D] to-[#0F274E] flex flex-col items-center justify-center">
                    <Scale className="w-8 h-8 text-amber-400 mb-1 opacity-90" />
                    <span className="font-serif text-3xl font-bold tracking-wider text-amber-300">
                      {selectedAttorney.initials || 'VS'}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest font-semibold text-emerald-400 mt-1">
                      {lang === 'es' ? 'Foto Reservada' : 'Portrait Reserved'}
                    </span>
                  </div>
                )}
                <div className="mt-2.5 inline-flex items-center space-x-1 text-[10px] text-amber-300 font-semibold text-center">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span>{lang === 'es' ? 'Perfil Oficial Verificado' : 'Verified Official Profile'}</span>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <div className="inline-flex items-center space-x-1.5 text-[11px] text-amber-400 font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'es' ? 'Cuerpo Jurídico de la Firma' : 'Firm Legal Counsel'}</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  {selectedAttorney.name}
                </h3>
                <div className="text-sm text-amber-400 font-semibold">
                  {lang === 'es' ? selectedAttorney.roleEs : selectedAttorney.roleEn}
                </div>
                
                {selectedAttorney.pendingNoteEs && (
                  <div className="text-xs text-amber-300 bg-[#081426] border border-amber-400/30 rounded-lg p-2.5 my-2">
                    <strong>{lang === 'es' ? 'Estado de Credenciales:' : 'Credential Status:'}</strong>{' '}
                    {lang === 'es' ? selectedAttorney.pendingNoteEs : selectedAttorney.pendingNoteEn}
                  </div>
                )}

                <div className="text-xs text-slate-300 pt-1">
                  <strong>{lang === 'es' ? 'Admisiones a la Barra:' : 'Bar Admissions:'}</strong> {selectedAttorney.admissions}
                </div>
                <div className="text-xs text-slate-300">
                  <strong>{lang === 'es' ? 'Idiomas:' : 'Languages:'}</strong> {selectedAttorney.languages}
                </div>
                <div className="text-xs text-slate-300">
                  <strong>{lang === 'es' ? 'Experiencia:' : 'Experience:'}</strong> {lang === 'es' ? selectedAttorney.experience : selectedAttorney.experienceEn}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-blue-900/60 text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              <h4 className="font-serif text-base font-bold text-white">
                {lang === 'es' ? 'Trayectoria y Filosofía Legal' : 'Career Background & Legal Philosophy'}
              </h4>
              <p>{lang === 'es' ? selectedAttorney.bioEs : selectedAttorney.bioEn}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-blue-900/60">
              <button
                onClick={() => setSelectedAttorney(null)}
                className="w-full sm:w-auto px-4 py-2 bg-[#081426] text-slate-300 text-xs font-semibold rounded-lg hover:text-white cursor-pointer border border-blue-800"
              >
                {lang === 'es' ? 'Cerrar' : 'Close'}
              </button>

              <button
                onClick={() => {
                  setSelectedAttorney(null);
                  onOpenEvaluator();
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg cursor-pointer border border-amber-300/60"
              >
                {lang === 'es' ? 'Agendar Consulta con este Abogado' : 'Schedule Consultation'}
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
