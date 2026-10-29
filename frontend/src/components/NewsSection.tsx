import { useState, useEffect } from 'react';
import {
  NEWS_CATEGORIES,
  fetchCategoryNews,
  type NewsArticle,
} from '../services/newsService';

export function NewsSection() {
  const [activeCategory, setActiveCategory] = useState<string>('cocinas');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadNews() {
      setLoading(true);
      try {
        const result = await fetchCategoryNews(activeCategory);
        if (isMounted) {
          setArticles(result.articles);
          setIsLive(result.isLive);
        }
      } catch (err) {
        console.error('Error cargando noticias:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      isMounted = false;
    };
  }, [activeCategory]);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedArticle(null);
      }
    };
    if (selectedArticle) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedArticle]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Reciente';
    }
  };

  return (
    <section id="blog" className="py-24 sm:py-28" style={{ background: '#F7F6F2' }}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Encabezado contextualizado a Jayka */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10" style={{ background: '#2CB99B' }} />
              <span className="text-xs tracking-[0.2em] uppercase font-semibold" style={{ color: '#2CB99B' }}>
                Revista & Tendencias
              </span>
            </div>
            <h2
              className="font-bold leading-tight"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                letterSpacing: '-0.02em',
                color: '#1A1A1A',
              }}
            >
              Tendencias en Carpintería y Diseño a Medida
            </h2>
            <p className="mt-3 text-base max-w-2xl" style={{ color: '#5A5852' }}>
              Novedades, técnicas y proyectos de referencia seleccionados exclusivamente en cocinas, closets, centros de TV y arquitectura de interiores.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: isLive ? '#E6F7F4' : '#EAE8E1',
                color: isLive ? '#1E9A81' : '#6A6860',
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: isLive ? '#2CB99B' : '#9A9890' }}
              />
              {isLive ? 'Noticias en tiempo real' : 'Artículos verificados'}
            </span>
          </div>
        </div>

        {/* Categorías contextualizadas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {NEWS_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="whitespace-nowrap px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer flex-shrink-0"
                style={{
                  background: isActive ? '#2CB99B' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#3A3832',
                  border: isActive ? '1.5px solid #2CB99B' : '1.5px solid #E2E0D9',
                  boxShadow: isActive ? '0 4px 14px rgba(44,185,155,0.25)' : 'none',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Cuadrícula de Noticias */}
        {loading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((sk) => (
              <div
                key={sk}
                className="rounded-2xl overflow-hidden bg-white border border-[#E2E0D9] animate-pulse"
              >
                <div className="w-full h-52 bg-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="flex gap-2">
                    <div className="h-4 w-20 bg-gray-200 rounded-full" />
                    <div className="h-4 w-24 bg-gray-200 rounded-full" />
                  </div>
                  <div className="h-6 w-5/6 bg-gray-200 rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-4/5 bg-gray-200 rounded" />
                  </div>
                  <div className="h-4 w-28 bg-gray-200 rounded pt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((item, index) => (
              <div
                key={`${item.url}-${index}`}
                onClick={() => setSelectedArticle(item)}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E2E0D9] transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer"
                style={{
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                }}
              >
                {/* Imagen de la noticia */}
                <div className="relative w-full h-52 overflow-hidden bg-[#E6F7F4]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = '1';
                        target.src =
                          'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=500&fit=crop&q=80';
                      }
                    }}
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm"
                      style={{
                        background: 'rgba(255, 255, 255, 0.92)',
                        color: '#1A1A1A',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {item.categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Fuente y Fecha */}
                    <div className="flex items-center justify-between text-xs mb-3" style={{ color: '#8A8780' }}>
                      <span className="font-semibold" style={{ color: '#2CB99B' }}>
                        {item.source.name}
                      </span>
                      <span>{formatDate(item.publishedAt)}</span>
                    </div>

                    {/* Título */}
                    <h3
                      className="font-bold text-lg leading-snug mb-3 transition-colors group-hover:text-[#2CB99B] line-clamp-2"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: '#1A1A1A',
                      }}
                    >
                      {item.title}
                    </h3>

                    {/* Extracto */}
                    <p
                      className="text-sm leading-relaxed line-clamp-3 mb-5"
                      style={{ color: '#55534E' }}
                    >
                      {item.description}
                    </p>
                  </div>

                  {/* Botón de lectura */}
                  <div
                    className="pt-4 border-t border-[#F0EFEB] flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-colors"
                    style={{
                      color: '#2CB99B',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <span>Leer artículo</span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Estado Vacío */
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E2E0D9] p-8">
            <span className="text-4xl mb-4 block">🔍</span>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Sin noticias disponibles en este momento</h3>
            <p className="text-sm text-[#666] mb-6">Explora las demás categorías para ver tendencias de carpintería y diseño.</p>
            <button
              onClick={() => setActiveCategory('cocinas')}
              className="px-6 py-2.5 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
              style={{ background: '#2CB99B' }}
            >
              Ver Cocinas Modernas
            </button>
          </div>
        )}

      </div>

      {/* Modal Lector de Artículo Completo */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2E0D9] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera / Imagen */}
            <div className="relative w-full h-64 sm:h-72 overflow-hidden bg-[#E6F7F4] flex-shrink-0">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4">
                <span
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#1A1A1A',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {selectedArticle.categoryLabel}
                </span>
              </div>
            </div>

            {/* Cuerpo del Artículo */}
            <div className="p-6 sm:p-8 flex-1">
              <div className="flex items-center justify-between text-xs mb-3" style={{ color: '#8A8780' }}>
                <span className="font-semibold text-sm" style={{ color: '#2CB99B' }}>
                  Fuente: {selectedArticle.source.name}
                </span>
                <span>{formatDate(selectedArticle.publishedAt)}</span>
              </div>

              <h2
                className="font-bold text-xl sm:text-2xl leading-snug mb-4"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#1A1A1A',
                }}
              >
                {selectedArticle.title}
              </h2>

              <p className="text-base font-medium leading-relaxed mb-4" style={{ color: '#3A3832' }}>
                {selectedArticle.description}
              </p>

              {selectedArticle.content && (
                <div
                  className="text-sm sm:text-base leading-relaxed p-4 rounded-xl mb-6 space-y-3"
                  style={{ background: '#F7F6F2', color: '#4A4842', border: '1px solid #E8E6E0' }}
                >
                  <p>{selectedArticle.content}</p>
                </div>
              )}

              {/* Acciones */}
              <div className="pt-6 border-t border-[#E8E6E1] flex flex-col sm:flex-row gap-3 items-center justify-between">
                <a
                  href={`https://wa.me/573124937069?text=Hola%2C%20estoy%20interesado%20en%20un%20proyecto%20inspirado%20en%3A%20${encodeURIComponent(selectedArticle.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-white transition-opacity hover:opacity-90"
                  style={{ background: '#2CB99B', fontFamily: "'DM Sans', sans-serif" }}
                >
                  <span>💬 Cotizar diseño similar con Jayka</span>
                </a>

                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-[#1A1A1A] hover:bg-gray-100 transition-colors border border-[#E2E0D9]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <span>Ver artículo original</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
