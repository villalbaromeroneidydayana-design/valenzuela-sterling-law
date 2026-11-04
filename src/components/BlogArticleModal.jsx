import React, { useEffect, useRef } from 'react';
import { X, Calendar, Clock, UserCheck, ShieldAlert, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';

export default function BlogArticleModal({ article, lang, onClose, onOpenEvaluator }) {
  const modalContainerRef = useRef(null);

  // Escuchar tecla Escape para accesibilidad y bloquear scroll de fondo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    if (modalContainerRef.current) {
      modalContainerRef.current.focus();
    }

    // Prevenir scroll en el fondo mientras el modal está abierto
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  if (!article) return null;

  const sections = lang === 'es' ? article.sectionsEs : article.sectionsEn;
  const author = lang === 'es' ? article.authorEs : article.authorEn;
  const title = lang === 'es' ? article.titleEs : article.titleEn;

  return (
    <div
      ref={modalContainerRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal/80 backdrop-blur-md animate-in fade-in duration-200 outline-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="blog-article-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-linen-dark rounded-2xl max-w-3xl w-full p-6 sm:p-10 relative shadow-elevated max-h-[92vh] overflow-y-auto space-y-6 text-charcoal">
        
        {/* Botón de cierre superior */}
        <button
          onClick={onClose}
          aria-label={lang === 'es' ? "Cerrar artículo" : "Close article"}
          className="absolute top-5 right-5 text-charcoal-light hover:text-teal p-2 rounded-xl hover:bg-linen transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado y Metadatos */}
        <div className="space-y-3 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-teal uppercase tracking-widest px-2.5 py-1 rounded-full bg-linen border border-linen-dark">
              {article.category}
            </span>
            <span className="text-[10px] font-bold text-bronze uppercase tracking-widest px-2.5 py-1 rounded-full bg-ivory-warm border border-bronze/30">
              {lang === 'es' ? 'Análisis Jurídico Completo' : 'Full Legal Analysis'}
            </span>
          </div>

          <h2
            id="blog-article-modal-title"
            className="font-serif text-2xl sm:text-3xl font-bold text-charcoal leading-snug tracking-tight"
          >
            {title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-light pt-1 border-b border-linen pb-4">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-bronze" />
              <span>{article.date}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-bronze" />
              <span>{article.readTime}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5 text-bronze" />
              <span>{author}</span>
            </span>
          </div>
        </div>

        {/* Portada del Artículo */}
        <div className="rounded-xl overflow-hidden shadow-subtle h-64 sm:h-72 w-full bg-linen relative">
          <img
            src={article.image}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
        </div>

        {/* Cuerpo del Artículo Extenso */}
        <div className="space-y-6 text-sm sm:text-base text-charcoal-soft leading-relaxed font-light">
          {sections && sections.map((sec, idx) => (
            <div key={idx} className="space-y-2.5">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal text-teal">
                {sec.heading}
              </h3>
              <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed text-charcoal-soft">
                {sec.body}
              </p>
            </div>
          ))}
        </div>

        {/* Advertencia Legal Obligatoria */}
        <div className="p-4 bg-linen/70 border border-linen-dark rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-bronze uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-bronze flex-shrink-0" />
            <span>{lang === 'es' ? 'Aviso Legal e Informativo' : 'Legal & Informational Disclaimer'}</span>
          </div>
          <p className="text-[11px] sm:text-xs text-charcoal-light leading-relaxed">
            {lang === 'es'
              ? 'El contenido de este análisis jurídico tiene fines estrictamente pedagógicos y de divulgación general. No constituye asesoramiento legal individualizado ni establece una relación abogado-cliente. Las leyes y políticas migratorias de Estados Unidos están sujetas a modificaciones continuas; le recomendamos consultar formalmente a un abogado de inmigración licenciado para evaluar las circunstancias particulares de su caso. Información verificada para octubre 2026; cambios normativos posteriores quedan identificados como pendientes de revisión jurídica.'
              : 'This legal analysis is provided strictly for educational and general informational purposes. It does not constitute tailored legal counsel nor does it establish an attorney-client relationship. U.S. immigration laws and policies evolve frequently; we advise scheduling a confidential consultation with an admitted immigration attorney to evaluate your specific facts. Information verified as of October 2026; subsequent regulatory changes remain designated as pending review.'
            }
          </p>
        </div>

        {/* Botonera de Cierre y Llamada a la Acción */}
        <div className="pt-4 border-t border-linen flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-linen hover:bg-linen-dark text-charcoal text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {lang === 'es' ? 'Cerrar' : 'Close'}
          </button>

          <button
            onClick={() => {
              onClose();
              if (onOpenEvaluator) onOpenEvaluator('residencia-green-card');
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-teal hover:bg-teal-light text-white font-semibold text-xs rounded-lg transition-colors shadow-sm cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>{lang === 'es' ? 'Consultar con un Abogado sobre este Tema' : 'Consult with an Attorney on this Matter'}</span>
            <ArrowRight className="w-4 h-4 text-bronze" />
          </button>
        </div>

      </div>
    </div>
  );
}
