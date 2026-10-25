import { useState, useEffect, useRef, useCallback } from 'react'
import logo from './assets/jayka-logo.png'
import { api } from './services/api'
import { CotizadorModal } from './cotizador/CotizadorModal'
import { LegalModal, type LegalModalType } from './components/LegalModal'

// URL base del backend — usa .env en local y .env.production al hacer build
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// ─── NAV ───────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Blog', href: '#blog' },
]

// ─── SERVICE DATA ───────────────────────────────────────────────────────────────
const SERVICE_CATEGORIES = [
  {
    id: 'cocina',
    label: 'Mobiliario de Cocina',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <circle cx="8" cy="10" r="2" />
        <path d="M13 8h5M13 12h5" />
      </svg>
    ),
    subcategories: [
      {
        label: 'Lineal',
        images: [
          'https://hips.hearstapps.com/hmg-prod/images/cocina-madera-estudio-nualart-65d883cc0c775.jpg?crop=1xw:1xh;center,top',
          '/images/cocina/4.jpg',
          '/images/cocina/1.JPG',
          '/images/cocina/5.jpg',
          'https://www.betulaestudio.com/wp-content/uploads/2024/09/campestre-scaled.jpg',
        ],
      },
      {
        label: 'En L',
        images: [
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&h=600&fit=crop&auto=format',
          '/images/cocina/l4.JPG',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=900&h=600&fit=crop&auto=format',
          '/images/cocina/l2.JPG',
          'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=900&h=600&fit=crop&q=80',
        ],
      },
      {
        label: 'Con Isla',
        images: [
          'https://santossantiago.com/wp-content/uploads/2021/06/isla-cocina-madera-negra.jpg',
          'https://santossantiago.com/wp-content/uploads/2018/05/cocina-pequena-con-isla-santos.jpg',
          'https://images.unsplash.com/photo-1556911073-a517e752729c?w=900&h=600&fit=crop&auto=format',
          'https://santossantiago.com/wp-content/uploads/2018/05/medidas-minimas-isla-cocina-1.jpg',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&h=600&fit=crop&q=80',
        ],
      },
    ],
  },
  {
    id: 'closets',
    label: 'Closets',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="7" y1="12" x2="9" y2="12" />
        <line x1="15" y1="12" x2="17" y2="12" />
      </svg>
    ),
    subcategories: [
      {
        label: 'Corredizas',
        images: [
          'https://i.pinimg.com/736x/27/a8/25/27a825ef1c2cf3de1ee08416dbb598e4.jpg',
          'https://i.pinimg.com/1200x/38/cc/fb/38ccfb7d5f62fc968c6a2767ce1de941.jpg',
          'https://mueblesvera.com.pe/240-thickbox_default/closet-con-puertas-corredizas.jpg',
          'https://i.pinimg.com/1200x/54/12/86/541286ecec5c891c9f330cdf35ed7f1e.jpg',
          'https://i.pinimg.com/736x/9c/b1/f7/9cb1f72cec6d52fad96cfd3ea92127df.jpg',
        ],
      },
      {
        label: 'Abatibles',
        images: [
          'https://i.pinimg.com/1200x/a1/5d/07/a15d07b13d91b48d4e6fdfb4495f5512.jpg',
          'https://i.pinimg.com/1200x/d5/cf/67/d5cf6729e31e738315a2ee64ea510905.jpg',
          'https://i.pinimg.com/736x/60/0a/8a/600a8a56b02ea3441f578e40f9558208.jpg',
          'https://i.pinimg.com/1200x/4e/57/5d/4e575de72a1861693ff58a0e7989bf2d.jpg',
          'https://i.pinimg.com/736x/94/a1/76/94a1768d5645033bcaeb7ddff574896f.jpg',
        ],
      },
    ],
  },
  {
    id: 'puertas',
    label: 'Puertas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="3" y="2" width="13" height="20" rx="1" />
        <circle cx="14.5" cy="12" r="0.75" fill="currentColor" />
        <line x1="16" y1="2" x2="21" y2="4" />
        <line x1="16" y1="22" x2="21" y2="20" />
        <line x1="21" y1="4" x2="21" y2="20" />
      </svg>
    ),
    subcategories: [
      {
        label: 'Interiores',
        images: [
          '/images/puerta/p1.JPG',
          'https://i.pinimg.com/1200x/46/8f/7a/468f7a52bfdd3ed8b1e7e05c4a7637ab.jpg',
          'https://i.pinimg.com/736x/fd/82/32/fd8232968d74671116f26d7d9be45c1c.jpg',
          '/images/puerta/p2.JPG',
          'https://i.pinimg.com/736x/c7/35/fb/c735fb2cbb1ca89a48e02690d38ddbdc.jpg',
        ],
      },
      {
        label: 'Principales',
        images: [
          'https://i.pinimg.com/736x/64/5d/83/645d83fcb97629a064d9bf7e89766c57.jpg',
          '/images/puerta/p2.JPG',
          'https://i.pinimg.com/736x/29/97/f9/2997f96b29f32d1900a6a2c0cda4dacb.jpg',
          'https://i.pinimg.com/1200x/f6/0b/34/f60b34e28a43bca99f60ef19794b9689.jpg',
          '/images/puerta/p1.JPG',
        ],
      },
    ],
  },
  {
    id: 'ventanas',
    label: 'Ventanas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    ),
    subcategories: [
      {
        label: 'Residenciales',
        images: [
          'https://i.pinimg.com/736x/2c/c0/57/2cc057fe94306b3b204e878a3eabf375.jpg',
          'https://i.pinimg.com/1200x/42/40/23/4240230ef8e3b5a8bcec893f1ba66b37.jpg',
          'https://i.pinimg.com/1200x/99/6f/12/996f1214a08c978e1d8a916689bb6ea2.jpg',
          'https://i.pinimg.com/1200x/f1/10/43/f1104336575e3d257fd8593d8b636949.jpg',
          'https://i.pinimg.com/736x/3a/73/19/3a73197275d46f62861f47807a90c57a.jpg',
        ],
      },
    ],
  },
  {
    id: 'entretenimiento',
    label: 'Entretenimiento',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M9 9l3 2-3 2V9z" fill="currentColor" stroke="none" />
      </svg>
    ),
    subcategories: [
      {
        label: 'Centros de TV',
        images: [
          'https://i.pinimg.com/736x/dc/8f/a9/dc8fa94f08bbe207c301fed816ef7ee2.jpg',
          'https://i.pinimg.com/1200x/4b/dc/ba/4bdcba383b406106e7c53a2075609aa1.jpg',
          'https://i.pinimg.com/1200x/dd/58/96/dd58963736d903d527db160f3f865ed0.jpg',
          'https://i.pinimg.com/736x/f8/e6/31/f8e631af719c3b39f970750785a3598d.jpg',
          'https://i.pinimg.com/1200x/21/8e/56/218e564c3c984fa250d23f6b2c53a81b.jpg',
        ],
      },
      {
        label: 'Muebles Sala',
        images: [
          'https://i.pinimg.com/736x/62/38/14/62381467849ea6ad0f03e5011b682bca.jpg',
          'https://i.pinimg.com/1200x/bc/73/08/bc73086f47d0dacef96180df2372a2f7.jpg',
          'https://i.pinimg.com/736x/29/ce/c7/29cec79c797d93f8baf99163f5c0c7f4.jpg',
          'https://i.pinimg.com/1200x/9c/4d/0b/9c4d0b24fc39595e8d300354db771f41.jpg',
          'https://i.pinimg.com/1200x/4e/5e/18/4e5e18e1a0be1ab54d3165e79e88343e.jpg',
        ],
      },
    ],
  },
  {
    id: 'oficinas',
    label: 'Oficinas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="2" y="7" width="20" height="15" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="17" />
        <line x1="9" y1="14.5" x2="15" y2="14.5" />
      </svg>
    ),
    subcategories: [
      {
        label: 'Escritorios',
        images: [
          '/images/ofic/o1.JPG',
          'https://i.pinimg.com/736x/0a/59/ea/0a59eafec2cbe46260a2555415f81ccf.jpg',
          'https://i.pinimg.com/1200x/42/67/9c/42679c643ad3f22d54ae8370e13fc769.jpg',
          'https://i.pinimg.com/736x/c2/54/d6/c254d63d421fcf292b0d8f26fb1bc084.jpg',
          'https://i.pinimg.com/736x/47/25/9a/47259a7d31d6324394373621cc24c19d.jpg',
        ],
      },
      {
        label: 'Estanterías',
        images: [
          'https://i.pinimg.com/1200x/06/9f/23/069f2361f5f8783ba620b295c55e3885.jpg',
          'https://i.pinimg.com/736x/98/73/a4/9873a4aeae68a788c750cab3ca3f3e38.jpg',
          'https://i.pinimg.com/1200x/41/e7/68/41e768174f0a7511ae3d0878d48275f6.jpg',
          'https://i.pinimg.com/1200x/25/54/dd/2554dd90dbac7dcb1f2efb5916f85ec3.jpg',
          'https://i.pinimg.com/1200x/bf/a3/e4/bfa3e4bf40f4900301798e647c9d196a.jpg',
        ],
      },
    ],
  },
]

