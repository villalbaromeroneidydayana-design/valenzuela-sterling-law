import React from 'react';
import {
  Scale, Briefcase, Calculator, UserX, Banknote, Clock,
  ShieldAlert, HeartPulse, Users, Phone, ArrowRight, Info
} from 'lucide-react';
import { FIRM_CONFIG } from '../data/demoData';
import { analytics } from '../services/analytics';

/**
 * ENLACE A LA CALCULADORA DE COMPENSACIÓN ESTIMADA
 * Mientras esta constante esté vacía, la tarjeta de la calculadora se muestra como
 * "en revisión". Cuando se defina una URL aprobada, el botón se activa automáticamente
 * y abre la herramienta en una pestaña nueva.
 */
const LABOR_CALCULATOR_URL = '';

const LABOR_AREAS = [
  {
    id: 'despidos-injustificados',
    icon: UserX,
    titleEs: 'Despidos injustificados',
    titleEn: 'Wrongful Termination',
    descEs: 'Si su empleo terminó de forma repentina o por razones que no comprende, podemos revisar las circunstancias y explicarle qué opciones podrían existir en su situación.',
    descEn: 'If your job ended suddenly or for reasons you do not understand, we can review the circumstances and explain what options may be available in your situation.'
  },
  {
    id: 'salarios-no-pagados',
    icon: Banknote,
    titleEs: 'Salarios no pagados',
    titleEn: 'Unpaid Wages',
    descEs: 'Pagos pendientes, descuentos que no le explicaron o diferencias en su sueldo. Revisamos su caso para orientarle sobre los pasos que podría seguir.',
    descEn: 'Outstanding pay, deductions that were never explained, or differences in your wages. We review your situation to guide you on the steps you may take.'
  },
  {
    id: 'horas-extras',
    icon: Clock,
    titleEs: 'Horas extras',
    titleEn: 'Overtime',
    descEs: 'Tiempo trabajado adicional que no fue pagado como corresponde. Le ayudamos a entender cómo se analizan estos reclamos.',
    descEn: 'Extra time worked that was not paid as it should have been. We help you understand how these claims are analyzed.'
  },
  {
    id: 'discriminacion-laboral',
    icon: Users,
    titleEs: 'Discriminación laboral',
    titleEn: 'Workplace Discrimination',
    descEs: 'Trato desigual en el trabajo por motivos que la ley protege, como origen, raza, sexo, edad o discapacidad. Evaluamos los hechos de su caso con confidencialidad.',
    descEn: 'Unequal treatment at work based on legally protected grounds such as national origin, race, sex, age, or disability. We evaluate the facts of your case confidentially.'
  },
  {
    id: 'acoso-represalias',
    icon: ShieldAlert,
    titleEs: 'Acoso y represalias laborales',
    titleEn: 'Harassment & Retaliation',
    descEs: 'Acoso en el lugar de trabajo o consecuencias negativas después de reportar un problema o ejercer sus derechos. Podemos orientarle sobre sus alternativas.',
    descEn: 'Harassment at work or negative consequences after reporting a problem or exercising your rights. We can guide you on your alternatives.'
  },
  {
    id: 'compensaciones-laborales',
    icon: HeartPulse,
    titleEs: 'Compensaciones laborales',
    titleEn: "Workers' Compensation",
    descEs: 'Lesiones o enfermedades relacionadas con el trabajo y los beneficios que podrían corresponder. Le explicamos el proceso y los plazos generales.',
    descEn: 'Work-related injuries or illnesses and the benefits that may apply. We explain the process and general deadlines.'
  }
];

/**
 * Selector visual de las dos grandes áreas de práctica.
 * Se coloca justo antes del directorio de servicios.
 */
