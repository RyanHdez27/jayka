import { useEffect, useRef } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────
export type LegalModalType = 'terms' | 'privacy'

interface LegalModalProps {
  type: LegalModalType
  isOpen: boolean
  onClose: () => void
}

// ─── Content ─────────────────────────────────────────────────────────────────
const CONTENT = {
  terms: {
    title: 'Términos y Condiciones',
    subtitle: 'Última actualización: octubre de 2026',
    sections: [
      {
        heading: '1. Aceptación de los Términos',
        body: `Al acceder y utilizar el sitio web de Jayka Creando Espacios (en adelante "el Sitio"), usted acepta quedar vinculado por los presentes Términos y Condiciones de Uso. Si no está de acuerdo con alguno de estos términos, le solicitamos que se abstenga de utilizar el Sitio.`,
      },
      {
        heading: '2. Descripción del Servicio',
        body: `Jayka Creando Espacios es un estudio de diseño de interiores y carpintería a medida con sede en Villavicencio, Meta, Colombia. A través de este Sitio, los usuarios pueden conocer nuestros servicios, visualizar proyectos, leer contenido editorial y solicitar cotizaciones o información de contacto.`,
      },
      {
        heading: '3. Propiedad Intelectual',
        body: `Todo el contenido publicado en este Sitio —incluyendo textos, imágenes, logotipos, diseños y código fuente— es propiedad exclusiva de Jayka Creando Espacios o de sus respectivos titulares, y está protegido por las leyes colombianas e internacionales de derechos de autor y propiedad intelectual. Queda prohibida su reproducción, distribución o modificación sin autorización expresa y por escrito.`,
      },
      {
        heading: '4. Uso Aceptable',
        body: `El usuario se compromete a utilizar el Sitio únicamente con fines lícitos y de manera que no infrinja los derechos de terceros ni restrinja o impida el uso del Sitio por parte de otros. Está expresamente prohibido: (a) transmitir cualquier contenido ilegal, difamatorio o fraudulento; (b) intentar acceder de forma no autorizada a cualquier parte del Sitio o sus sistemas; (c) usar el Sitio para enviar comunicaciones comerciales no solicitadas (spam).`,
      },
      {
        heading: '5. Limitación de Responsabilidad',
        body: `Jayka Creando Espacios no garantiza que el Sitio esté libre de errores, interrupciones o virus. En la medida permitida por la ley colombiana, no seremos responsables de daños directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso del Sitio.`,
      },
      {
        heading: '6. Modificaciones',
        body: `Nos reservamos el derecho de modificar estos Términos en cualquier momento. Las modificaciones entrarán en vigor desde el momento de su publicación en el Sitio. Le recomendamos revisar periódicamente esta página para mantenerse informado.`,
      },
      {
        heading: '7. Legislación Aplicable',
        body: `Estos Términos se rigen por las leyes de la República de Colombia. Cualquier controversia será sometida a los jueces competentes de Villavicencio, Meta, renunciando expresamente a cualquier otro fuero que pudiera corresponder.`,
      },
      {
        heading: '8. Contacto',
        body: `Para cualquier consulta relacionada con estos Términos, puede escribirnos a: facturacionjayka@gmail.com`,
      },
    ],
  },
  privacy: {
    title: 'Política de Tratamiento de Datos Personales',
    subtitle: 'Última actualización: octubre de 2026 · Ley 1581 de 2012 y Decreto 1377 de 2013',
    sections: [
      {
        heading: '1. Responsable del Tratamiento',
        body: `El responsable del tratamiento de datos personales es Jayka Creando Espacios, con domicilio en Villavicencio, Meta, Colombia. Contacto: facturacionjayka@gmail.com`,
      },
      {
        heading: '2. Datos que Recopilamos',
        body: `Recopilamos únicamente los datos que usted nos proporciona voluntariamente a través del formulario de contacto: nombre completo, dirección de correo electrónico y el contenido del mensaje. No recopilamos datos sensibles en el sentido del artículo 5 de la Ley 1581 de 2012.`,
      },
      {
        heading: '3. Finalidades del Tratamiento',
        body: `Los datos personales recopilados serán utilizados para las siguientes finalidades: (a) Atender su solicitud de información o cotización; (b) Enviar comunicaciones relacionadas con el servicio solicitado; (c) Mejorar nuestros servicios a partir de los requerimientos recibidos. No utilizaremos sus datos para campañas publicitarias de terceros sin su consentimiento previo.`,
      },
      {
        heading: '4. Base Legal del Tratamiento',
        body: `El tratamiento de sus datos se realiza sobre la base de su consentimiento libre, previo, expreso e informado, otorgado al momento de diligenciar y enviar el formulario de contacto, de conformidad con lo establecido en la Ley 1581 de 2012 y el Decreto Reglamentario 1377 de 2013.`,
      },
      {
        heading: '5. Transferencia y Transmisión de Datos',
        body: `Jayka Creando Espacios no vende, alquila ni comparte su información personal con terceros, salvo en los casos expresamente autorizados por usted o cuando sea requerido por autoridad competente en el marco de la ley colombiana.`,
      },
      {
        heading: '6. Derechos del Titular',
        body: `De conformidad con la Ley 1581 de 2012, usted tiene derecho a: (a) Conocer, actualizar y rectificar sus datos personales; (b) Solicitar prueba del consentimiento otorgado; (c) Ser informado sobre el uso dado a sus datos; (d) Presentar quejas ante la Superintendencia de Industria y Comercio (SIC); (e) Revocar el consentimiento y solicitar la supresión de sus datos, siempre que no exista un deber legal o contractual de conservarlos.`,
      },
      {
        heading: '7. Mecanismo para Ejercer sus Derechos',
        body: `Para ejercer cualquiera de los derechos descritos, envíe una solicitud escrita a facturacionjayka@gmail.com indicando: su nombre completo, número de identificación, datos de contacto, descripción clara de los datos objeto de la solicitud y la finalidad de la misma. Daremos respuesta en los términos establecidos por la ley (máximo 15 días hábiles para consultas y 15 días hábiles para reclamos).`,
      },
      {
        heading: '8. Conservación de los Datos',
        body: `Los datos personales serán conservados durante el tiempo necesario para cumplir con la finalidad para la que fueron recopilados y, en todo caso, mientras subsista la obligación legal o contractual de conservarlos.`,
      },
      {
        heading: '9. Seguridad',
        body: `Implementamos medidas técnicas, administrativas y físicas razonables para proteger su información personal contra acceso no autorizado, pérdida o divulgación. Sin embargo, ningún sistema de transmisión de datos por Internet puede garantizar una seguridad del 100%.`,
      },
      {
        heading: '10. Cambios en la Política',
        body: `Nos reservamos el derecho a modificar esta Política en cualquier momento. Los cambios serán notificados a través del Sitio y entrarán en vigor a partir de su publicación.`,
      },
    ],
  },
}

