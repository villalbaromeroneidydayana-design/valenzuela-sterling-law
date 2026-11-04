import React, { useState } from 'react';
import { BLOG_POSTS } from '../data/demoData';
import { BookOpen, Calendar, Clock, ArrowRight } from 'lucide-react';
import BlogArticleModal from './BlogArticleModal';

export default function BlogPreview({ lang, onOpenEvaluator, onOpenArticle }) {
  const [selectedPost, setSelectedPost] = useState(null);

  const handleArticleClick = (post) => {
    if (onOpenArticle) {
      onOpenArticle(post);
    } else {
      setSelectedPost(post);
    }
  };

  return (
    <section id="blog" className="py-20 bg-[#081426] text-white relative scroll-mt-28 border-b border-blue-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1E3D] border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'es' ? 'Actualidad Jurídica Migratoria' : 'Immigration Legal Insights'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                Análisis y Novedades sobre <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Leyes de Inmigración</span>
              </>
            ) : (
              <>
                Recent Articles & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">USCIS Regulatory Updates</span>
              </>
            )}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
            {lang === 'es' 
              ? 'Artículos elaborados por nuestros abogados para mantener a la comunidad informada sobre cambios en el Boletín de Visas, políticas del DHS y precedentes judiciales.'
              : 'Legal commentary crafted by our attorneys tracking Visa Bulletin updates, Department of Homeland Security directives, and precedent rulings.'
            }
          </p>
        </div>

        {/* Grid de 3 Artículos en Azul Corporativo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {BLOG_POSTS.map((post) => (
            <div
              key={post.id}
              className="bg-[#0B1E3D] border border-blue-800/60 hover:border-amber-400/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:bg-[#0F274E]"
            >
              {/* Imagen del artículo */}
              <div className="relative h-48 overflow-hidden bg-[#050D1A]">
                <img
                  src={post.image}
                  alt={post.titleEs}
                  width="800"
                  height="450"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-3 left-3 bg-[#081426]/90 backdrop-blur-md border border-blue-800 text-amber-300 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm">
                  {post.category}
                </span>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-[11px] text-slate-300">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{post.date}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {lang === 'es' ? post.titleEs : post.titleEn}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 font-light">
                    {lang === 'es' ? post.snippetEs : post.snippetEn}
                  </p>
                </div>

                <div className="pt-4 border-t border-blue-900/60 mt-4">
                  <button
                    onClick={() => handleArticleClick(post)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <span>{lang === 'es' ? 'Leer artículo completo' : 'Read Full Article'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* MODAL DE LECTURA DE ARTÍCULO (Fallback si no se controla desde App.jsx) */}
      {selectedPost && !onOpenArticle && (
        <BlogArticleModal
          article={selectedPost}
          lang={lang}
          onClose={() => setSelectedPost(null)}
          onOpenEvaluator={onOpenEvaluator}
        />
      )}

    </section>
  );
}
