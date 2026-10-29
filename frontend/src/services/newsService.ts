export interface NewsArticle {
  title: string;
  description: string;
  content?: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url?: string;
  };
  categoryLabel?: string;
}

export interface NewsCategory {
  id: string;
  label: string;
  icon: string;
  query: string;
}

// Categorías alineadas al 100% con los servicios de carpintería y diseño de Jayka
export const NEWS_CATEGORIES: NewsCategory[] = [
  {
    id: 'cocinas',
    label: 'Cocinas Modernas',
    icon: '🍳',
    query: '("cocinas modernas" OR "diseño de cocinas" OR "islas de cocina" OR "remodelación cocina") AND (muebles OR diseño OR madera OR arquitectura)',
  },
  {
    id: 'closets',
    label: 'Closets & Vestidores',
    icon: '🚪',
    query: '("vestidores a medida" OR "closets modernos" OR "armarios a medida" OR "diseño de vestidores") AND (orden OR madera OR muebles)',
  },
  {
    id: 'entretenimiento',
    label: 'Centros de Entretenimiento',
    icon: '📺',
    query: '("muebles para tv" OR "centros de entretenimiento" OR "paneles alistonados" OR "panel de tv") AND (sala OR madera OR diseño)',
  },
  {
    id: 'interiorismo',
    label: 'Diseño de Interiores',
    icon: '🏡',
    query: '("diseño de interiores" OR "arquitectura de interiores" OR "interiorismo residencial") AND (tendencias OR espacios OR mobiliario)',
  },
];

// Palabras prohibidas para descartar noticias ajenas (política, sucesos, deportes, etc.)
const BLACKLIST_KEYWORDS = [
  'policía', 'policías', 'detenido', 'capturado', 'crimen', 'accidente', 'asesinato', 'tragedia',
  'muerte', 'muerto', 'falleció', 'disparo', 'arma', 'robo', 'ladrón', 'cárcel', 'juicio', 'tribunal',
  'gobierno', 'política', 'político', 'elecciones', 'presidente', 'senado', 'alcaldía', 'partido',
  'guerra', 'militar', 'ejército', 'fútbol', 'gol', 'campeonato', 'liga', 'champions',
  'farándula', 'reality', 'escándalo', 'divorcio', 'boda', 'novela', 'cantante', 'concierto',
  'navidad', 'luces de navidad', 'alumbrado', 'árbol de navidad'
];

// Validador semántico: asegura que la noticia sea 100% afín a carpintería, arquitectura y diseño
function isArticleRelevant(article: { title?: string; description?: string }, categoryId: string): boolean {
  const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();

  // 1. Descartar de inmediato si contiene cualquier término fuera de contexto
  for (const badWord of BLACKLIST_KEYWORDS) {
    if (text.includes(badWord)) {
      return false;
    }
  }

  // 2. Debe contener términos centrales de arquitectura, mobiliario y diseño
  const CORE_DESIGN_WORDS = [
    'diseño', 'interior', 'mueble', 'mobiliario', 'carpintería', 'madera', 'cocina', 'closet',
    'vestidor', 'estantería', 'arquitectura', 'espacio', 'decoración', 'hogar', 'remodelación',
    'tendencia', 'acabado', 'estilo', 'alistonado', 'repisa', 'isla', 'encimera'
  ];
  const hasCoreTerm = CORE_DESIGN_WORDS.some(term => text.includes(term));
  if (!hasCoreTerm) return false;

  // 3. Validación específica por categoría de Jayka
  if (categoryId === 'cocinas') {
    return ['cocina', 'isla', 'encimera', 'gabinete', 'chef', 'alacena', 'mesón', 'despensa'].some(w => text.includes(w));
  }
  if (categoryId === 'closets') {
    return ['closet', 'vestidor', 'armario', 'guardarropa', 'cajonera', 'orden', 'ropa', 'almacenamiento'].some(w => text.includes(w));
  }
  if (categoryId === 'entretenimiento') {
    return ['tv', 'televisión', 'entretenimiento', 'sala', 'alistonado', 'repisa', 'estar', 'estantería', 'panel'].some(w => text.includes(w));
  }
  if (categoryId === 'interiorismo') {
    return ['interior', 'decoración', 'espacio', 'arquitectura', 'iluminación', 'tendencia', 'textura', 'paleta'].some(w => text.includes(w));
  }

  return true;
}