// ─── Component ────────────────────────────────────────────────────────────────
export function LegalModal({ type, isOpen, onClose }: LegalModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const content = CONTENT[type]

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(26,26,26,0.75)', backdropFilter: 'blur(10px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      {/* Sheet / Dialog */}
      <div
        className="relative w-full sm:max-w-2xl flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{
          background: '#fff',
          maxHeight: '92vh',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
          animation: 'legalSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
      >
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 px-8 pt-8 pb-6 border-b"
          style={{ borderColor: '#E2E0D9' }}
        >
          {/* Accent bar */}
          <div className="w-10 h-1 rounded-full mb-5" style={{ background: '#2CB99B' }} />

          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="legal-modal-title"
                className="font-bold text-2xl leading-tight"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#1A1A1A' }}
              >
                {content.title}
              </h2>
              <p className="text-xs mt-1.5" style={{ color: '#9A9890' }}>
                {content.subtitle}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-gray-100"
              style={{ border: '1.5px solid #E2E0D9' }}
              aria-label="Cerrar"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="#1A1A1A" strokeWidth="2">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 px-8 py-6" style={{ scrollbarWidth: 'thin' }}>
          <div className="space-y-7">
            {content.sections.map((section, i) => (
              <div key={i}>
                <h3
                  className="font-semibold text-sm mb-2"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#2CB99B' }}
                >
                  {section.heading}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: '#4A4A4A' }}
                >
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom spacer */}
          <div className="h-4" />
        </div>

        {/* ── Footer / CTA ── */}
        <div
          className="flex-shrink-0 px-8 py-5 border-t flex items-center justify-between gap-4"
          style={{ borderColor: '#E2E0D9', background: '#FAFAF8' }}
        >
          <p className="text-xs" style={{ color: '#9A9890' }}>
            Si tienes dudas, escríbenos a{' '}
            <a
              href="mailto:facturacionjayka@gmail.com"
              className="underline underline-offset-2 hover:text-[#2CB99B] transition-colors"
              style={{ color: '#4A4A4A' }}
            >
              facturacionjayka@gmail.com
            </a>
          </p>
          <button
            onClick={onClose}
            className="flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 hover:shadow-md"
            style={{
              background: '#2CB99B',
              color: '#fff',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Entendido
          </button>
        </div>
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes legalSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  )
}
