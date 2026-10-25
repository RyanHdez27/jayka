/**
 * JaykaCotizadorPage.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Cotizador de Jayka Creando Espacios — wizard de 5 pasos.
 *
 *   Paso 1 → Datos del cliente
 *   Paso 2 → Servicios + medidas
 *   Paso 3 → Nivel de calidad
 *   Paso 4 → Condiciones adicionales
 *   Paso 5 → Resultado + PDF + WhatsApp
 *
 * Branding: verde #2CB99B · DM Sans · Villavicencio, Meta
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  User,
  Phone,
  Mail,
  Ruler,
  Sparkles,
  AlertTriangle,
  Wrench,
  Truck,
  Calculator,
  FileDown,
  PhoneCall,
  X,
} from 'lucide-react';
import { calculateQuotation } from './useJaykaCalculator';
import { jaykaServices, DIFFICULTY_FACTORS } from './jaykaPricingData';
import { saveQuotationToLaravel } from './saveQuotationToLaravel';
import type {
  JaykaCategory,
  QualityTier,
  DifficultyLevel,
  QuotationResult,
} from './jayka.types';

// ── Helpers ──────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);

const TOTAL_STEPS = 5;

// ── Constantes de UI ─────────────────────────────────────────────────

const BRAND = '#2CB99B';
const BRAND_DARK = '#1e9e84';

const QUALITY_OPTIONS: { value: QualityTier; label: string; desc: string; color: string }[] = [
  {
    value: 'baja',
    label: 'Estándar',
    desc: 'MDF liso, herrajes básicos — excelente relación costo-beneficio',
    color: '#06D6A0',
  },
  {
    value: 'media',
    label: 'Premium',
    desc: 'Enchape de madera real, herrajes europeos',
    color: '#2CB99B',
  },
  {
    value: 'alta',
    label: 'Luxury',
    desc: 'Madera maciza o lacado, herrajes importados de alta gama',
    color: '#1e3a5f',
  },
];

const DIFFICULTY_OPTIONS: {
  value: DifficultyLevel;
  label: string;
  desc: string;
  factor: string;
}[] = [
  { value: 'normal', label: 'Acceso normal', desc: 'Sin restricciones de acceso', factor: '+0%' },
  {
    value: 'moderada',
    label: 'Acceso moderado',
    desc: 'Pisos altos sin ascensor, espacios reducidos',
    factor: '+10%',
  },
  {
    value: 'alta',
    label: 'Acceso difícil',
    desc: 'Obra nueva, zonas muy restringidas',
    factor: '+20%',
  },
];

// Servicios con m² propio (independiente del área global)
const CUSTOM_AREA_SERVICES: JaykaCategory[] = ['cocina', 'closets', 'banos', 'vestier'];

// ════════════════════════════════════════════════════════════════════
//  SUB-COMPONENTES
// ════════════════════════════════════════════════════════════════════

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function InputField({
  icon,
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  dataTour,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  dataTour?: string;
}) {
  return (
    <div data-tour={dataTour}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          style={{ color: BRAND }}
        >
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white outline-none transition-all text-sm focus:border-[#2CB99B] focus:ring-2 focus:ring-[#2CB99B]/20"
        />
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  desc,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
        checked
          ? 'border-[#2CB99B] bg-[#2CB99B]/5'
          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          checked ? 'text-white' : 'bg-gray-200 text-gray-400'
        }`}
        style={checked ? { backgroundColor: BRAND } : {}}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className={`font-semibold text-sm ${checked ? 'text-[#2CB99B]' : 'text-gray-700'}`}>
          {label}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
      </div>
      <div
        className={`w-10 h-6 rounded-full p-0.5 transition-all duration-300 ${
          checked ? 'bg-[#2CB99B]' : 'bg-gray-300'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
    </button>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-sm ${accent ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
        {label}
      </span>
      <span
        className={`text-sm font-semibold ${accent ? 'text-lg' : 'text-gray-800'}`}
        style={accent ? { color: BRAND } : {}}
      >
        {value}
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════════════

interface JaykaCotizadorPageProps {
  /** Cuando está en modo modal, muestra el botón X para cerrar */
  onClose?: () => void;
}

