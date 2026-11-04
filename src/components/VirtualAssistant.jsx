import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, X, Send, Bot, Sparkles, 
  Phone, CheckCircle2, ChevronRight, User, ExternalLink, ShieldCheck, ArrowRight, MessageCircle 
} from 'lucide-react';
import { FIRM_CONFIG, VIRTUAL_ASSISTANT_CONFIG } from '../data/demoData';
import { analytics } from '../services/analytics';

export default function VirtualAssistant({ lang = 'es', onOpenEvaluator, onOpenCallRequest }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: lang === 'es' ? VIRTUAL_ASSISTANT_CONFIG.greetingEs : VIRTUAL_ASSISTANT_CONFIG.greetingEn,
      time: 'Ahora',
      showActions: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const cannedResponses = {
    asilo: {
      es: "Para el Asilo Político en EE. UU., debe demostrarse temor fundado de persecución por motivos protegidos. El plazo general es radicar el Formulario I-589 antes de cumplir 1 año en el país. ¿Desea iniciar una evaluación confidencial de su caso ahora mismo?",
      en: "Political Asylum requires demonstrating a well-founded fear of persecution. The statutory deadline is filing Form I-589 within 1 year of entry. Would you like to launch a confidential case assessment right now?",
      practiceId: 'asilo-politico'
    },
    deportacion: {
      es: "Si tiene cita ante la Corte de Inmigración (EOIR) o una Notificación NTA, el tiempo es determinante. Evaluamos defensas como Cancelación de Remoción, Asilo Defensivo o audiencias de fianza para liberación. ¿Desea que un abogado le llame de inmediato?",
      en: "If you have an EOIR court hearing or received an NTA, time is critical. We evaluate Cancellation of Removal, Defensive Asylum, and emergency bond hearings. Would you like an immediate callback?",
      practiceId: 'defensa-deportacion'
    },
    familiar: {
      es: "Las peticiones familiares (Formulario I-130) permiten a ciudadanos y residentes permanentes solicitar a sus cónyuges, hijos y familiares directos. Si entró legalmente y está casado con ciudadano, puede solicitar el Ajuste de Estatus y Permiso de Trabajo simultáneamente.",
      en: "Family petitions (Form I-130) allow U.S. citizens and permanent residents to sponsor spouses, children, and immediate relatives. Concurrent adjustment of status is available for qualifying immediate relatives.",
      practiceId: 'residencia-green-card'
    },
    inversion: {
      es: "Las Visas de Inversión E-2 requieren nacionalidad de un país con tratado y una inversión sustancial (desde $100,000+). El programa EB-5 otorga residencia permanente directa a la familia mediante inversión calificada.",
      en: "E-2 Treaty Investor visas require treaty nation citizenship and a substantial business investment ($100k+). The EB-5 program grants direct permanent residency for qualifying investments.",
      practiceId: 'visas-inversion-eb5-e2'
    },
    cita: {
      es: "Con gusto coordinamos su consulta inicial confidencial con uno de nuestros abogados titulares. Puede solicitar una llamada inmediata aquí mismo o escribirnos directamente a WhatsApp.",
      en: "We would be glad to arrange a confidential consultation with a senior attorney. You can request an immediate callback or chat directly on WhatsApp."
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend = null) => {
    const messageText = textToSend || inputValue.trim();
    if (!messageText) return;

    const userMsg = { sender: 'user', text: messageText, time: 'Ahora' };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    setIsTyping(true);
    setTimeout(() => {
      let reply = "";
      let matchedPractice = null;
      const lower = messageText.toLowerCase();

      if (lower.includes('asilo') || lower.includes('miedo') || lower.includes('refugio')) {
        reply = lang === 'es' ? cannedResponses.asilo.es : cannedResponses.asilo.en;
        matchedPractice = 'asilo-politico';
      } else if (lower.includes('deport') || lower.includes('corte') || lower.includes('nta') || lower.includes('fianza')) {
        reply = lang === 'es' ? cannedResponses.deportacion.es : cannedResponses.deportacion.en;
        matchedPractice = 'defensa-deportacion';
      } else if (lower.includes('famili') || lower.includes('green card') || lower.includes('espos') || lower.includes('residen')) {
        reply = lang === 'es' ? cannedResponses.familiar.es : cannedResponses.familiar.en;
        matchedPractice = 'residencia-green-card';
      } else if (lower.includes('inver') || lower.includes('e-2') || lower.includes('eb-5') || lower.includes('negocio')) {
        reply = lang === 'es' ? cannedResponses.inversion.es : cannedResponses.inversion.en;
        matchedPractice = 'visas-inversion-eb5-e2';
      } else if (lower.includes('cita') || lower.includes('abogado') || lower.includes('contacto') || lower.includes('precio') || lower.includes('costo') || lower.includes('llamad')) {
        reply = lang === 'es' ? cannedResponses.cita.es : cannedResponses.cita.en;
      } else {
        reply = lang === 'es'
          ? "He registrado su consulta legal sobre «" + messageText + "». En Valenzuela & Sterling podemos asesorarle con rigor. ¿Desea iniciar su evaluación de elegibilidad o solicitar una llamada de guardia hoy mismo?"
          : "I have recorded your legal inquiry regarding “" + messageText + "”. At Valenzuela & Sterling, we can provide immediate strategic guidance. Would you prefer an assessment or an immediate callback?";
      }

      setMessages(prev => [
        ...prev, 
        { 
          sender: 'bot', 
          text: reply, 
          time: 'Ahora',
          showActions: true,
          practiceId: matchedPractice 
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleLaunchEvaluator = (practiceId) => {
    setIsOpen(false);
    onOpenEvaluator(practiceId);
  };

  const handleLaunchCallRequest = () => {
    setIsOpen(false);
    if (onOpenCallRequest) onOpenCallRequest();
  };

  const handleWhatsAppChat = () => {
    analytics.trackWhatsAppClick('virtual_assistant');
    window.open(FIRM_CONFIG.whatsappLink, '_blank');
  };

  const quickPrompts = lang === 'es' 
    ? VIRTUAL_ASSISTANT_CONFIG.quickPromptsEs 
    : VIRTUAL_ASSISTANT_CONFIG.quickPromptsEn;

  return (
    <>
      {/* BOTÓN FLOTANTE ACTIVADOR EN AZUL CORPORATIVO + DORADO */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            analytics.track('virtual_assistant_opened');
          }}
          className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center space-x-2.5 bg-[#0B1E3D] hover:bg-[#16386E] text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group border border-amber-400/50"
          aria-label="Abrir Asistente Legal Virtual"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-[#0B1E3D]" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold leading-none text-white">Sofía • Valenzuela & Sterling</div>
            <div className="text-[10px] text-amber-400 font-light leading-none mt-1">
              {lang === 'es' ? 'Asistente Legal 24/7' : '24/7 Intake Assistant'}
            </div>
          </div>
        </button>
      )}

      {/* VENTANA DEL ASISTENTE VIRTUAL */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#0B1E3D] border border-blue-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 text-white">
          
          {/* Header en Azul Marino Profundo */}
          <div className="bg-[#081426] border-b border-blue-900/60 px-5 py-3.5 flex items-center justify-between text-white flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#0B1E3D] border border-amber-400/40 flex items-center justify-center text-amber-400">
                <Bot className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="font-serif font-bold text-sm text-white">Sofía</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#081426] text-emerald-400 font-semibold border border-emerald-500/40">
                    {lang === 'es' ? 'EN LÍNEA' : 'ONLINE'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 font-light">
                  {lang === 'es' ? 'Orientación Inmediata de Casos' : 'Intake & Case Conversion'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Cerrar Asistente"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner ético discreto */}
          <div className="bg-[#050D1A] px-4 py-1.5 border-b border-blue-900/60 text-[10px] text-slate-300 flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>{lang === 'es' ? 'Confidencialidad amparada por secreto profesional.' : 'Confidential under attorney-client standards.'}</span>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#081426]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-sm font-medium'
                      : 'bg-[#0B1E3D] border border-blue-800/80 text-slate-100 rounded-bl-none shadow-md text-left'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                {/* Botones de Acción de Conversión integrados */}
                {msg.sender === 'bot' && msg.showActions && (
                  <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
                    <button
                      onClick={() => handleLaunchEvaluator(msg.practiceId || 'residencia-green-card')}
                      className="px-2.5 py-1 bg-[#0F274E] hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-400/40 rounded-md text-[11px] font-semibold transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{lang === 'es' ? 'Evaluar Elegibilidad' : 'Assess Eligibility'}</span>
                    </button>

                    <button
                      onClick={handleLaunchCallRequest}
                      className="px-2.5 py-1 bg-[#081426] hover:bg-[#16386E] text-slate-200 border border-blue-800 rounded-md text-[11px] font-semibold transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3 text-amber-400" />
                      <span>{lang === 'es' ? 'Solicitar Llamada' : 'Request Callback'}</span>
                    </button>

                    <button
                      onClick={handleWhatsAppChat}
                      className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600 hover:text-white text-emerald-300 border border-emerald-500/50 rounded-md text-[11px] font-semibold transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-1.5 p-2 bg-[#0B1E3D] rounded-xl border border-blue-800 w-16 text-amber-400 shadow-xs">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          <div className="px-3 py-2 bg-[#081426] border-t border-blue-900/60 flex gap-1.5 overflow-x-auto">
            {quickPrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-full bg-[#0B1E3D] border border-blue-800 text-[11px] text-slate-300 hover:border-amber-400 hover:text-amber-400 whitespace-nowrap transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Formulario de Envío */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#081426] border-t border-blue-900/60 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={lang === 'es' ? 'Escriba su consulta migratoria...' : 'Ask about your case...'}
              className="flex-1 px-3 py-2 bg-[#0B1E3D] border border-blue-800 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
            />
            <button
              type="submit"
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              disabled={!inputValue.trim()}
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