export function ServiceAreaSwitch({ lang }) {
  const areas = [
    {
      href: '#servicios',
      icon: Briefcase,
      titleEs: 'Inmigración',
      titleEn: 'Immigration',
      subEs: 'Residencia, familia, asilo, defensa, visas y alivio humanitario',
      subEn: 'Residency, family, asylum, defense, visas, and humanitarian relief'
    },
    {
      href: '#derecho-laboral',
      icon: Scale,
      titleEs: 'Derecho Laboral',
      titleEn: 'Employment Law',
      subEs: 'Despidos, salarios, horas extras, discriminación, acoso y compensaciones',
      subEn: 'Termination, wages, overtime, discrimination, harassment, and compensation'
    }
  ];

  return (
    <section aria-label={lang === 'es' ? 'Áreas de práctica' : 'Practice areas'} className="py-8 bg-[#07152B] border-b border-blue-900/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-amber-400 mb-5">
          {lang === 'es' ? 'Nuestras dos áreas de práctica' : 'Our two practice areas'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {areas.map((area) => {
            const Icon = area.icon;
            return (
              <a
                key={area.href}
                href={area.href}
                className="group flex items-center gap-4 p-5 bg-[#0B1E3D] border border-blue-800/60 hover:border-amber-400/60 rounded-2xl shadow-lg hover:shadow-2xl hover:bg-[#0F274E] transition-all duration-300"
              >
                <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#081426] border border-amber-400/30 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-amber-400" />
                </span>
                <span className="flex-1 text-left">
                  <span className="block font-serif text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {lang === 'es' ? area.titleEs : area.titleEn}
                  </span>
                  <span className="block text-xs text-slate-300 font-light leading-snug mt-0.5">
                    {lang === 'es' ? area.subEs : area.subEn}
                  </span>
                </span>
                <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function LaborLaw({ lang, onRequestGuidance }) {
  const calculatorReady = Boolean(LABOR_CALCULATOR_URL);

  const handleGuidance = () => {
    analytics.trackServiceView('derecho-laboral', 'laboral');
    if (onRequestGuidance) onRequestGuidance('derecho-laboral');
  };

  return (
    <section id="derecho-laboral" className="py-16 sm:py-20 bg-[#07152B] text-white relative scroll-mt-28 border-b border-blue-900/50">
      <div id="laboral" className="scroll-mt-28"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">

        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1E3D] border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'es' ? 'Derecho Laboral' : 'Employment Law'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {lang === 'es' ? (
              <>Defensa de sus <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Derechos en el Trabajo</span></>
            ) : (
              <>Protecting Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Rights at Work</span></>
            )}
          </h2>

          <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-light">
            {lang === 'es'
              ? 'Además de inmigración, orientamos a trabajadores que atraviesan problemas en su empleo. Cuéntenos su situación y le explicaremos, con claridad y confidencialidad, qué alternativas podrían existir.'
              : 'In addition to immigration, we guide workers facing problems at their jobs. Tell us your situation and we will explain, clearly and confidentially, what alternatives may exist.'}
          </p>
        </div>

        {/* Seis áreas laborales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LABOR_AREAS.map((area) => {
            const Icon = area.icon;
            return (
              <article
                key={area.id}
                className="bg-[#0B1E3D] border border-blue-800/60 hover:border-emerald-500/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:bg-[#0F274E] transition-all duration-300 flex flex-col space-y-3 text-left"
              >
                <span className="w-11 h-11 rounded-xl bg-[#081426] border border-blue-800 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-amber-400" />
                </span>
                <h3 className="font-serif text-lg font-bold text-white leading-snug">
                  {lang === 'es' ? area.titleEs : area.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light flex-1">
                  {lang === 'es' ? area.descEs : area.descEn}
                </p>
                <button
                  onClick={handleGuidance}
                  className="self-start text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <span>{lang === 'es' ? 'Solicitar orientación' : 'Request guidance'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </article>
            );
          })}
        </div>

        {/* Calculadora y orientación */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0B1E3D] border border-blue-800/60 rounded-2xl p-6 sm:p-8 space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <span className="w-11 h-11 rounded-xl bg-[#081426] border border-amber-400/40 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-amber-400" />
              </span>
              <h3 className="font-serif text-xl font-bold text-white">
                {lang === 'es' ? 'Calculadora de compensación estimada' : 'Estimated Compensation Calculator'}
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              {lang === 'es'
                ? 'Herramienta orientativa para tener una idea general de los conceptos que podrían analizarse en un reclamo laboral. Los resultados son solo estimaciones informativas: no garantizan elegibilidad ni resultado alguno.'
                : 'An orientation tool to get a general idea of the items that may be analyzed in an employment claim. Results are informational estimates only: they do not guarantee eligibility or any outcome.'}
            </p>

            {calculatorReady ? (
              <a
                href={LABOR_CALCULATOR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors"
              >
                <Calculator className="w-4 h-4 mr-2 text-white" />
                {lang === 'es' ? 'Abrir la calculadora' : 'Open the calculator'}
              </a>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="inline-flex items-center px-4 py-2.5 rounded-lg bg-[#081426] border border-blue-800 text-xs text-slate-300 font-medium">
                  <Info className="w-4 h-4 mr-2 text-amber-400 flex-shrink-0" />
                  <span>{lang === 'es' ? 'Calculadora digital en calibración técnica' : 'Digital calculator under technical calibration'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRequestGuidance('salarios-no-pagados')}
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-md cursor-pointer transition-all border border-emerald-500/40"
                >
                  <Calculator className="w-3.5 h-3.5 mr-1.5" />
                  <span>{lang === 'es' ? 'Solicitar estimación con un asesor' : 'Request estimate with advisor'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-[#0B1E3D] to-[#0F274E] border border-blue-700/60 rounded-2xl p-6 sm:p-8 space-y-4 text-left text-white shadow-xl">
            <h3 className="font-serif text-xl font-bold">
              {lang === 'es' ? '¿Necesita orientación sobre su situación laboral?' : 'Need guidance on your work situation?'}
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed font-light">
              {lang === 'es'
                ? 'Solicite una llamada o comuníquese directamente con nuestro equipo. Revisaremos su información con confidencialidad.'
                : 'Request a callback or contact our team directly. We will review your information confidentially.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={handleGuidance}
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg cursor-pointer border border-amber-300/60"
              >
                <span>{lang === 'es' ? 'Solicitar orientación' : 'Request guidance'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
              <a
                href={`tel:${FIRM_CONFIG.primaryPhoneRaw}`}
                onClick={() => analytics.trackPhoneClick('labor_section')}
                className="inline-flex items-center justify-center px-6 py-3 bg-[#081426] hover:bg-[#16386E] text-white font-bold text-xs rounded-lg border border-blue-700/60 transition-colors"
              >
                <Phone className="w-4 h-4 mr-2 text-emerald-400" />
                <span>{FIRM_CONFIG.primaryPhone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Aviso informativo */}
        <p className="text-[11px] text-slate-400 text-center max-w-3xl mx-auto leading-relaxed">
          {lang === 'es'
            ? 'La información de esta sección es general y no constituye asesoría legal ni crea una relación abogado-cliente. Cada caso depende de sus hechos, de la ley aplicable y de plazos que pueden ser limitados. Ningún resultado está garantizado.'
            : 'The information in this section is general and does not constitute legal advice or create an attorney-client relationship. Each case depends on its facts, the applicable law, and deadlines that may be limited. No outcome is guaranteed.'}
        </p>

      </div>
    </section>
  );
}