export default function JaykaCotizadorPage({ onClose }: JaykaCotizadorPageProps) {
  // ── Wizard ─────────────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // Paso 1
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [wantsContact, setWantsContact] = useState(false);

  // Paso 2
  const [selectedServices, setSelectedServices] = useState<JaykaCategory[]>([]);
  const [areaM2, setAreaM2] = useState<number>(0);
  const [serviceAreas, setServiceAreas] = useState<Partial<Record<JaykaCategory, number>>>({});
  const [unitCount, setUnitCount] = useState<number>(1); // para puertas

  // Paso 3
  const [qualityTier, setQualityTier] = useState<QualityTier>('media');

  // Paso 4
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('normal');
  const [includesDismantling, setIncludesDismantling] = useState(false);
  const [includesDebrisRemoval, setIncludesDebrisRemoval] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Resultado
  const [result, setResult] = useState<QuotationResult | null>(null);

  // ── Validación de paso ────────────────────────────────────────
  const canProceed = useCallback(() => {
    switch (step) {
      case 1:
        return clientName.trim() !== '' && clientPhone.trim() !== '';
      case 2: {
        if (selectedServices.length === 0 || areaM2 <= 0) return false;
        const missingCustom = selectedServices
          .filter((id) => CUSTOM_AREA_SERVICES.includes(id))
          .some((id) => !(serviceAreas[id] && serviceAreas[id]! > 0));
        if (missingCustom) return false;
        if (selectedServices.includes('puertas') && unitCount < 1) return false;
        return true;
      }
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  }, [step, clientName, clientPhone, selectedServices, areaM2, serviceAreas, unitCount]);

  const goNext = () => {
    if (step === 4) {
      const res = calculateQuotation({
        selectedServices,
        areaM2,
        serviceAreas,
        unitCount,
        qualityTier,
        difficulty,
        includesDismantling,
        includesDebrisRemoval,
      });
      setResult(res);
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const toggleService = (id: JaykaCategory) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  // ── Mensaje WhatsApp (cliente → Jayka) ───────────────────────
  const buildWhatsAppMessage = () => {
    if (!result) return '';
    const services = result.lineItems.map((li) => `• ${li.service}`).join('\n');
    return (
      `✅ *Cotización — Jayka Creando Espacios*\n\n` +
      `Hola equipo Jayka, acabo de descargar mi cotización:\n\n` +
      `👤 *${clientName}*\n📞 ${clientPhone}\n` +
      (projectLocation ? `📍 ${projectLocation}\n` : '') +
      `📐 ${areaM2} m²\n\n` +
      `*Servicios:*\n${services}\n\n` +
      `💰 *Total estimado: ${fmt(result.grandTotal)}*\n\n` +
      `Me gustaría agendar una visita para confirmar el presupuesto.`
    );
  };

  // ── Notificación interna al equipo Jayka ─────────────────────
  const notifyBusinessWhatsApp = () => {
    if (!result) return;
    const services = result.lineItems.map((li) => `• ${li.service}`).join('\n');
    const msg =
      `🔔 *Nueva cotización — jayka.com*\n\n` +
      `👤 *Cliente:* ${clientName}\n` +
      `📞 *Teléfono:* ${clientPhone}\n` +
      (clientEmail ? `✉️ *Email:* ${clientEmail}\n` : '') +
      (projectLocation ? `📍 *Ubicación:* ${projectLocation}\n` : '') +
      `\n*Servicios cotizados:*\n${services}\n\n` +
      `💰 *Total:* ${fmt(result.grandTotal)}\n\n` +
      (wantsContact
        ? `✅ *El cliente DESEA ser contactado al:* ${clientPhone}`
        : `⏸ El cliente no solicitó contacto directo.`);
    window.open(`https://wa.me/573124937069?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ── Generación de PDF ─────────────────────────────────────────
  const generatePDF = async () => {
    if (!result) return;
    const doc = new jsPDF();

    // Logo (carga desde public/images)
    try {
      const resp = await fetch('/images/jayka-logo.png');
      if (resp.ok) {
        const blob = await resp.blob();
        const logoDataUrl = await new Promise<string>((res) => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result as string);
          reader.readAsDataURL(blob);
        });
        doc.addImage(logoDataUrl, 'PNG', 155, 6, 42, 22);
      }
    } catch {
      /* continuar sin logo */
    }

    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(44, 185, 155); // #2CB99B
    doc.text('Cotización de Proyecto', 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text('Jayka Creando Espacios', 14, 28);
    doc.text('Mobiliario a medida · Cocinas · Closets · Puertas · Vestier', 14, 33);
    doc.setTextColor(130, 130, 130);
    doc.text(
      'WhatsApp: +57 312 493 7069  |  facturacionjayka@gmail.com  |  Villavicencio, Meta',
      14,
      38,
    );

    doc.setDrawColor(44, 185, 155);
    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42);

    const now = new Date();
    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    doc.text(
      `Fecha: ${now.toLocaleDateString('es-CO')}  |  Hora: ${now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`,
      14,
      48,
    );
    if (wantsContact) {
      doc.setTextColor(44, 185, 155);
      doc.text(`✓ Cliente solicita ser contactado — ${clientPhone}`, 100, 48);
    }

    // Descripción empresa
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(
      'En Jayka Creando Espacios fabricamos e instalamos mobiliario a medida de alta calidad,',
      14,
      54,
    );
    doc.text('transformando cada espacio en un ambiente único y funcional.', 14, 59);

    // Info cliente
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text('Información del Cliente', 14, 68);
    doc.setFontSize(10);
    doc.text(`Nombre: ${clientName}`, 14, 75);
    doc.text(`Teléfono: ${clientPhone}`, 14, 81);
    if (clientEmail) doc.text(`Email: ${clientEmail}`, 14, 87);
    if (projectLocation) doc.text(`Ubicación: ${projectLocation}`, 14, clientEmail ? 93 : 87);

    let currentY = clientEmail && projectLocation ? 101 : clientEmail || projectLocation ? 95 : 89;

    // Tabla de servicios
    const tableBody = result.lineItems.map((li) => [
      li.service,
      `${li.area} m²`,
      fmt(li.unitPrice),
      fmt(li.subtotal),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Servicio', 'Área / Uds', 'Precio/m²', 'Subtotal']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [44, 185, 155] },
      styles: { fontSize: 9 },
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 10;

    // Desglose de costos
    const totalsBody: [string, string][] = [['Subtotal servicios', fmt(result.subtotalServices)]];
    if (result.difficultyAmount > 0)
      totalsBody.push([
        `Dificultad de acceso (×${result.difficultyMultiplier})`,
        `+${fmt(result.difficultyAmount)}`,
      ]);
    if (result.dismantlingCost > 0)
      totalsBody.push(['Desmonte de muebles existentes', `+${fmt(result.dismantlingCost)}`]);
    if (result.debrisRemovalCost > 0)
      totalsBody.push(['Retiro de residuos / escombros', `+${fmt(result.debrisRemovalCost)}`]);

    totalsBody.push(['', '']);
    totalsBody.push(['Subtotal neto', fmt(result.subtotalBeforeMargin)]);
    totalsBody.push([
      `Administración (${(result.adminRate * 100).toFixed(0)}%)`,
      `+${fmt(result.adminAmount)}`,
    ]);
    totalsBody.push([
      `Imprevistos (${(result.imprevistosRate * 100).toFixed(0)}%)`,
      `+${fmt(result.imprevistosAmount)}`,
    ]);
    totalsBody.push([
      `Utilidad (${(result.utilidadRate * 100).toFixed(0)}%)`,
      `+${fmt(result.utilidadAmount)}`,
    ]);
    totalsBody.push([
      `IVA sobre utilidad (${(result.ivaRate * 100).toFixed(0)}%)`,
      `+${fmt(result.ivaAmount)}`,
    ]);

    autoTable(doc, {
      startY: currentY,
      body: totalsBody,
      theme: 'plain',
      styles: { fontSize: 10, halign: 'right' },
      columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } },
      margin: { left: 90 },
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 6;

    doc.setFontSize(13);
    doc.setTextColor(44, 185, 155);
    doc.text(`TOTAL ESTIMADO: ${fmt(result.grandTotal)}`, 143, currentY, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Tiempo estimado de instalación: ~${result.estimatedDays} días hábiles`,
      143,
      currentY + 7,
      { align: 'center' },
    );

    // Pie de página
    doc.setFontSize(8);
    doc.setTextColor(170, 170, 170);
    doc.text(
      'Este documento es un estimado automático y no constituye un contrato.',
      105,
      278,
      { align: 'center' },
    );
    doc.text(
      'Se requiere visita técnica para confirmar presupuesto definitivo. | Jayka Creando Espacios',
      105,
      283,
      { align: 'center' },
    );
    doc.setTextColor(100, 100, 100);
    doc.text(
      'WhatsApp: +57 312 493 7069  |  facturacionjayka@gmail.com',
      105,
      288,
      { align: 'center' },
    );

    doc.save(`Cotizacion_Jayka_${clientName.replace(/\s+/g, '_')}.pdf`);

    // Guardar en Laravel (graceful fail)
    saveQuotationToLaravel({
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail,
      project_location: projectLocation,
      wants_contact: wantsContact,
      services: result.lineItems,
      grand_total: result.grandTotal,
      result_json: result,
    });

    // Notificar a Jayka por WhatsApp (con pequeño delay)
    setTimeout(() => notifyBusinessWhatsApp(), 800);
  };

  // ════════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fdf9 0%, #ffffff 60%, #f0fdf9 100%)' }}>
      {/* ── Encabezado fijo ──────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {onClose ? (
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
              <span className="font-semibold text-sm hidden sm:inline">Cerrar</span>
            </button>
          ) : (
            <a
              href="#inicio"
              className="flex items-center gap-2 transition-colors"
              style={{ color: BRAND }}
            >
              <span className="font-semibold text-sm hidden sm:inline">← Volver al inicio</span>
            </a>
          )}

          {/* Logo / nombre */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: BRAND }}
            >
              J
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">JAYKA</span>
          </div>

          <div className="w-20" />
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* ── Título ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border"
              style={{
                backgroundColor: `${BRAND}18`,
                borderColor: `${BRAND}40`,
                color: BRAND,
              }}
            >
              <Calculator className="w-4 h-4" />
              <span className="font-semibold text-sm">COTIZADOR INTELIGENTE</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Cotiza tu proyecto{' '}
            <span style={{ color: BRAND }}>al instante</span>
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto text-sm">
            Responde unas preguntas sencillas y obtén un estimado profesional de mobiliario en
            minutos.
          </p>
        </motion.div>

        {/* ── Barra de progreso ────────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2 px-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const s = i + 1;
              const done = s < step;
              const active = s === step;
              return (
                <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor:
                        done || active ? BRAND : '#e5e7eb',
                      color: done || active ? '#fff' : '#9ca3af',
                      boxShadow: active ? `0 4px 14px ${BRAND}40` : 'none',
                      outline: active ? `4px solid ${BRAND}30` : 'none',
                      outlineOffset: '2px',
                    }}
                  >
                    {done ? <CheckCircle2 className="w-5 h-5" /> : s}
                  </div>
                  {s < TOTAL_STEPS && (
                    <div
                      className="h-1 flex-1 rounded-full transition-all duration-500 mx-1"
                      style={{ backgroundColor: s < step ? BRAND : '#e5e7eb' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center text-sm text-gray-400 font-medium">
            Paso {step} de {TOTAL_STEPS}
          </div>
        </div>

        {/* ── Pasos ───────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            {/* ──── PASO 1: Datos del cliente ──── */}
            <div className={step === 1 ? 'block' : 'hidden'}>
              <Card
                title="Información del cliente"
                subtitle="Cuéntanos sobre ti y tu proyecto"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <InputField
                    icon={<User className="w-4 h-4" />}
                    label="Nombre completo *"
                    placeholder="Tu nombre"
                    value={clientName}
                    onChange={setClientName}
                  />
                  <InputField
                    icon={<Phone className="w-4 h-4" />}
                    label="Teléfono *"
                    placeholder="312 493 7069"
                    value={clientPhone}
                    onChange={setClientPhone}
                    type="tel"
                  />
                  <InputField
                    icon={<Mail className="w-4 h-4" />}
                    label="Correo electrónico"
                    placeholder="correo@ejemplo.com"
                    value={clientEmail}
                    onChange={setClientEmail}
                    type="email"
                  />
                  <InputField
                    icon={<MapPin className="w-4 h-4" />}
                    label="Ubicación del proyecto"
                    placeholder="Villavicencio, Bogotá..."
                    value={projectLocation}
                    onChange={setProjectLocation}
                  />
                </div>

                {/* Toggle — quiere contacto */}
                <button
                  onClick={() => setWantsContact(!wantsContact)}
                  className={`mt-5 w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    wantsContact ? 'bg-[#2CB99B]/5' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                  style={wantsContact ? { borderColor: BRAND } : {}}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={
                      wantsContact
                        ? { backgroundColor: BRAND, color: '#fff' }
                        : { backgroundColor: '#e5e7eb', color: '#9ca3af' }
                    }
                  >
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div
                      className="font-semibold text-sm"
                      style={wantsContact ? { color: BRAND } : { color: '#374151' }}
                    >
                      Deseo ser contactado por un asesor de Jayka
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {clientPhone
                        ? `Te contactaremos al ${clientPhone}`
                        : 'Ingresa tu teléfono arriba para activar'}
                    </div>
                  </div>
                  <div
                    className="w-10 h-6 rounded-full p-0.5 transition-all duration-300"
                    style={{ backgroundColor: wantsContact ? BRAND : '#d1d5db' }}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
                        wantsContact ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
              </Card>
            </div>

            {/* ──── PASO 2: Servicios + medidas ──── */}
            <div className={step === 2 ? 'block' : 'hidden'}>
              <Card
                title="Servicios y medidas"
                subtitle="Selecciona los servicios y el área estimada de tu proyecto"
              >
                {/* Área global */}
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Ruler className="w-4 h-4" style={{ color: BRAND }} />
                    Área total del proyecto (m²)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={areaM2 || ''}
                    onChange={(e) => setAreaM2(Number(e.target.value))}
                    placeholder="Ej: 25"
                    className="w-full sm:w-48 px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none transition-all text-lg font-semibold focus:border-[#2CB99B] focus:ring-2 focus:ring-[#2CB99B]/20"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    Área general. Los servicios de cocina, closet, baño y vestier tienen su propio m².
                  </p>
                </div>

                {/* Lista de servicios */}
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Selecciona los servicios requeridos
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {jaykaServices.map((svc) => {
                    const selected = selectedServices.includes(svc.id);
                    const needsCustomArea = CUSTOM_AREA_SERVICES.includes(svc.id);
                    const isPuertas = svc.id === 'puertas';

                    return (
                      <div key={svc.id} className="flex flex-col gap-0">
                        <button
                          onClick={() => toggleService(svc.id)}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            selected
                              ? needsCustomArea || isPuertas
                                ? 'rounded-b-none border-b-0'
                                : ''
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          }`}
                          style={
                            selected
                              ? {
                                  borderColor: BRAND,
                                  backgroundColor: `${BRAND}0d`,
                                  boxShadow: `0 4px 12px ${BRAND}20`,
                                }
                              : {}
                          }
                        >
                          <span className="text-2xl">{svc.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div
                              className="font-semibold text-sm"
                              style={selected ? { color: BRAND } : { color: '#1f2937' }}
                            >
                              {svc.label}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {svc.pricing.baja.totalM2 > 0
                                ? `Desde ${fmt(svc.pricing.baja.totalM2)}/${svc.unit}`
                                : 'Precios a definir'}
                              {(needsCustomArea || isPuertas) && (
                                <span className="ml-1" style={{ color: BRAND }}>
                                  · {isPuertas ? 'por unidad' : 'm² propios'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                            style={
                              selected
                                ? { borderColor: BRAND, backgroundColor: BRAND }
                                : { borderColor: '#d1d5db' }
                            }
                          >
                            {selected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </button>

                        {/* Input extra — m² propios */}
                        {selected && needsCustomArea && (
                          <div
                            className="px-4 py-3 border-2 border-t-0 rounded-b-xl"
                            style={{ borderColor: BRAND, backgroundColor: `${BRAND}0d` }}
                          >
                            <label
                              className="text-xs font-semibold mb-1.5 flex items-center gap-1"
                              style={{ color: BRAND }}
                            >
                              <Ruler className="w-3 h-3" />
                              ¿Cuántos m² de {svc.label.toLowerCase()}?
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={serviceAreas[svc.id] || ''}
                              onChange={(e) =>
                                setServiceAreas((prev) => ({
                                  ...prev,
                                  [svc.id]: Number(e.target.value),
                                }))
                              }
                              placeholder="Ej: 8"
                              className="w-36 px-3 py-2 rounded-lg border bg-white outline-none text-sm font-semibold focus:ring-2 focus:ring-[#2CB99B]/20"
                              style={{ borderColor: `${BRAND}50` }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-xs text-gray-500 ml-2">m²</span>
                          </div>
                        )}

                        {/* Input extra — cantidad de puertas */}
                        {selected && isPuertas && (
                          <div
                            className="px-4 py-3 border-2 border-t-0 rounded-b-xl"
                            style={{ borderColor: BRAND, backgroundColor: `${BRAND}0d` }}
                          >
                            <label
                              className="text-xs font-semibold mb-1.5 block"
                              style={{ color: BRAND }}
                            >
                              ¿Cuántas puertas necesitas?
                            </label>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUnitCount((c) => Math.max(1, c - 1));
                                }}
                                className="w-8 h-8 rounded-full border-2 bg-white font-bold hover:text-white transition-all flex items-center justify-center text-lg"
                                style={{ borderColor: `${BRAND}60`, color: BRAND }}
                              >
                                -
                              </button>
                              <span
                                className="w-8 text-center font-bold text-lg"
                                style={{ color: BRAND }}
                              >
                                {unitCount}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUnitCount((c) => c + 1);
                                }}
                                className="w-8 h-8 rounded-full border-2 bg-white font-bold hover:text-white transition-all flex items-center justify-center text-lg"
                                style={{ borderColor: `${BRAND}60`, color: BRAND }}
                              >
                                +
                              </button>
                              <span className="text-xs text-gray-500">
                                {unitCount === 1 ? 'puerta' : 'puertas'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* ──── PASO 3: Calidad ──── */}
            <div className={step === 3 ? 'block' : 'hidden'}>
              <Card
                title="Nivel de calidad"
                subtitle="Elige la gama de materiales y acabados para tu proyecto"
              >
                <div className="grid gap-4">
                  {QUALITY_OPTIONS.map((opt) => {
                    const selected = qualityTier === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setQualityTier(opt.value)}
                        className="relative flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-300"
                        style={
                          selected
                            ? {
                                borderColor: BRAND,
                                boxShadow: `0 8px 24px ${BRAND}20`,
                                backgroundColor: '#fff',
                              }
                            : {
                                borderColor: '#e5e7eb',
                                backgroundColor: '#fff',
                              }
                        }
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0"
                          style={{ backgroundColor: opt.color }}
                        >
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-lg text-gray-900">{opt.label}</div>
                          <div className="text-sm text-gray-500 mt-0.5">{opt.desc}</div>
                        </div>
                        <div
                          className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                          style={
                            selected
                              ? { borderColor: BRAND, backgroundColor: BRAND }
                              : { borderColor: '#d1d5db' }
                          }
                        >
                          {selected && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Preview en vivo */}
                {selectedServices.length > 0 && areaM2 > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Vista previa — solo servicios
                    </div>
                    {selectedServices.map((svcId) => {
                      const svc = jaykaServices.find((s) => s.id === svcId);
                      if (!svc) return null;
                      const price = svc.pricing[qualityTier].totalM2;
                      const effectiveArea =
                        svcId === 'puertas'
                          ? unitCount
                          : CUSTOM_AREA_SERVICES.includes(svcId) && (serviceAreas[svcId] ?? 0) > 0
                            ? serviceAreas[svcId]!
                            : areaM2;
                      return (
                        <div
                          key={svcId}
                          className="flex items-center justify-between py-1 text-sm"
                        >
                          <span className="text-gray-600">
                            {svc.icon} {svc.label}
                            {svcId === 'puertas' ? (
                              <span className="text-xs text-gray-400 ml-1">({unitCount} ud.)</span>
                            ) : CUSTOM_AREA_SERVICES.includes(svcId) ? (
                              <span className="text-xs text-gray-400 ml-1">
                                ({effectiveArea} m²)
                              </span>
                            ) : null}
                          </span>
                          <span className="font-semibold text-gray-800">
                            {price > 0 ? fmt(price * effectiveArea) : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </Card>
            </div>

            {/* ──── PASO 4: Condiciones adicionales ──── */}
            <div className={step === 4 ? 'block' : 'hidden'}>
              <Card
                title="Condiciones adicionales"
                subtitle="Factores que pueden afectar el presupuesto final"
              >
                {/* Dificultad */}
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Dificultad de instalación
                </label>
                <div className="grid sm:grid-cols-3 gap-3 mb-6">
                  {DIFFICULTY_OPTIONS.map((opt) => {
                    const selected = difficulty === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setDifficulty(opt.value)}
                        className="p-4 rounded-xl border-2 text-left transition-all duration-200"
                        style={
                          selected
                            ? {
                                borderColor: BRAND,
                                backgroundColor: `${BRAND}08`,
                                boxShadow: `0 4px 12px ${BRAND}20`,
                              }
                            : { borderColor: '#e5e7eb', backgroundColor: '#fff' }
                        }
                      >
                        <div className="font-semibold text-sm text-gray-800">{opt.label}</div>
                        <div className="text-xs text-gray-400 mt-1">{opt.desc}</div>
                        <div
                          className="text-xs font-bold mt-2"
                          style={selected ? { color: BRAND } : { color: '#9ca3af' }}
                        >
                          {opt.factor}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Extras */}
                <div className="space-y-3 mb-6">
                  <ToggleRow
                    icon={<Wrench className="w-4 h-4" />}
                    label="Desmonte de muebles existentes"
                    desc="Remoción y disposición de mobiliario actual"
                    checked={includesDismantling}
                    onChange={setIncludesDismantling}
                  />
                  <ToggleRow
                    icon={<Truck className="w-4 h-4" />}
                    label="Retiro de residuos / escombros"
                    desc="Transporte y disposición final"
                    checked={includesDebrisRemoval}
                    onChange={setIncludesDebrisRemoval}
                  />
                </div>

                {/* Notas */}
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe cualquier detalle adicional sobre el proyecto..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none transition-all resize-none text-sm focus:border-[#2CB99B] focus:ring-2 focus:ring-[#2CB99B]/20"
                />
              </Card>
            </div>

            {/* ──── PASO 5: Resultado ──── */}
            <div className={step === 5 && result ? 'block' : 'hidden'}>
              <div className="space-y-6">
                {/* Éxito */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 shadow-xl"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`,
                      boxShadow: `0 8px 24px ${BRAND}40`,
                    }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">¡Cotización lista!</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Este es un estimado basado en los datos suministrados.
                    <br />
                    Una visita técnica confirmará el presupuesto definitivo.
                  </p>
                </motion.div>

                {/* Desglose de servicios */}
                <Card
                  title="Desglose de servicios"
                  subtitle={`${areaM2} m² · Gama ${QUALITY_OPTIONS.find((q) => q.value === qualityTier)?.label}`}
                >
                  <div className="divide-y divide-gray-100">
                    {result?.lineItems.map((li, i) => (
                      <div key={i} className="flex items-center justify-between py-3">
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{li.service}</div>
                          <div className="text-xs text-gray-400">
                            {li.area} {li.area === unitCount && selectedServices.includes('puertas') ? 'uds' : 'm²'} × {fmt(li.unitPrice)}
                          </div>
                        </div>
                        <div className="font-semibold text-gray-900">{fmt(li.subtotal)}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Resumen financiero */}
                <Card title="Resumen financiero" subtitle="">
                  <div className="space-y-2 text-sm">
                    <Row label="Subtotal servicios" value={fmt(result?.subtotalServices ?? 0)} />
                    {(result?.difficultyAmount ?? 0) > 0 && (
                      <Row
                        label={`Dificultad de instalación (×${result?.difficultyMultiplier})`}
                        value={`+${fmt(result?.difficultyAmount ?? 0)}`}
                      />
                    )}
                    {(result?.dismantlingCost ?? 0) > 0 && (
                      <Row
                        label="Desmonte de muebles existentes"
                        value={`+${fmt(result?.dismantlingCost ?? 0)}`}
                      />
                    )}
                    {(result?.debrisRemovalCost ?? 0) > 0 && (
                      <Row
                        label="Retiro de residuos"
                        value={`+${fmt(result?.debrisRemovalCost ?? 0)}`}
                      />
                    )}
                    <div className="border-t border-gray-100 pt-2 mt-2" />
                    <Row label="Subtotal neto" value={fmt(result?.subtotalBeforeMargin ?? 0)} />
                    <Row
                      label={`Administración (${((result?.adminRate ?? 0) * 100).toFixed(0)}%)`}
                      value={`+${fmt(result?.adminAmount ?? 0)}`}
                    />
                    <Row
                      label={`Imprevistos (${((result?.imprevistosRate ?? 0) * 100).toFixed(0)}%)`}
                      value={`+${fmt(result?.imprevistosAmount ?? 0)}`}
                    />
                    <Row
                      label={`Utilidad (${((result?.utilidadRate ?? 0) * 100).toFixed(0)}%)`}
                      value={`+${fmt(result?.utilidadAmount ?? 0)}`}
                    />
                    <Row
                      label={`IVA sobre utilidad (${((result?.ivaRate ?? 0) * 100).toFixed(0)}%)`}
                      value={`+${fmt(result?.ivaAmount ?? 0)}`}
                    />
                    <div className="border-t-2 border-gray-200 pt-3 mt-3" />
                    <Row label="TOTAL ESTIMADO" value={fmt(result?.grandTotal ?? 0)} accent />
                    <div className="text-xs text-gray-400 mt-2 text-center">
                      Tiempo estimado: ~{result?.estimatedDays} días hábiles
                    </div>
                  </div>
                </Card>

                {/* Acciones */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Descargar PDF */}
                  <button
                    onClick={generatePDF}
                    className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-white font-bold transition-all hover:shadow-xl hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`,
                      boxShadow: `0 4px 16px ${BRAND}40`,
                    }}
                  >
                    <FileDown className="w-5 h-5" />
                    Descargar PDF
                  </button>

                  {/* Enviar por WhatsApp */}
                  <a
                    href={`https://wa.me/573124937069?text=${encodeURIComponent(buildWhatsAppMessage())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold transition-all hover:shadow-xl hover:-translate-y-0.5 border-2"
                    style={{ borderColor: BRAND, color: BRAND }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.107.547 4.085 1.505 5.804L.057 23.428a.5.5 0 00.617.602l5.752-1.427A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.939 0-3.756-.5-5.33-1.37l-.38-.214-3.945.978.995-3.85-.235-.39A9.962 9.962 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    Enviar por WhatsApp
                  </a>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Al descargar el PDF tu cotización se registra automáticamente y nuestro equipo
                  recibirá una notificación.
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Navegación ───────────────────────────────────────────── */}
        {step < 5 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={goBack}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>

            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              style={{
                background: canProceed()
                  ? `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`
                  : '#9ca3af',
                boxShadow: canProceed() ? `0 4px 14px ${BRAND}40` : 'none',
              }}
            >
              {step === 4 ? 'Ver resultado' : 'Siguiente'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
