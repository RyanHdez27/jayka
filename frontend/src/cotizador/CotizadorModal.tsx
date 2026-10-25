import React, { useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  X,
  CheckCircle2,
  Calculator,
  Ruler,
  Sparkles,
  AlertTriangle,
  Trash2,
  Truck,
  FileDown,
  Send,
  PhoneCall,
  ArrowLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

import jaykaLogo from '../assets/jayka-logo.png';
import { api } from '../services/api';
import type {
  ServiceCategory,
  QualityTier,
  DifficultyLevel,
  QuotationResult,
} from './quotation.types';
import {
  JAYKA_SERVICES,
  CUSTOM_AREA_SERVICES,
  QUALITY_OPTIONS,
  DIFFICULTY_OPTIONS,
} from './pricingData';
import { calculateQuotation } from './useQuotationCalculator';

interface CotizadorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceId?: string;
}

const TOTAL_STEPS = 5;

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);

export const CotizadorModal: React.FC<CotizadorModalProps> = ({
  isOpen,
  onClose,
  initialServiceId,
}) => {
  // Paso activo (1 a 5)
  const [step, setStep] = useState<number>(1);

  // Paso 1: Datos de Contacto
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [projectLocation, setProjectLocation] = useState<string>('Villavicencio, Meta');
  const [wantsContact, setWantsContact] = useState<boolean>(true);

  // Paso 2: Servicios y Metraje
  const [selectedServices, setSelectedServices] = useState<ServiceCategory[]>([]);
  const [areaM2, setAreaM2] = useState<number>(30);
  const [serviceAreas, setServiceAreas] = useState<Partial<Record<ServiceCategory, number>>>({});
  const [bathroomCount, setBathroomCount] = useState<number>(1);

  // Paso 3: Calidad
  const [qualityTier, setQualityTier] = useState<QualityTier>('media');

  // Paso 4: Extras y Dificultad
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('normal');
  const [includesDemolition, setIncludesDemolition] = useState<boolean>(false);
  const [includesDebrisRemoval, setIncludesDebrisRemoval] = useState<boolean>(false);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  // Paso 5: Resultado y Estado
  const [result, setResult] = useState<QuotationResult | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasSaved, setHasSaved] = useState<boolean>(false);

  // Si se abre con un servicio inicial
  useEffect(() => {
    if (initialServiceId && isOpen) {
      const match = JAYKA_SERVICES.find(
        (s) => s.id === initialServiceId || s.category.toLowerCase().includes(initialServiceId.toLowerCase())
      );
      if (match && !selectedServices.includes(match.id)) {
        setSelectedServices([match.id]);
      }
    }
  }, [initialServiceId, isOpen]);

  // Bloquear scroll de fondo cuando el modal esté abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Validar si el usuario puede avanzar
  const canProceed = useCallback(() => {
    switch (step) {
      case 1:
        return clientName.trim().length >= 2 && clientPhone.trim().length >= 7;
      case 2: {
        if (selectedServices.length === 0 || areaM2 <= 0) return false;
        // Todos los servicios con m² custom deben tener valor > 0
        const missingCustom = selectedServices
          .filter((id) => CUSTOM_AREA_SERVICES.includes(id))
          .some((id) => !(serviceAreas[id] && serviceAreas[id]! > 0));
        if (missingCustom) return false;
        if (selectedServices.includes('divisiones_bano') && bathroomCount < 1) return false;
        return true;
      }
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  }, [step, clientName, clientPhone, selectedServices, areaM2, serviceAreas, bathroomCount]);

  // Avanzar
  const goNext = () => {
    if (step === 4) {
      const computedResult = calculateQuotation({
        selectedServices,
        areaM2,
        serviceAreas,
        bathroomCount,
        qualityTier,
        difficulty,
        includesDemolition,
        includesDebrisRemoval,
      });
      setResult(computedResult);
      // Guardar automáticamente en el backend como borrador de cotización
      persistQuotation(computedResult);
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  // Retroceder
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  // Toggle de selección de servicio
  const toggleService = (id: ServiceCategory) => {
    setSelectedServices((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        // Inicializar m² si es custom
        if (CUSTOM_AREA_SERVICES.includes(id) && !serviceAreas[id]) {
          setServiceAreas((curr) => ({ ...curr, [id]: Math.min(areaM2, 12) || 8 }));
        }
        return [...prev, id];
      }
    });
  };

  // Guardar cotización en Laravel backend
  const persistQuotation = async (res: QuotationResult) => {
    if (hasSaved || isSaving) return;
    setIsSaving(true);
    try {
      await api.submitQuotation({
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail || undefined,
        project_location: projectLocation || 'Villavicencio, Meta',
        wants_contact: wantsContact,
        grand_total: res.grandTotal,
        services: res.lineItems,
        result_json: res,
        type: 'jayka',
      });
      setHasSaved(true);
    } catch (err) {
      console.warn('Registro local persistido, continuando en modo cliente:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Construir mensaje para WhatsApp del equipo comercial de Jayka
  const buildWhatsAppMessage = () => {
    if (!result) return '';
    const servicesList = result.lineItems
      .map((li) => `• ${li.service} (${li.area} m² - ${fmt(li.subtotal)})`)
      .join('\n');

    return (
      `🏛️ *COTIZACIÓN DE PROYECTO — JAYKA CREANDO ESPACIOS*\n\n` +
      `¡Hola equipo Jayka! Acabo de generar mi presupuesto en su cotizador online:\n\n` +
      `👤 *Cliente:* ${clientName}\n` +
      `📞 *Teléfono:* ${clientPhone}\n` +
      (clientEmail ? `✉️ *Email:* ${clientEmail}\n` : '') +
      `📍 *Ubicación:* ${projectLocation}\n` +
      `📐 *Área Global:* ${areaM2} m²\n` +
      `✨ *Gama Seleccionada:* ${QUALITY_OPTIONS.find((q) => q.value === qualityTier)?.label}\n\n` +
      `*Partidas Cotizadas:*\n${servicesList}\n\n` +
      (result.difficultyAmount > 0 ? `⚠️ Dificultad de acceso: +${fmt(result.difficultyAmount)}\n` : '') +
      (result.demolitionCost > 0 ? `🔨 Demolición previa: +${fmt(result.demolitionCost)}\n` : '') +
      (result.debrisRemovalCost > 0 ? `🚛 Retiro de escombros: +${fmt(result.debrisRemovalCost)}\n` : '') +
      `\n💰 *VALOR ESTIMADO TOTAL: ${fmt(result.grandTotal)} COP*\n` +
      `⏱️ *Tiempo aproximado:* ~${result.estimatedDays} días hábiles\n\n` +
      (wantsContact
        ? `✅ *Deseo agendar visita técnica presencial en la obra.*`
        : `Quedo atento a resolver inquietudes de mi cotización.`)
    );
  };

  // Generación formal de PDF con jsPDF y jsPDF-AutoTable
  const generatePDF = async () => {
    if (!result) return;
    const doc = new jsPDF();

    // 1. Logo institucional
    try {
      const img = new Image();
      img.src = jaykaLogo;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
      if (img.complete && img.naturalWidth > 0) {
        doc.addImage(img, 'PNG', 14, 10, 42, 14);
      }
    } catch {
      // Continuar si hay algún fallo al cargar imagen
    }

    // 2. Encabezado de Jayka
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(44, 185, 155); // Color de marca Jayka #2CB99B
    doc.text('PRESUPUESTO ESTIMADO', 196, 18, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Jayka Creando Espacios S.A.S.', 196, 24, { align: 'right' });
    doc.text('Carpintería Arquitectónica · Aluminio · Remodelaciones', 196, 29, { align: 'right' });
    doc.text('NIT: 901.849.201-4 · Villavicencio, Meta', 196, 34, { align: 'right' });

    // Línea divisoria de color marca
    doc.setDrawColor(44, 185, 155);
    doc.setLineWidth(0.8);
    doc.line(14, 38, 196, 38);

    // 3. Metadatos de fecha y cliente
    const now = new Date();
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Fecha: ${now.toLocaleDateString('es-CO')}  |  Vigencia: 15 días hábiles`,
      14,
      45
    );

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 48, 182, 28, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, 48, 182, 28, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('INFORMACIÓN DEL CLIENTE & PROYECTO', 18, 55);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Cliente: ${clientName}`, 18, 62);
    doc.text(`Teléfono: ${clientPhone}`, 18, 68);
    doc.text(`Ubicación: ${projectLocation || 'Villavicencio, Meta'}`, 110, 62);
    doc.text(`Correo: ${clientEmail || 'No especificado'}`, 110, 68);

    // 4. Tabla de Partidas con AutoTable
    const tableBody = result.lineItems.map((li) => [
      li.service,
      `${li.area} m²`,
      fmt(li.unitPrice),
      fmt(li.subtotal),
    ]);

    autoTable(doc, {
      startY: 82,
      head: [['Concepto / Servicio Especializado', 'Metraje', 'Precio Base Unitario', 'Subtotal']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [44, 185, 155],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 8.5,
        textColor: [51, 65, 85],
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 95 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'right', cellWidth: 32 },
        3: { halign: 'right', cellWidth: 30 },
      },
    });

    // @ts-ignore
    let currentY = (doc.lastAutoTable?.finalY ?? 130) + 8;

    // 5. Desglose Financiero y AIU
    const totalsRows: [string, string][] = [
      ['Subtotal partidas directas', fmt(result.subtotalServices)],
    ];
    if (result.difficultyAmount > 0) {
      totalsRows.push([
        `Factor de acceso / altura (${((result.difficultyMultiplier - 1) * 100).toFixed(0)}%)`,
        `+${fmt(result.difficultyAmount)}`,
      ]);
    }
    if (result.demolitionCost > 0) {
      totalsRows.push(['Demolición y preparación de superficie', `+${fmt(result.demolitionCost)}`]);
    }
    if (result.debrisRemovalCost > 0) {
      totalsRows.push(['Retiro y disposición ambiental de escombros', `+${fmt(result.debrisRemovalCost)}`]);
    }
    totalsRows.push(['Costo Directo Neto (CD)', fmt(result.subtotalBeforeMargin)]);
    totalsRows.push([`Administración legal (${(result.adminRate * 100).toFixed(0)}%)`, `+${fmt(result.adminAmount)}`]);
    totalsRows.push([`Imprevistos de obra (${(result.imprevistosRate * 100).toFixed(0)}%)`, `+${fmt(result.imprevistosAmount)}`]);
    totalsRows.push([`Utilidad contractual (${(result.utilidadRate * 100).toFixed(0)}%)`, `+${fmt(result.utilidadAmount)}`]);
    totalsRows.push([`IVA (${(result.ivaRate * 100).toFixed(0)}% sobre utilidad)`, `+${fmt(result.ivaAmount)}`]);

    autoTable(doc, {
      startY: currentY,
      body: totalsRows,
      theme: 'plain',
      styles: { fontSize: 8.5, halign: 'right', cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', cellWidth: 65 },
        1: { halign: 'right', cellWidth: 35 },
      },
      margin: { left: 96 },
    });

    // @ts-ignore
    currentY = (doc.lastAutoTable?.finalY ?? currentY + 40) + 6;

    // Total en caja destacada
    doc.setFillColor(240, 253, 250); // Verde menta tenue
    doc.roundedRect(96, currentY, 100, 16, 2, 2, 'F');
    doc.setDrawColor(44, 185, 155);
    doc.setLineWidth(0.6);
    doc.roundedRect(96, currentY, 100, 16, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('TOTAL ESTIMADO:', 102, currentY + 7);

    doc.setFontSize(12);
    doc.setTextColor(13, 148, 136); // #0D9488
    doc.text(fmt(result.grandTotal), 190, currentY + 11, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Tiempo de fabricación: ~${result.estimatedDays} días hábiles`, 102, currentY + 13);

    // 6. Términos y Condiciones al pie
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      '• Este presupuesto constituye un cálculo preliminar con base en los datos ingresados en el cotizador digital.',
      14,
      265
    );
    doc.text(
      '• Se formaliza previa toma de medidas exacta en obra física por parte del equipo técnico de Jayka Creando Espacios.',
      14,
      270
    );
    doc.text(
      '• Canal oficial de atención y agendamiento: WhatsApp +57 312 493 7069 | facturacionjayka@gmail.com',
      14,
      275
    );

    // Guardar archivo local
    const filename = `Cotizacion_Jayka_${clientName.trim().replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);

    // Re-confirmar persistencia
    persistQuotation(result);
  };

  // Reiniciar cotizador
  const handleReset = () => {
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setProjectLocation('Villavicencio, Meta');
    setWantsContact(true);
    setSelectedServices([]);
    setAreaM2(30);
    setServiceAreas({});
    setBathroomCount(1);
    setQualityTier('media');
    setDifficulty('normal');
    setIncludesDemolition(false);
    setIncludesDebrisRemoval(false);
    setAdditionalNotes('');
    setResult(null);
    setHasSaved(false);
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* ── BARRA SUPERIOR ────────────────────────────────────── */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-3">
            <img src={jaykaLogo} alt="Jayka" className="h-8 w-auto object-contain" />
            <div className="h-4 w-px bg-gray-300 hidden sm:block" />
            <span className="text-xs uppercase tracking-widest font-bold text-[#2CB99B] hidden sm:inline-block">
              Cotizador Inteligente
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 font-medium">
              Paso <strong className="text-gray-900">{step}</strong> de {TOTAL_STEPS}
            </span>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
              aria-label="Cerrar cotizador"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── BARRA DE PROGRESO ─────────────────────────────────── */}
        <div className="w-full bg-gray-100 h-1.5">
          <div
            className="h-full bg-gradient-to-r from-[#2CB99B] to-[#0D9488] transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* ── CONTENIDO SCROLLABLE ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-10 sm:py-8">
          {/* PASO 1: Datos del cliente */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Datos del Proyecto y Contacto</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Ingresa tus datos para generar un presupuesto formal personalizado.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ej: Carlos Méndez"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2CB99B] focus:ring-2 focus:ring-[#2CB99B]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Teléfono Celular / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="Ej: 312 493 7069"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2CB99B] focus:ring-2 focus:ring-[#2CB99B]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Correo Electrónico (Opcional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2CB99B] focus:ring-2 focus:ring-[#2CB99B]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Ciudad / Ubicación del Proyecto
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ej: Villavicencio, Conjunto La Pradera"
                      value={projectLocation}
                      onChange={(e) => setProjectLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2CB99B] focus:ring-2 focus:ring-[#2CB99B]/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div
                onClick={() => setWantsContact(!wantsContact)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  wantsContact
                    ? 'border-[#2CB99B] bg-[#2CB99B]/5'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      wantsContact ? 'bg-[#2CB99B] text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Deseo agendar visita técnica presencial
                    </h4>
                    <p className="text-xs text-gray-500">
                      Un asesor de Jayka te contactará directamente para confirmar medidas exactas en el lugar.
                    </p>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    wantsContact ? 'border-[#2CB99B] bg-[#2CB99B]' : 'border-gray-300'
                  }`}
                >
                  {wantsContact && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Selección de Servicios y Medidas */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Servicios y Medidas</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Selecciona los ambientes que deseas cotizar e ingresa las dimensiones aproximadas.
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex items-center gap-3">
                  <Ruler className="w-5 h-5 text-[#2CB99B]" />
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Área Global Proyecto</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={areaM2 || ''}
                        onChange={(e) => setAreaM2(Math.max(1, Number(e.target.value)))}
                        className="w-20 px-2 py-1 text-base font-bold text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2CB99B]"
                      />
                      <span className="text-xs font-semibold text-gray-600">m² aprox.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {JAYKA_SERVICES.map((svc) => {
                  const isSelected = selectedServices.includes(svc.id);
                  const isCustom = CUSTOM_AREA_SERVICES.includes(svc.id);
                  const isBathroom = svc.id === 'divisiones_bano';

                  return (
                    <div
                      key={svc.id}
                      className={`rounded-2xl border-2 transition-all p-4 ${
                        isSelected
                          ? 'border-[#2CB99B] bg-[#2CB99B]/5 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div
                        onClick={() => toggleService(svc.id)}
                        className="cursor-pointer flex items-start gap-3"
                      >
                        <span className="text-2xl p-2 bg-white rounded-xl shadow-xs border border-gray-100">
                          {svc.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`text-sm font-bold truncate ${
                                isSelected ? 'text-[#0D9488]' : 'text-gray-900'
                              }`}
                            >
                              {svc.label}
                            </h4>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                                isSelected ? 'border-[#2CB99B] bg-[#2CB99B]' : 'border-gray-300'
                              }`}
                            >
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{svc.description}</p>
                          <div className="text-xs text-gray-400 font-medium mt-1">
                            Desde {fmt(svc.pricing.baja.totalM2)} / m²
                          </div>
                        </div>
                      </div>

                      {/* Sub-inputs de metraje específico si está seleccionado */}
                      {isSelected && isCustom && (
                        <div className="mt-3 pt-3 border-t border-[#2CB99B]/20 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                            <Ruler className="w-3 h-3 text-[#2CB99B]" />
                            Medida de {svc.label}:
                          </span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              value={serviceAreas[svc.id] ?? 8}
                              onChange={(e) =>
                                setServiceAreas((prev) => ({
                                  ...prev,
                                  [svc.id]: Math.max(1, Number(e.target.value)),
                                }))
                              }
                              className="w-16 px-2 py-1 text-xs font-bold text-center border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-[#2CB99B]"
                            />
                            <span className="text-xs text-gray-500 font-medium">m² / ml</span>
                          </div>
                        </div>
                      )}

                      {isSelected && isBathroom && (
                        <div className="mt-3 pt-3 border-t border-[#2CB99B]/20 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-700">Cantidad de baños:</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setBathroomCount((c) => Math.max(1, c - 1))}
                              className="w-7 h-7 rounded-lg bg-white border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-gray-900">
                              {bathroomCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => setBathroomCount((c) => c + 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO 3: Nivel de Acabados / Gama */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gama de Acabados y Materiales</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Elige el estándar de acabados para tu proyecto. Cada nivel varía en tipos de tableros, herrajes y garantías.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {QUALITY_OPTIONS.map((opt) => {
                  const isSelected = qualityTier === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => setQualityTier(opt.value)}
                      className={`relative cursor-pointer rounded-2xl border-2 p-5 flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-[#2CB99B] bg-[#2CB99B]/5 shadow-md ring-2 ring-[#2CB99B]/20'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-white"
                            style={{ backgroundColor: opt.color }}
                          >
                            {opt.badge}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-[#2CB99B] bg-[#2CB99B]' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1">{opt.label}</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">{opt.desc}</p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-[#2CB99B]" />
                          Garantía y respaldo Jayka
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Vista previa rápida de servicios con esta gama */}
              {selectedServices.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-3">
                    Estimado preliminar por partidas ({QUALITY_OPTIONS.find((q) => q.value === qualityTier)?.label})
                  </h4>
                  <div className="divide-y divide-gray-200">
                    {selectedServices.map((svcId) => {
                      const svc = JAYKA_SERVICES.find((s) => s.id === svcId);
                      if (!svc) return null;
                      const unitP = svc.pricing[qualityTier].totalM2;
                      const effArea =
                        svcId === 'divisiones_bano'
                          ? bathroomCount * 3.5
                          : CUSTOM_AREA_SERVICES.includes(svcId) && (serviceAreas[svcId] ?? 0) > 0
                          ? serviceAreas[svcId]!
                          : areaM2;
                      return (
                        <div key={svcId} className="py-2 flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-gray-700 font-medium">
                            {svc.icon} {svc.label} ({effArea} m²)
                          </span>
                          <span className="font-bold text-gray-900">{fmt(unitP * effArea)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASO 4: Extras y Dificultad */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Condiciones de Obra y Servicios Adicionales</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Facilidad de acceso al inmueble y labores previas requeridas.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Condiciones de Acceso y Logística
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {DIFFICULTY_OPTIONS.map((opt) => {
                    const isSelected = difficulty === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => setDifficulty(opt.value)}
                        className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                          isSelected
                            ? 'border-[#2CB99B] bg-[#2CB99B]/5'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-bold text-gray-900">{opt.label}</h4>
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? 'text-[#0D9488]' : 'text-gray-400'
                            }`}
                          >
                            {opt.factor}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{opt.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Toggles extras */}
              <div className="space-y-3">
                <div
                  onClick={() => setIncludesDemolition(!includesDemolition)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    includesDemolition
                      ? 'border-[#2CB99B] bg-[#2CB99B]/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Demolición y adecuación previa</div>
                      <div className="text-xs text-gray-500">Desmonte de carpinterías, drywall o estructuras anteriores (+45.000 COP/m²)</div>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      includesDemolition ? 'border-[#2CB99B] bg-[#2CB99B]' : 'border-gray-300'
                    }`}
                  >
                    {includesDemolition && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </div>

                <div
                  onClick={() => setIncludesDebrisRemoval(!includesDebrisRemoval)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    includesDebrisRemoval
                      ? 'border-[#2CB99B] bg-[#2CB99B]/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Retiro ecológico de escombros</div>
                      <div className="text-xs text-gray-500">Transporte certificado a escombrera legal autorizada (+30.000 COP/m²)</div>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      includesDebrisRemoval ? 'border-[#2CB99B] bg-[#2CB99B]' : 'border-gray-300'
                    }`}
                  >
                    {includesDebrisRemoval && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Observaciones / Requerimientos Específicos (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Ej: Necesitamos isla con toma eléctrico, cerradura inteligente en la puerta principal..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2CB99B] focus:ring-2 focus:ring-[#2CB99B]/20 transition-all"
                />
              </div>
            </div>
          )}

          {/* PASO 5: Resultado / Cotización Final */}
          {step === 5 && result && (
            <div className="space-y-6">
              {/* Encabezado éxito */}
              <div className="text-center py-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#2CB99B]/10 text-[#2CB99B] flex items-center justify-center mb-3">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">¡Tu Presupuesto Está Listo!</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
                  Generado para <strong className="text-gray-800">{clientName}</strong> · Proyecto en{' '}
                  <strong className="text-gray-800">{projectLocation}</strong>
                </p>
              </div>

              {/* Tarjeta de partidas */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Concepto</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subtotal</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {result.lineItems.map((li, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                      <div>
                        <div className="font-semibold text-gray-800">{li.service}</div>
                        <div className="text-xs text-gray-400">
                          {li.area} m² a {fmt(li.unitPrice)} / m²
                        </div>
                      </div>
                      <div className="font-bold text-gray-900">{fmt(li.subtotal)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen financiero y AIU */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between py-1 text-gray-600">
                  <span>Subtotal Partidas Directas</span>
                  <span className="font-semibold text-gray-900">{fmt(result.subtotalServices)}</span>
                </div>

                {result.difficultyAmount > 0 && (
                  <div className="flex justify-between py-1 text-amber-700">
                    <span>Factor Dificultad / Acceso</span>
                    <span className="font-semibold">+{fmt(result.difficultyAmount)}</span>
                  </div>
                )}

                {result.demolitionCost > 0 && (
                  <div className="flex justify-between py-1 text-gray-600">
                    <span>Demolición Previa</span>
                    <span className="font-semibold">+{fmt(result.demolitionCost)}</span>
                  </div>
                )}

                {result.debrisRemovalCost > 0 && (
                  <div className="flex justify-between py-1 text-gray-600">
                    <span>Disposición de Escombros</span>
                    <span className="font-semibold">+{fmt(result.debrisRemovalCost)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                  <span>Costo Directo Neto</span>
                  <span>{fmt(result.subtotalBeforeMargin)}</span>
                </div>

                {/* Desglose AIU */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs text-gray-500 mt-2">
                  <div className="flex justify-between">
                    <span>Administración (7%)</span>
                    <span>+{fmt(result.adminAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Imprevistos (3%)</span>
                    <span>+{fmt(result.imprevistosAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilidad (5%)</span>
                    <span>+{fmt(result.utilidadAmount)}</span>
                  </div>
                  <div className="flex justify-between text-teal-700 font-semibold pt-1 border-t border-gray-200">
                    <span>IVA (19% sobre utilidad)</span>
                    <span>+{fmt(result.ivaAmount)}</span>
                  </div>
                </div>

                {/* Gran Total */}
                <div className="pt-4 mt-2 border-t-2 border-[#2CB99B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs uppercase tracking-wider font-bold text-gray-500">
                      Gran Total Estimado
                    </div>
                    <div className="text-xs text-gray-400">
                      Tiempo de fabricación: ~{result.estimatedDays} días hábiles
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#2CB99B]">
                    {fmt(result.grandTotal)}
                  </div>
                </div>
              </div>

              {/* Botones de acción final */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={generatePDF}
                  className="flex-1 py-3.5 px-5 rounded-2xl bg-[#111827] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-md"
                >
                  <FileDown className="w-4 h-4 text-[#2CB99B]" />
                  Descargar Cotización en PDF
                </button>

                <a
                  href={`https://wa.me/573124937069?text=${encodeURIComponent(buildWhatsAppMessage())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => persistQuotation(result)}
                  className="flex-1 py-3.5 px-5 rounded-2xl bg-[#25D366] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                  Enviar por WhatsApp a Jayka
                </a>

                <button
                  type="button"
                  onClick={handleReset}
                  className="py-3.5 px-4 rounded-2xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-semibold text-sm flex items-center justify-center gap-1.5 transition-all"
                  title="Nueva cotización"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Nueva</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── BARRA INFERIOR DE NAVEGACIÓN ──────────────────────── */}
        {step < TOTAL_STEPS && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-200/50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed()}
              className={`inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-sm ${
                canProceed()
                  ? 'bg-[#2CB99B] text-white hover:opacity-90 hover:shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {step === 4 ? 'Generar Presupuesto' : 'Siguiente'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