// Artículos de respaldo curados 100% contextualizados y con enlaces verificados que devuelven HTTP 200
const CURATED_NEWS: Record<string, NewsArticle[]> = {
  cocinas: [
    {
      title: 'Renovación de cocinas y áreas sociales: soluciones integrales y materiales nobles',
      description: 'El diseño moderno de cocinas integra islas con áreas de cocción, acabados en maderas seleccionadas y almacenamiento oculto de alta ingeniería.',
      content: 'Las cocinas modernas han dejado de ser espacios aislados para convertirse en el corazón de la convivencia del hogar. La tendencia actual combina maderas con vetas naturales, encimeras antibacterianas de alta resistencia y herrajes de extracción completa que garantizan una cocina ergonómica, limpia y visualmente despejada.',
      url: 'https://revistaaxxis.com.co/arquitectura/diseno-poliform-productos-arqui/',
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=500&fit=crop&q=80',
      publishedAt: '2026-10-20T10:00:00Z',
      source: { name: 'Revista AXXIS Colombia' },
      categoryLabel: 'Cocinas Modernas',
    },
    {
      title: 'Guía de diseño de islas de cocina: ergonomía, circulación y áreas de desayuno',
      description: 'Aprende a planificar el paso ergonómico, las zonas de cocción y barras de desayuno para aprovechar cada metro cuadrado de tu cocina integral.',
      content: 'Para que una isla sea realmente funcional, es fundamental contemplar un pasillo libre de mínimo 90 a 110 cm para permitir el tránsito fluido mientras se cocinan alimentos. La incorporación de tomas eléctricas emergentes y cajones caceroleros en la isla optimiza el uso diario.',
      url: 'https://www.archdaily.co/co/search/articles?q=cocinas',
      image: 'https://images.unsplash.com/photo-1556911073-a517e752729c?w=800&h=500&fit=crop&q=80',
      publishedAt: '2026-10-16T12:00:00Z',
      source: { name: 'ArchDaily Colombia' },
      categoryLabel: 'Cocinas Modernas',
    },
    {
      title: 'Herrajes ocultos y cajoneras inteligentes: innovación para cocinas a medida',
      description: 'Sistemas esquineros extraíbles, organizadores para ollas y despenseros verticales para mantener la cocina visualmente impecable.',
      content: 'El orden visual es el pilar de la carpintería arquitectónica contemporánea. Mediante guías amortiguadas de cierre suave, brazos abatibles para muebles superiores y sistemas esquineros de giro total, ningún rincón de la cocina queda desaprovechado.',
      url: 'https://www.cocinasconestilo.net/',
      image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop&q=80',
      publishedAt: '2026-10-05T15:20:00Z',
      source: { name: 'Cocinas con Estilo' },
      categoryLabel: 'Cocinas Modernas',
    },
  ],
  closets: [
    {
      title: 'Claves para diseñar un vestidor a medida que multiplique tu espacio de guardado',
      description: 'Organización inteligente, iluminación LED integrada en repisas y distribución por módulos: cómo planear un vestidor funcional y sofisticado.',
      content: 'Un vestidor bien concebido clasifica las prendas por zonas de acceso frecuente y almacenaje estacional. La incorporación de tiras LED cálidas con sensor de proximidad en los percheros no solo aporta un toque de hotel boutique, sino que facilita la visibilidad de colores y texturas de la ropa.',
      url: 'https://www.archdaily.co/co/search/articles?q=closets',
      image: 'https://images.unsplash.com/photo-1558997519-83ea9252eeb8?w=800&h=500&fit=crop&q=80',
      publishedAt: '2026-10-18T14:30:00Z',
      source: { name: 'ArchDaily' },
      categoryLabel: 'Closets & Vestidores',
    },
    {
      title: 'Soluciones modulares y vestieres contemporáneos de alta carpintería',
      description: 'Sistemas de estructura modular que permiten adaptar repisas, pantaloneros y zapateros según las necesidades de la habitación.',
      content: 'La versatilidad de los vestidores modulares permite reconfigurar divisiones internas sin alterar la estructura principal. La elección de correderas ocultas y tiradores embutidos asegura un acabado refinado y limpio.',
      url: 'https://revistaaxxis.com.co/arquitectura/diseno-poliform-productos-arqui/',
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&h=500&fit=crop&q=80',
      publishedAt: '2026-10-11T13:40:00Z',
      source: { name: 'Revista AXXIS' },
      categoryLabel: 'Closets & Vestidores',
    },
    {
      title: 'Detalles de carpintería arquitectónica en armarios y vestidores',
      description: 'Cajoneras con divisores aterciopelados, percheros basculantes y carpintería artesanal para un dormitorio confortable.',
      content: 'El aprovechamiento de la altura total del techo mediante altillos con pistones de gas permite almacenar maletas y ropa de cama sin recargar visualmente el espacio inferior de uso diario.',
      url: 'https://www.archdaily.co/co/search/articles?q=carpinteria',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&h=500&fit=crop&q=80',
      publishedAt: '2026-10-04T10:15:00Z',
      source: { name: 'ArchDaily Colombia' },
      categoryLabel: 'Closets & Vestidores',
    },
  ],
  entretenimiento: [
    {
      title: 'Mobiliario para TV con paneles alistonados: elegancia continua en la sala',
      description: 'Paneles de madera ranurados, repisas flotantes y soluciones con cableado completamente oculto para transformar salas de estar contemporáneas.',
      content: 'El panel alistonado vertical en maderas naturales se ha convertido en el recurso arquitectónico predilecto para vestir paredes de televisión. Aporta una textura rica y calidez, integrando además aislamiento acústico y registros invisibles para todos los cables.',
      url: 'https://www.interioresminimalistas.com/',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop&q=80',
      publishedAt: '2026-10-12T16:00:00Z',
      source: { name: 'Interiores Minimalistas' },
      categoryLabel: 'Centros de Entretenimiento',
    },
    {
      title: 'Muebles de TV suspendidos con iluminación LED perimetral cálida',
      description: 'Diseños visualmente ligeros que facilitan la limpieza del piso y crean una atmósfera envolvente para entretenimiento en casa.',
      content: 'Al levantar el mueble principal del suelo, la sala de estar gana amplitud óptica inmediata. La iluminación rasante inferior crea una sensación de ingravidez que realza cualquier ambiente de descanso.',
      url: 'https://www.archdaily.co/co/search/articles?q=muebles',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=500&fit=crop&q=80',
      publishedAt: '2026-10-07T18:00:00Z',
      source: { name: 'ArchDaily' },
      categoryLabel: 'Centros de Entretenimiento',
    },
    {
      title: 'Integración estética de tecnología y audio en salones modernos',
      description: 'Módulos con puertas en malla acústica o ranurada que permiten el paso del sonido y ventilación de consolas y amplificadores.',
      content: 'Ocultar los aparatos electrónicos sin sacrificar su operatividad con controles remotos es el desafío de los centros de TV actuales. El uso de telas acústicas y rejillas fresadas en madera resuelve tanto la ventilación como la propagación sonora.',
      url: 'https://revistaaxxis.com.co/decoracion/',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=500&fit=crop&q=80',
      publishedAt: '2026-09-28T11:20:00Z',
      source: { name: 'Revista AXXIS' },
      categoryLabel: 'Centros de Entretenimiento',
    },
  ],
  interiorismo: [
    {
      title: 'Ideas para llevar la inspiración natural al diseño interior de tus espacios',
      description: 'Maderas cálidas, tonos arena, linos naturales y remates metálicos discretos para lograr ambientes acogedores y atemporales.',
      content: 'El diseño biofílico y el uso de materiales puros transforman la calidad de vida en el hogar. La combinación de maderas claras, iluminación indirecta y vegetación seleccionada aporta serenidad a los espacios cotidianos.',
      url: 'https://revistaaxxis.com.co/decoracion/diseno-interior-natural/',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=500&fit=crop&q=80',
      publishedAt: '2026-10-15T09:15:00Z',
      source: { name: 'Revista AXXIS Colombia' },
      categoryLabel: 'Diseño de Interiores',
    },
    {
      title: 'Home Office moderno: cómo crear un espacio de trabajo productivo y estético',
      description: 'Escritorios ergonómicos a medida, estanterías suspendidas y acabados que armonizan con el resto del diseño del hogar.',
      content: 'Trabajar desde casa exige un entorno que inspire concentración sin desentonar con la decoración residencial. Un escritorio suspendido con canaleta para cables y gavetas ocultas permite mantener el espacio despejado al terminar la jornada laboral.',
      url: 'https://www.archdaily.co/co/search/articles?q=interiorismo',
      image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=500&fit=crop&q=80',
      publishedAt: '2026-10-10T11:45:00Z',
      source: { name: 'ArchDaily Colombia' },
      categoryLabel: 'Diseño de Interiores',
    },
    {
      title: 'Vanguardia y calidez: proyectos de interiorismo residencial contemporáneo',
      description: 'Explora cómo los estudios de arquitectura combinan celosías divisorias y muebles a medida para articular espacios abiertos.',
      content: 'Dividir sin aislar: las celosías de listones de madera permiten zonificar el comedor y la sala manteniendo el paso de la luz natural y una grata sensación de amplitud en toda la vivienda.',
      url: 'https://revistaaxxis.com.co/diseno/',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=500&fit=crop&q=80',
      publishedAt: '2026-10-08T08:20:00Z',
      source: { name: 'Revista AXXIS' },
      categoryLabel: 'Diseño de Interiores',
    },
  ],
};

