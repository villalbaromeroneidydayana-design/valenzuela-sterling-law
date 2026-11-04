import React, { useState } from 'react';
import { 
  Shield, DollarSign, FileCheck, ArrowRight, Phone, CheckCircle2, 
  AlertCircle, HelpCircle, Clock, FileText, ChevronRight, Scale
} from 'lucide-react';
import { FIRM_CONFIG } from '../data/demoData';

export default function ImmigrationBonds({ lang = 'es', onOpenCallRequest, onOpenEvaluator }) {
  const [activeTab, setActiveTab] = useState('orientacion');

  const tabs = [
    {
      id: 'orientacion',
      titleEs: 'Orientación de Fianzas',
      titleEn: 'Immigration Bond Guidance',
      icon: Scale
    },
    {
      id: 'recuperacion',
      titleEs: 'Recuperación de Fondos',
      titleEn: 'Bond Fund Recovery',
      icon: DollarSign
    },
    {
      id: 'requisitos',
      titleEs: 'Requisitos & Documentos',
      titleEn: 'Requirements & Documents',
      icon: FileCheck
    },
    {
      id: 'pasos',
      titleEs: 'Pasos a Seguir',
      titleEn: 'Step-by-Step Process',
      icon: Clock
    }
  ];

  return (
    <section id="fianzas" className="py-16 sm:py-20 bg-gradient-to-b from-[#061224] via-[#0B1E3D] to-[#061224] text-white relative scroll-mt-28 border-b border-blue-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        
        {/* Cabecera de la Sección */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#0B1E3D] border border-amber-400/50 text-amber-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'es' ? 'Servicio Jurídico Especializado' : 'Specialized Legal Service'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-normal leading-tight">
            {lang === 'es' ? (
              <>
                Fianzas Migratorias & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Recuperación de Fondos</span>
              </>
            ) : (
              <>
                Immigration Bonds & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Fund Recovery</span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light">
            {lang === 'es'
              ? 'Orientación legal rigurosa para la fijación de fianzas de liberación ante ICE o el Juez de Inmigración, y gestión para la devolución formal de dineros consignados una vez concluido su proceso.'
              : 'Dedicated legal counsel for bond hearings before ICE or immigration courts, alongside administrative representation to recover deposited bond funds upon case resolution.'}
          </p>
        </div>

        {/* Selector de Pestañas Interactivas */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1.5 bg-[#050D1A] backdrop-blur-md rounded-2xl border border-blue-900/60 max-w-4xl mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-[#0B1E3D]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-400'}`} />
                <span>{lang === 'es' ? tab.titleEs : tab.titleEn}</span>
              </button>
            );
          })}
        </div>

        {/* Contenido Dinámico de la Pestaña Activa */}
        <div className="bg-[#0B1E3D]/95 border border-blue-800/80 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          
          {/* 1. PESTAÑA: ORIENTACIÓN SOBRE FIANZAS */}
          {activeTab === 'orientacion' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-7 space-y-4 text-left">
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-300 uppercase tracking-widest">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'es' ? 'Fianzas de Entrega (Formulario I-352)' : 'Delivery Bonds (Form I-352)'}</span>
                </div>
                
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  {lang === 'es' ? '¿Cómo Funciona la Fianza Migratoria en EE. UU.?' : 'How U.S. Immigration Bonds Work'}
                </h3>

                <p className="text-sm text-slate-200 leading-relaxed font-light">
                  {lang === 'es'
                    ? 'Cuando una persona es detenida por el Servicio de Inmigración y Control de Aduanas (ICE), puede ser elegible para una fianza de liberación monetaria que le permite defender su caso en libertad fuera del centro de detención.'
                    : 'When detained by ICE, an individual may be eligible for a monetary release bond, allowing them to pursue immigration court proceedings in freedom.'}
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start space-x-3 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Fianza fijada por ICE:</strong> Establecida inicialmente por el oficial de deportación al momento del procesamiento.</span>
                  </div>
                  <div className="flex items-start space-x-3 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Audiencia de Fianza ante el Juez (EOIR):</strong> Moción formal para solicitar la reducción o fijación de fianza demostrando arraigo y que no existe riesgo de fuga.</span>
                  </div>
                  <div className="flex items-start space-x-3 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Quién puede pagar la fianza:</strong> Debe ser consignada por una persona con estatus legal en EE. UU. (ciudadano o residente legal permanente).</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                  <button
                    onClick={() => onOpenCallRequest('fianzas-migratorias')}
                    className="w-full sm:w-auto px-5 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center space-x-2 cursor-pointer border border-amber-300/60 active:scale-95"
                  >
                    <span>{lang === 'es' ? 'Solicitar Orientación de Fianza' : 'Request Bond Guidance'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a
                    href="tel:+15513499462"
                    className="w-full sm:w-auto px-4 py-3 sm:px-5 sm:py-3.5 bg-[#081426] hover:bg-[#16386E] text-white font-semibold text-xs sm:text-sm rounded-lg border border-blue-700/60 flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>{FIRM_CONFIG.primaryPhone}</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#081426] p-6 rounded-2xl border border-blue-800/80 space-y-4 text-left">
                <h4 className="font-serif text-lg font-bold text-amber-300">Aspectos Críticos de la Fianza</h4>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="p-3 bg-[#0B1E3D] rounded-xl border border-blue-800/60">
                    <strong className="text-white block mb-0.5">Monto Mínimo Legal:</strong>
                    La ley de inmigración establece que una fianza de entrega no puede ser inferior a $1,500 USD, y su fijación depende de los lazos familiares y comunitarios.
                  </div>
                  <div className="p-3 bg-[#0B1E3D] rounded-xl border border-blue-800/60">
                    <strong className="text-white block mb-0.5">Cumplimiento Obligatorio:</strong>
                    La persona en libertad debe acudir puntualmente a todas sus audiencias ante la corte (EOIR) y citas con ICE para no perder la fianza.
                  </div>
                  <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-500/40 text-emerald-200">
                    <strong className="text-emerald-300 block mb-0.5">Asesoría de Emergencia 24/7:</strong>
                    Actuamos con prontitud ante detenciones recientes para solicitar audiencias de fianza inmediatas.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PESTAÑA: RECUPERACIÓN DE FONDOS */}
          {activeTab === 'recuperacion' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-7 space-y-4 text-left">
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-300 uppercase tracking-widest">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'es' ? 'Recuperación de Fondos Consignados' : 'Refund of Cash Bond Deposits'}</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  {lang === 'es' ? '¿Cómo Recuperar el Dinero de su Fianza?' : 'How to Recover Your Bond Deposit'}
                </h3>

                <p className="text-sm text-slate-200 leading-relaxed font-light">
                  {lang === 'es'
                    ? 'Cuando el caso de inmigración concluye formalmente (por concesión de residencia, asilo, cierre de corte, o salida voluntaria confirmada), el fiador (obligor) tiene el derecho legal de solicitar el reembolso completo del dinero depositado, más los intereses acumulados.'
                    : 'Upon formal case conclusion (through green card grant, asylum, court termination, or departure), the obligor is legally entitled to full bond refund plus accrued interest.'}
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start space-x-3 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Cancelación de Fianza (Formulario I-391):</strong> Notificación oficial emitida por ICE cuando la obligación procesal ha finalizado.</span>
                  </div>
                  <div className="flex items-start space-x-3 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Trámite ante el Debt Management Center:</strong> Gestión administrativa ante el centro financiero de ICE en Vermont para liberar el cheque de reembolso.</span>
                  </div>
                  <div className="flex items-start space-x-3 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Recuperación de Recibo Extraviado:</strong> Si perdió el Formulario I-305 original, gestionamos la Declaración Jurada I-395 para no perder sus fondos.</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                  <button
                    onClick={() => onOpenCallRequest('fianzas-migratorias')}
                    className="w-full sm:w-auto px-5 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center space-x-2 cursor-pointer border border-amber-300/60 active:scale-95"
                  >
                    <span>{lang === 'es' ? 'Consultar Devolución de Fianza' : 'Check Bond Refund Status'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenEvaluator('defensa-deportacion')}
                    className="w-full sm:w-auto px-4 py-3 sm:px-5 sm:py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-lg border border-emerald-500/40 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {lang === 'es' ? 'Evaluar Estado del Caso' : 'Evaluate Case Status'}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#081426] p-6 rounded-2xl border border-blue-800/80 space-y-4 text-left">
                <h4 className="font-serif text-lg font-bold text-amber-300">¿A Quién se Devuelve el Dinero?</h4>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="p-3 bg-[#0B1E3D] rounded-xl border border-blue-800/60">
                    <strong className="text-white block mb-0.5">El Titular del Pago (Obligor):</strong>
                    El cheque de reembolso se emite exclusivamente a nombre de la persona que pagó la fianza originalmente ante ICE y firmó el contrato I-352.
                  </div>
                  <div className="p-3 bg-[#0B1E3D] rounded-xl border border-blue-800/60">
                    <strong className="text-white block mb-0.5">Intereses Generados:</strong>
                    Por ley federal, los fondos depositados en garantía ante el gobierno de EE. UU. acumulan intereses calculados por el Departamento del Tesoro.
                  </div>
                  <div className="p-3 bg-[#0B1E3D] rounded-xl border border-blue-800/60">
                    <strong className="text-white block mb-0.5">Acompañamiento sin Demoras:</strong>
                    Evitamos demoras burocráticas comunes actualizando su dirección postal registrada ante el Centro de Finanzas de ICE.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. PESTAÑA: REQUISITOS Y DOCUMENTACIÓN */}
          {activeTab === 'requisitos' && (
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              <div className="max-w-2xl">
                <h3 className="font-serif text-2xl font-bold text-white mb-2">
                  Documentación Necesaria para Trámites de Fianza
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Tenga a mano los siguientes documentos para que nuestros abogados puedan revisar su trámite de manera ágil y sin contratiempos:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#081426] p-5 rounded-xl border border-blue-800/80 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">1</div>
                  <h4 className="font-bold text-white text-sm">Recibo Oficial Formulario I-305</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Es el recibo original emitido por el oficial de ICE que recibió los fondos. Si no lo tiene, se tramita la declaración jurada de pérdida I-395.
                  </p>
                </div>

                <div className="bg-[#081426] p-5 rounded-xl border border-blue-800/80 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">2</div>
                  <h4 className="font-bold text-white text-sm">Contrato de Fianza Formulario I-352</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Copia del acuerdo de fianza firmado con ICE que contiene el número de caso (Alien Number - A#) y los datos completos del obligado.
                  </p>
                </div>

                <div className="bg-[#081426] p-5 rounded-xl border border-blue-800/80 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">3</div>
                  <h4 className="font-bold text-white text-sm">Resolución de Corte u Orden de Cierre</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Sentencia del Juez de Inmigración, carta de aprobación de residencia, o certificación de salida voluntaria verificada por el consulado.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-blue-900/60">
                <div className="text-xs text-slate-300 flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>¿Le falta alguno de estos documentos? Le orientamos para recuperarlos formalmente.</span>
                </div>
                <button
                  onClick={() => onOpenCallRequest('fianzas-migratorias')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center justify-center space-x-2 cursor-pointer border border-amber-300/60 active:scale-95"
                >
                  <span>Revisar mi Documentación</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 4. PESTAÑA: PASOS A SEGUIR */}
          {activeTab === 'pasos' && (
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              <div className="max-w-2xl">
                <h3 className="font-serif text-2xl font-bold text-white mb-2">
                  Proceso Paso a Paso con Nuestra Firma
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Estructuramos cada gestión con total apego a la normativa federal y transparencia informativa:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#081426] p-4 rounded-xl border border-blue-800/80 space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Paso 1</span>
                  <h4 className="font-bold text-white text-sm">Evaluación Inicial</h4>
                  <p className="text-xs text-slate-300">Revisión del número A# y verificación de estatus procesal en el sistema judicial o ante ICE.</p>
                </div>
                <div className="bg-[#081426] p-4 rounded-xl border border-blue-800/80 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Paso 2</span>
                  <h4 className="font-bold text-white text-sm">Integración de Pruebas</h4>
                  <p className="text-xs text-slate-300">Compilación de comprobantes de pago, recibos de entrega y resolución judicial de cierre.</p>
                </div>
                <div className="bg-[#081426] p-4 rounded-xl border border-blue-800/80 space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Paso 3</span>
                  <h4 className="font-bold text-white text-sm">Radicación Formal</h4>
                  <p className="text-xs text-slate-300">Presentación de la solicitud formal I-391 y seguimiento ante el Debt Management Center de ICE.</p>
                </div>
                <div className="bg-[#081426] p-4 rounded-xl border border-blue-800/80 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Paso 4</span>
                  <h4 className="font-bold text-white text-sm">Liberación de Fondos</h4>
                  <p className="text-xs text-slate-300">Monitoreo hasta la emisión y envío del cheque de reembolso oficial a nombre del fiador.</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-blue-900/60">
                <button
                  onClick={() => onOpenCallRequest('fianzas-migratorias')}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center space-x-2 cursor-pointer border border-amber-300/60 active:scale-95"
                >
                  <span>Iniciar Consulta de Fianza</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Descargo Ético Institucional */}
        <div className="max-w-3xl mx-auto p-4 rounded-xl bg-[#050D1A] border border-blue-900/60 text-center text-xs text-slate-300 space-y-1">
          <div className="flex items-center justify-center space-x-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Aviso Legal Informativo de Fianzas</span>
          </div>
          <p className="font-light leading-relaxed">
            La elegibilidad para una fianza migratoria o su recuperación depende estrictamente de los hechos individuales de cada expediente, el cumplimiento de las órdenes judiciales y las disposiciones vigentes de ICE y la corte de inmigración. Esta información no constituye garantía de reembolso ni asesoría legal individualizada.
          </p>
        </div>

      </div>
    </section>
  );
}