// ─── COMPONENT: ServiceCarousel ─────────────────────────────────────────────────
function ServiceCarousel({ onOpenCotizador }: { onOpenCotizador?: (serviceId?: string) => void }) {
  const [activeService, setActiveService] = useState(0)
  const [activeSubcat, setActiveSubcat] = useState(0)
  const [activeImage, setActiveImage] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [animating, setAnimating] = useState(false)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const service = SERVICE_CATEGORIES[activeService]
  const subcat = service.subcategories[activeSubcat]
  const images = subcat.images

  const goTo = useCallback((idx: number, dir: 'left' | 'right') => {
    if (animating) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setActiveImage(idx)
      setAnimating(false)
    }, 380)
  }, [animating])

  const next = useCallback(() => {
    goTo((activeImage + 1) % images.length, 'right')
  }, [activeImage, images.length, goTo])

  const prev = useCallback(() => {
    goTo((activeImage - 1 + images.length) % images.length, 'left')
  }, [activeImage, images.length, goTo])

  // Auto-advance
  useEffect(() => {
    autoRef.current = setInterval(next, 4000)
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [next])

  function switchService(idx: number) {
    setActiveService(idx)
    setActiveSubcat(0)
    setActiveImage(0)
  }

  function switchSubcat(idx: number) {
    setActiveSubcat(idx)
    setActiveImage(0)
  }

  return (
    <div className="w-full">
      {/* Service Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {SERVICE_CATEGORIES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => switchService(i)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
            style={{
              background: activeService === i ? '#2CB99B' : '#fff',
              color: activeService === i ? '#fff' : '#4A4A4A',
              border: `1.5px solid ${activeService === i ? '#2CB99B' : '#E2E0D9'}`,
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: activeService === i ? '0 4px 14px rgba(44,185,155,0.3)' : 'none',
              transform: activeService === i ? 'translateY(-1px)' : 'none',
            }}
          >
            <span style={{ color: activeService === i ? '#fff' : '#2CB99B' }}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{ background: '#fff', border: '1px solid #E2E0D9', boxShadow: '0 20px 60px rgba(0,0,0,0.07)' }}
      >
        <div className="grid md:grid-cols-2">
          {/* Left: Image Carousel */}
          <div className="relative overflow-hidden" style={{ minHeight: '420px', background: '#1A1A1A' }}>
            {/* Main Image */}
            <div
              className="absolute inset-0 transition-all"
              style={{
                transform: animating
                  ? `translateX(${direction === 'right' ? '-6%' : '6%'}) scale(1.04)`
                  : 'translateX(0) scale(1)',
                opacity: animating ? 0 : 1,
                transition: 'transform 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.38s ease',
              }}
            >
              <img
                src={images[activeImage]}
                alt={`${service.label} – ${subcat.label}`}
                className="w-full h-full object-cover"
                style={{ minHeight: '420px' }}
                referrerPolicy="no-referrer"
                loading="eager"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = '1';
                    target.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&auto=format&fit=crop&q=80';
                  }
                }}
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(26,26,26,0.7) 0%, transparent 55%)' }}
              />
            </div>

            {/* Nav Arrows */}
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2">
                <path d="M10 4L6 8l4 4" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > activeImage ? 'right' : 'left')}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === activeImage ? '20px' : '6px',
                    height: '6px',
                    background: i === activeImage ? '#2CB99B' : 'rgba(255,255,255,0.5)',
                  }}
                />
              ))}
            </div>

            {/* Image counter */}
            <div
              className="absolute top-4 right-4 z-10 text-xs font-medium px-3 py-1 rounded-full"
              style={{ background: 'rgba(26,26,26,0.6)', color: '#fff', backdropFilter: 'blur(8px)' }}
            >
              {activeImage + 1} / {images.length}
            </div>
          </div>

          {/* Right: Info + Subcategory tabs */}
          <div className="p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span style={{ color: '#2CB99B' }}>{service.icon}</span>
                <span className="text-xs tracking-[0.15em] uppercase font-medium" style={{ color: '#2CB99B' }}>
                  {service.label}
                </span>
              </div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#1A1A1A' }}
              >
                {subcat.label}
              </h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#4A4A4A' }}>
                Diseñamos y fabricamos {service.label.toLowerCase()} a medida, adaptados perfectamente
                a tus espacios y necesidades. Cada detalle es pensado para durar y deleitar.
              </p>

              {/* Subcategory selector */}
              {service.subcategories.length > 1 && (
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9A9890' }}>
                    Tipos disponibles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {service.subcategories.map((sub, i) => (
                      <button
                        key={i}
                        onClick={() => switchSubcat(i)}
                        className="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                        style={{
                          background: activeSubcat === i ? '#E6F7F4' : '#F7F6F2',
                          color: activeSubcat === i ? '#1E9A81' : '#4A4A4A',
                          border: `1px solid ${activeSubcat === i ? '#2CB99B' : '#E2E0D9'}`,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Thumbnail strip */}
              <div className="flex gap-2 mb-6">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i, i > activeImage ? 'right' : 'left')}
                    className="rounded-lg overflow-hidden transition-all duration-200 flex-shrink-0"
                    style={{
                      width: '56px',
                      height: '42px',
                      border: `2px solid ${i === activeImage ? '#2CB99B' : 'transparent'}`,
                      opacity: i === activeImage ? 1 : 0.55,
                      transform: i === activeImage ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.fallback) {
                          target.dataset.fallback = '1';
                          target.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=200&auto=format&fit=crop&q=80';
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onOpenCotizador ? onOpenCotizador(service.id) : null}
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-all hover:opacity-90 hover:shadow-md self-start cursor-pointer"
              style={{ background: '#2CB99B', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}
            >
              Solicitar cotización
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── COMPONENT: FilmstripCarousel ───────────────────────────────────────────────
function FilmstripCarousel({ projects }: { projects: any[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number | null>(null)
  const posRef = useRef(0)
  const pausedRef = useRef(false)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)

  // Duplicate for infinite loop
  const doubled = [...projects, ...projects]

  const SPEED = 0.6 // px per frame

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const animate = () => {
      if (!pausedRef.current) {
        posRef.current += SPEED
        const singleWidth = track.scrollWidth / 2
        if (posRef.current >= singleWidth) {
          posRef.current = 0
        }
        track.style.transform = `translateX(-${posRef.current}px)`
      }
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [projects])

  if (!projects.length) return null

  return (
    <div>
      {/* Filmstrip */}
      <div
        className="relative overflow-hidden"
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => { pausedRef.current = true }}
        onMouseLeave={() => { pausedRef.current = false }}
      >
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 z-10 w-20 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #1A1A1A, transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 z-10 w-20 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #1A1A1A, transparent)' }} />

        <div ref={trackRef} className="flex gap-4" style={{ width: 'max-content' }}>
          {doubled.map((p, i) => (
            <div
              key={i}
              onClick={() => setSelectedProject(p)}
              className="group relative rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              style={{ width: '280px', height: '210px', background: '#2a2a2a' }}
            >
              <img
                src={p.image_url}
                alt={p.label}
                className="w-full h-full object-cover"
                style={{ transition: 'transform 0.5s ease' }}
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div
                className="absolute inset-0 flex items-end p-4"
                style={{
                  background: 'linear-gradient(to top, rgba(26,26,26,0.85) 0%, transparent 55%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0' }}
              >
                <div>
                  <span className="text-xs font-semibold text-white block" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {p.label}
                  </span>
                  {p.category && (
                    <span className="text-xs mt-0.5 block" style={{ color: '#2CB99B' }}>{p.category}</span>
                  )}
                </div>
              </div>
              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                style={{ background: 'rgba(44,185,155,0.12)' }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)' }}>
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="#2CB99B" strokeWidth="1.5">
                    <path d="M10 4v12M4 10h12" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,26,26,0.92)', backdropFilter: 'blur(12px)' }}
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="relative max-w-3xl w-full rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            <img src={selectedProject.image_url} alt={selectedProject.label} className="w-full object-cover" style={{ maxHeight: '70vh' }} referrerPolicy="no-referrer" />
            <div className="p-6" style={{ background: '#1A1A1A' }}>
              <h3 className="text-white font-semibold text-xl mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {selectedProject.label}
              </h3>
              {selectedProject.category && (
                <span className="text-sm" style={{ color: '#2CB99B' }}>{selectedProject.category}</span>
              )}
            </div>
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)' }}
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── COMPONENT: StackCardCarousel ───────────────────────────────────────────────
function StackCardCarousel({ posts }: { posts: any[] }) {
  const [current, setCurrent] = useState(0)
  const [flying, setFlying] = useState(false)
  const [flyDir, setFlyDir] = useState<'left' | 'right'>('right')

  if (!posts.length) return null

  function advance(dir: 'left' | 'right') {
    if (flying) return
    setFlyDir(dir)
    setFlying(true)
    setTimeout(() => {
      setCurrent(prev =>
        dir === 'right'
          ? (prev + 1) % posts.length
          : (prev - 1 + posts.length) % posts.length
      )
      setFlying(false)
    }, 400)
  }

  // Show up to 3 stacked cards
  const visible = [0, 1, 2].map(offset => posts[(current + offset) % posts.length])

  return (
    <div className="w-full">
      <div className="relative flex justify-center" style={{ height: '520px' }}>
        {/* Stack cards (back to front) */}
        {visible.slice().reverse().map((post, revIdx) => {
          const idx = 2 - revIdx // 0=front, 1=mid, 2=back
          const isTop = idx === 0
          const offset = idx * 12
          const scale = 1 - idx * 0.04
          const zIndex = 10 - idx

          return (
            <div
              key={`${post.title}-${idx}`}
              className="absolute rounded-2xl overflow-hidden"
              style={{
                width: '100%',
                maxWidth: '640px',
                top: `${offset}px`,
                transform: isTop && flying
                  ? `scale(${scale}) translateX(${flyDir === 'right' ? '-110%' : '110%'}) rotate(${flyDir === 'right' ? '-8deg' : '8deg'})`
                  : `scale(${scale})`,
                zIndex,
                transition: isTop
                  ? 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease'
                  : 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
                opacity: isTop && flying ? 0 : (1 - idx * 0.15),
                background: '#fff',
                border: '1px solid #E2E0D9',
                boxShadow: isTop
                  ? '0 20px 60px rgba(0,0,0,0.12)'
                  : '0 10px 30px rgba(0,0,0,0.06)',
                cursor: isTop ? 'default' : 'pointer',
                transformOrigin: 'top center',
              }}
              onClick={() => { if (!isTop) advance('right') }}
            >
              {/* Image */}
              <div className="overflow-hidden" style={{ height: '240px', background: '#E6F7F4' }}>
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  style={{
                    transition: 'transform 0.5s ease',
                    filter: !isTop ? 'brightness(0.7)' : 'none',
                  }}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              {/* Content */}
              {isTop && (
                <div className="p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: '#E6F7F4', color: '#2CB99B', fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {post.category?.name}
                    </span>
                    <span className="text-xs" style={{ color: '#9A9890' }}>
                      {post.published_at} · {post.read_time} lectura
                    </span>
                  </div>
                  <h3
                    className="font-semibold text-xl mb-3 leading-snug"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#1A1A1A' }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#4A4A4A' }}>
                    {post.excerpt}
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium" style={{ color: '#2CB99B' }}>
                    Leer artículo
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <button
          onClick={() => advance('left')}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: '#fff', border: '1.5px solid #E2E0D9', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="#1A1A1A" strokeWidth="2">
            <path d="M10 4L6 8l4 4" />
          </svg>
        </button>

        {/* Progress dots */}
        <div className="flex gap-2">
          {posts.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? '24px' : '6px',
                height: '6px',
                background: i === current ? '#2CB99B' : '#E2E0D9',
              }}
            />
          ))}
        </div>

        <button
          onClick={() => advance('right')}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: '#2CB99B', border: '1.5px solid #2CB99B', boxShadow: '0 4px 14px rgba(44,185,155,0.3)' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      </div>

      {/* Counter */}
      <p className="text-center mt-4 text-xs" style={{ color: '#9A9890', fontFamily: "'DM Sans', sans-serif" }}>
        {current + 1} de {posts.length} artículos
      </p>
    </div>
  )
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  // Cotizador Modal State
  const [isCotizadorOpen, setIsCotizadorOpen] = useState(false)
  const [initialCotizadorService, setInitialCotizadorService] = useState<string | undefined>(undefined)

  const openCotizador = (serviceId?: string) => {
    setInitialCotizadorService(serviceId)
    setIsCotizadorOpen(true)
  }

  // Legal Modal State
  const [legalModal, setLegalModal] = useState<LegalModalType | null>(null)

  const [services, setServices] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        const [s, p, b] = await Promise.all([
          api.getServices(),
          api.getProjects(),
          api.getPosts(),
        ])
        setServices(s)
        setProjects(p)
        setPosts(b)
      } catch (e) {
        console.error('Error loading data', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.submitLead(form)
      setSent(true)
      setForm({ name: '', email: '', message: '' })
      setTimeout(() => setSent(false), 4000)
    } catch (e: any) {
      alert(e.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F6F2' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#2CB99B' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F2', color: '#1A1A1A', fontFamily: "'Outfit', sans-serif" }}>

      {/* ─── NAVBAR ─── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(247,246,242,0.96)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid #E2E0D9' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: '72px' }}>
          <a href="#inicio" className="flex items-center gap-3">
            <img src={logo} alt="Jayka Creando Espacios" className="h-12 w-12 rounded-full object-cover" />
            <div style={{ lineHeight: 1.1 }}>
              <div className="font-semibold text-base tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif", color: '#1A1A1A' }}>
                Jayka
              </div>
              <div className="text-xs tracking-widest uppercase" style={{ color: '#2CB99B', letterSpacing: '0.12em' }}>
                Creando Espacios
              </div>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium transition-colors duration-200 hover:text-[#2CB99B]"
                style={{ color: scrolled ? '#1A1A1A' : '#fff', textShadow: scrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.4)' }}
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => openCotizador()}
              className="text-sm font-semibold px-4 py-2 rounded-full border transition-all duration-200 hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-xs"
              style={{
                borderColor: '#2CB99B',
                color: scrolled ? '#2CB99B' : '#fff',
                background: scrolled ? 'rgba(44,185,155,0.08)' : 'rgba(255,255,255,0.15)',
                fontFamily: "'DM Sans', sans-serif"
              }}
            >
              <span>Cotizador</span>
            </button>
            <a
              href="#contacto"
              className="text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:opacity-90 hover:shadow-md"
              style={{ background: '#2CB99B', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}
            >
              Contacto
            </a>
          </nav>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
            <div className="w-6 flex flex-col gap-1.5">
              <span className="block h-0.5 rounded" style={{ background: scrolled ? '#1A1A1A' : '#fff' }} />
              <span className="block h-0.5 rounded" style={{ background: scrolled ? '#1A1A1A' : '#fff', width: '75%' }} />
              <span className="block h-0.5 rounded" style={{ background: scrolled ? '#1A1A1A' : '#fff', width: '50%' }} />
            </div>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 pb-6 pt-2" style={{ background: 'rgba(247,246,242,0.98)' }}>
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-sm font-medium border-b"
                style={{ borderColor: '#E2E0D9', color: '#1A1A1A' }}
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => { setMenuOpen(false); openCotizador(); }}
              className="mt-4 w-full text-center text-sm font-semibold px-5 py-3 rounded-full border border-[#2CB99B] text-[#2CB99B] bg-[#2CB99B]/10 cursor-pointer"
            >
              Cotizar en Línea
            </button>
            <a
              href="#contacto"
              onClick={() => setMenuOpen(false)}
              className="mt-2 block text-center text-sm font-semibold px-5 py-3 rounded-full"
              style={{ background: '#2CB99B', color: '#fff' }}
            >
              Contacto
            </a>
          </div>
        )}
      </header>

      {/* ─── HERO ─── */}
      <section id="inicio" className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '100vh' }}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1920&h=1080&fit=crop&auto=format')` }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(26,26,26,0.72) 0%, rgba(26,26,26,0.45) 60%, rgba(44,185,155,0.18) 100%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-white" style={{ paddingTop: '96px' }}>
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="h-px w-12" style={{ background: '#2CB99B' }} />
            <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: '#2CB99B' }}>
              Villavicencio, Meta · Colombia
            </span>
          </div>
          <h1
            className="font-bold leading-tight mb-6"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.02em' }}
          >
            Diseño, fabricación
            <br />
            <span style={{ color: '#2CB99B' }}>e instalación</span> de
            <br />
            mobiliario a medida
          </h1>
          <p className="text-lg mb-10 max-w-xl font-light" style={{ color: 'rgba(255,255,255,0.82)' }}>
            Transformamos madera en arquitectura interior. Cada pieza es única,
            cada espacio cuenta una historia.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#proyectos"
              className="px-8 py-4 rounded-full text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: '#2CB99B', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}
            >
              Ver proyectos
            </a>
            <button
              onClick={() => openCotizador()}
              className="px-8 py-4 rounded-full text-sm font-semibold transition-all hover:bg-white hover:text-[#1A1A1A] cursor-pointer"
              style={{ border: '1.5px solid rgba(255,255,255,0.6)', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}
            >
              Solicitar cotización
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <span className="text-xs tracking-widest text-white uppercase">Scroll</span>
          <div className="w-px h-12 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div className="absolute top-0 w-full animate-bounce" style={{ height: '40%', background: '#2CB99B' }} />
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="servicios" className="py-28" style={{ background: '#F7F6F2' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10" style={{ background: '#2CB99B' }} />
              <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: '#2CB99B' }}>
                Nuestros servicios
              </span>
            </div>
            <h2
              className="font-bold mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.02em' }}
            >
              Calidad · Diseño · Funcionalidad
            </h2>
            <p className="text-base max-w-xl" style={{ color: '#4A4A4A' }}>
              Explora cada categoría y descubre las posibilidades de diseño que tenemos para tu espacio.
            </p>
          </div>

          <ServiceCarousel onOpenCotizador={openCotizador} />
        </div>
      </section>

      {/* ─── PROJECTS (FILMSTRIP) ─── */}
      <section id="proyectos" style={{ background: '#1A1A1A', padding: '7rem 0' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-10" style={{ background: '#2CB99B' }} />
                <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: '#2CB99B' }}>
                  Galería de proyectos
                </span>
              </div>
              <h2
                className="font-bold"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#fff', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', letterSpacing: '-0.02em' }}
              >
                Cada proyecto, una obra única
              </h2>
              <p className="mt-3 text-sm max-w-md" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Pasa el cursor para pausar · Haz clic en una imagen para ampliarla
              </p>
            </div>
            <a
              href="#contacto"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: '#2CB99B', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}
            >
              Solicitar proyecto →
            </a>
          </div>

          {projects.length > 0 ? (
            <FilmstripCarousel projects={projects} />
          ) : (
            /* Fallback static filmstrip with placeholder images */
            <FilmstripCarousel projects={[
              { image_url: 'https://hips.hearstapps.com/hmg-prod/images/cocina-madera-estudio-nualart-65d883cc0c775.jpg?crop=1xw:1xh;center,top', label: 'Cocina Moderna', category: 'Cocinas' },
              { image_url: 'https://i.pinimg.com/736x/27/a8/25/27a825ef1c2cf3de1ee08416dbb598e4.jpg', label: 'Closet Premium', category: 'Closets' },
              { image_url: 'https://i.pinimg.com/736x/62/38/14/62381467849ea6ad0f03e5011b682bca.jpg', label: 'Sala Principal', category: 'Entretenimiento' },
              { image_url: 'https://i.pinimg.com/736x/c2/54/d6/c254d63d421fcf292b0d8f26fb1bc084.jpg', label: 'Oficina Ejecutiva', category: 'Oficinas' },
              { image_url: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=900&h=600&fit=crop&q=80', label: 'Cocina en L', category: 'Cocinas' },
              { image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=560&h=420&fit=crop', label: 'Living Moderno', category: 'Sala' },
            ]} />
          )}
        </div>
      </section>

      {/* ─── BRAND STRIP ─── */}
      <div className="py-10 flex items-center justify-center gap-16 flex-wrap px-6" style={{ background: '#2CB99B' }}>
        {['Calidad garantizada', 'Diseño exclusivo', 'Instalación incluida', 'Atención personalizada'].map(t => (
          <div key={t} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.25)' }}>
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 6l3 3 5-5" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>{t}</span>
          </div>
        ))}
      </div>

      {/* ─── BLOG (STACK CARDS) ─── */}
      <section id="blog" className="py-28" style={{ background: '#F7F6F2' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-10" style={{ background: '#2CB99B' }} />
                <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: '#2CB99B' }}>
                  Revista Jayka
                </span>
              </div>
              <h2
                className="font-bold"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', letterSpacing: '-0.02em' }}
              >
                Ideas, proyectos y tendencias
              </h2>
            </div>
            <a href="#blog" className="text-sm font-medium" style={{ color: '#2CB99B' }}>
              Ver todos los artículos →
            </a>
          </div>

          {posts.length > 0 ? (
            <StackCardCarousel posts={posts} />
          ) : (
            <StackCardCarousel posts={[
              {
                title: 'Tendencias en cocinas 2026',
                excerpt: 'Las cocinas modernas apuestan por materiales naturales, islas funcionales y colores tierra que aportan calidez y distinción.',
                image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=480&fit=crop',
                category: { name: 'Cocinas' },
                published_at: 'Sep 2026',
                read_time: '4 min',
              },
              {
                title: 'Cómo elegir el closet perfecto',
                excerpt: 'El almacenamiento inteligente transforma tu habitación. Te guiamos para elegir entre sistemas corredizos, abatibles y walk-in.',
                image_url: 'https://images.unsplash.com/photo-1558997519-83ea9252eeb8?w=800&h=480&fit=crop',
                category: { name: 'Closets' },
                published_at: 'Ago 2026',
                read_time: '5 min',
              },
              {
                title: 'Diseño de oficinas en casa',
                excerpt: 'El home office llegó para quedarse. Descubre cómo crear un espacio productivo y elegante con mobiliario a medida.',
                image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=480&fit=crop',
                category: { name: 'Oficinas' },
                published_at: 'Jul 2026',
                read_time: '6 min',
              },
              {
                title: 'Madera natural vs MDF: ¿cuál elegir?',
                excerpt: 'Analizamos los pros y contras de los materiales más usados en carpintería a medida para ayudarte a tomar la mejor decisión.',
                image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=480&fit=crop',
                category: { name: 'Tips' },
                published_at: 'Jun 2026',
                read_time: '3 min',
              },
            ]} />
          )}
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contacto" style={{ background: '#fff', padding: '7rem 0' }}>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10" style={{ background: '#2CB99B' }} />
              <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: '#2CB99B' }}>
                Hablemos
              </span>
            </div>
            <h2
              className="font-bold mb-6"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', letterSpacing: '-0.02em' }}
            >
              ¿Listo para transformar tu espacio?
            </h2>
            <p className="mb-8 text-base leading-relaxed" style={{ color: '#4A4A4A' }}>
              Cuéntanos tu proyecto. Nuestro equipo en Villavicencio te acompañará
              desde el diseño hasta la instalación de cada pieza.
            </p>

            <div className="space-y-5">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M10 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                      <path d="M10 2a7 7 0 00-7 7c0 5.25 7 11 7 11s7-5.75 7-11a7 7 0 00-7-7z" />
                    </svg>
                  ),
                  label: 'Villavicencio, Meta, Colombia',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 4a1 1 0 011-1h14a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" />
                      <path d="M2 4l8 7 8-7" />
                    </svg>
                  ),
                  label: 'facturacionjayka@gmail.com',
                  href: 'mailto:facturacionjayka@gmail.com',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.05 1.74l-.483.145a1 1 0 00-.657.9 8 8 0 004.178 4.178 1 1 0 00.9-.657l.145-.483a1.5 1.5 0 011.74-1.05l3.223.716A1.5 1.5 0 0118 13.352V14.5a1.5 1.5 0 01-1.5 1.5h-.5C7.045 16 2 10.955 2 4.5v-.5z" />
                    </svg>
                  ),
                  label: '@jayka_creando_espacios',
                  href: 'https://www.instagram.com/jayka_creando_espacios?igsi=MWFudDg3d3p1M2hvZA%3D%3D&utm_source=qr',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#E6F7F4', color: '#2CB99B' }}>
                    {item.icon}
                  </div>
                  {item.href ? (
                    <a href={item.href} className="text-sm hover:text-[#2CB99B] transition-colors" style={{ color: '#1A1A1A' }}>
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-sm" style={{ color: '#1A1A1A' }}>{item.label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl p-8 space-y-5" style={{ background: '#F7F6F2', border: '1px solid #E2E0D9' }}>
            {sent && (
              <div className="rounded-xl p-4 text-sm font-medium" style={{ background: '#E6F7F4', color: '#1E9A81' }}>
                ¡Mensaje enviado! Te contactaremos pronto.
              </div>
            )}
            {[
              { label: 'Nombre', type: 'text', key: 'name', placeholder: 'Tu nombre completo' },
              { label: 'Correo electrónico', type: 'email', key: 'email', placeholder: 'tu@correo.com' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#4A4A4A', fontFamily: "'DM Sans', sans-serif" }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  required
                  value={(form as any)[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: '#fff', border: '1.5px solid #E2E0D9', color: '#1A1A1A', fontFamily: "'Outfit', sans-serif" }}
                  onFocus={e => (e.target.style.borderColor = '#2CB99B')}
                  onBlur={e => (e.target.style.borderColor = '#E2E0D9')}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#4A4A4A', fontFamily: "'DM Sans', sans-serif" }}>
                Mensaje
              </label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Cuéntanos sobre tu proyecto..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                style={{ background: '#fff', border: '1.5px solid #E2E0D9', color: '#1A1A1A', fontFamily: "'Outfit', sans-serif" }}
                onFocus={e => (e.target.style.borderColor = '#2CB99B')}
                onBlur={e => (e.target.style.borderColor = '#E2E0D9')}
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: '#2CB99B', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}
            >
              Enviar mensaje
            </button>
          </form>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: '#1A1A1A', color: '#fff', padding: '5rem 0 2.5rem' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <img src={logo} alt="Jayka" className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-base" style={{ fontFamily: "'DM Sans', sans-serif" }}>Jayka Creando Espacios</div>
                  <div className="text-xs tracking-widest uppercase mt-0.5" style={{ color: '#2CB99B' }}>Diseño de Interior y Carpintería</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Estudio de diseño de interiores y carpintería a medida en Villavicencio, Meta.
                Transformamos espacios con calidad, diseño y funcionalidad.
              </p>
              <div className="mt-6 flex gap-4">
                <a href="https://www.instagram.com/jayka_creando_espacios?igsi=MWFudDg3d3p1M2hvZA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.08)' }} aria-label="Instagram">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4.5" />
                    <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
                  </svg>
                </a>
                <a href="https://www.tiktok.com/@jaykacreandoespacios?_r=1&_t=ZS-99SRN1fi96g" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.08)' }} aria-label="TikTok">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </a>
                <a href="https://wa.me/573124937069" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.08)' }} aria-label="WhatsApp">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.107.547 4.085 1.505 5.804L.057 23.428a.5.5 0 00.617.602l5.752-1.427A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.939 0-3.756-.5-5.33-1.37l-.38-.214-3.945.978.995-3.85-.235-.39A9.962 9.962 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#2CB99B', fontFamily: "'DM Sans', sans-serif" }}>
                Servicios
              </h4>
              <ul className="space-y-3">
                {SERVICE_CATEGORIES.map(s => (
                  <li key={s.id}>
                    <a href="#servicios" className="text-sm transition-colors hover:text-[#2CB99B]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#2CB99B', fontFamily: "'DM Sans', sans-serif" }}>
                Contacto
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:facturacionjayka@gmail.com" className="text-sm transition-colors hover:text-[#2CB99B]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    facturacionjayka@gmail.com
                  </a>
                </li>
                <li className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Villavicencio, Meta<br />Colombia
                </li>
                <li>
                  <a href="https://wa.me/573124937069" className="text-sm transition-colors hover:text-[#2CB99B]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              © 2026 Jayka Creando Espacios. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-5">
              <button
                id="footer-terms-btn"
                onClick={() => setLegalModal('terms')}
                className="text-xs transition-colors hover:text-[#2CB99B] cursor-pointer bg-transparent border-none p-0"
                style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Sans', sans-serif" }}
              >
                Términos y Condiciones
              </button>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <button
                id="footer-privacy-btn"
                onClick={() => setLegalModal('privacy')}
                className="text-xs transition-colors hover:text-[#2CB99B] cursor-pointer bg-transparent border-none p-0"
                style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Sans', sans-serif" }}
              >
                Tratamiento de Datos
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── WHATSAPP FLOAT ─── */}
      <a
        href="https://wa.me/573124937069?text=Hola%2C%20quiero%20más%20información%20sobre%20sus%20servicios"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed z-50 flex items-center gap-3 group"
        style={{ bottom: '28px', right: '28px' }}
        aria-label="Chat por WhatsApp"
      >
        <div
          className="text-xs font-medium px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0 pointer-events-none"
          style={{ background: '#1A1A1A', color: '#fff', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}
        >
          ¿Hablamos por WhatsApp?
        </div>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
          style={{ background: '#2CB99B' }}
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.107.547 4.085 1.505 5.804L.057 23.428a.5.5 0 00.617.602l5.752-1.427A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.939 0-3.756-.5-5.33-1.37l-.38-.214-3.945.978.995-3.85-.235-.39A9.962 9.962 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          </svg>
        </div>
      </a>

      {/* ─── MODAL COTIZADOR ─── */}
      <CotizadorModal
        isOpen={isCotizadorOpen}
        onClose={() => setIsCotizadorOpen(false)}
        initialServiceId={initialCotizadorService}
      />

      {/* ─── MODALES LEGALES ─── */}
      {legalModal && (
        <LegalModal
          type={legalModal}
          isOpen={legalModal !== null}
          onClose={() => setLegalModal(null)}
        />
      )}
    </div>
  )
}