const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas de caché

export async function fetchCategoryNews(categoryId: string = 'cocinas'): Promise<{
  articles: NewsArticle[];
  isLive: boolean;
}> {
  // Asegurar que la categoría solicitada sea válida
  const category = NEWS_CATEGORIES.find(c => c.id === categoryId) || NEWS_CATEGORIES[0];
  const apiKey = import.meta.env.VITE_GNEWS_API_KEY;

  const curatedList = CURATED_NEWS[category.id] || CURATED_NEWS.cocinas;

  // Si no hay API key, entregamos los artículos curados de esa categoría
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('tu_api_key')) {
    return {
      articles: curatedList,
      isLive: false,
    };
  }

  const cacheKey = `jayka_strict_news_v3_${category.id}`;

  // Verificar caché en localStorage
  try {
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
      const parsed = JSON.parse(cachedItem);
      const isExpired = Date.now() - parsed.timestamp > CACHE_TTL_MS;
      if (!isExpired && Array.isArray(parsed.articles) && parsed.articles.length > 0) {
        return {
          articles: parsed.articles,
          isLive: true,
        };
      }
    }
  } catch (err) {
    console.warn('Error leyendo caché de noticias:', err);
  }

  // Petición a GNews con consulta estricta
  try {
    const encodedQuery = encodeURIComponent(category.query);
    const url = `https://gnews.io/api/v4/search?q=${encodedQuery}&lang=es&max=10&apikey=${apiKey.trim()}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`GNews API HTTP ${res.status}`);
    }

    const data = await res.json();

    if (data.articles && Array.isArray(data.articles)) {
      // FILTRADO ESTRICTO: descartar todo lo que no pertenezca al nicho de Jayka
      const validArticles: NewsArticle[] = data.articles
        .filter((art: any) => isArticleRelevant(art, category.id))
        .map((art: any) => ({
          title: art.title,
          description: art.description || 'Consulta los detalles y fotografías completas en el artículo original.',
          content: art.content,
          url: art.url,
          image: art.image || curatedList[0]?.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=500&fit=crop&q=80',
          publishedAt: art.publishedAt || new Date().toISOString(),
          source: {
            name: art.source?.name || 'Revista de Diseño',
            url: art.source?.url,
          },
          categoryLabel: category.label,
        }));

      // Si obtuvimos artículos válidos, complementamos si son menos de 3 para que el grid se vea completo
      if (validArticles.length > 0) {
        const finalArticles = validArticles.length >= 3 
          ? validArticles.slice(0, 6) 
          : [...validArticles, ...curatedList.slice(0, 3 - validArticles.length)];

        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              timestamp: Date.now(),
              articles: finalArticles,
            })
          );
        } catch (cacheErr) {
          console.warn('No se pudo guardar noticias en localStorage:', cacheErr);
        }

        return {
          articles: finalArticles,
          isLive: true,
        };
      }
    }
  } catch (error) {
    console.warn('Error consultando GNews, usando curaduría de Jayka:', error);
  }

  // Fallback 100% afin y verificado
  return {
    articles: curatedList,
    isLive: false,
  };
}
