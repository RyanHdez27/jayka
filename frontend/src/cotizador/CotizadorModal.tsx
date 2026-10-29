import React, { useState, useEffect, useCallback, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  X,
  CheckCircle2,
  Calculator,
  Ruler,
  Sparkles,
  Truck,
  FileDown,
  Send,
  PhoneCall,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Mail,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Plus,
  Minus,
  Info,
  Layers,
  Fuel,
  Navigation,
  Building2,
  Map,
} from 'lucide-react';

import jaykaLogo from '../assets/jayka-logo.png';
import { api } from '../services/api';
import type {
  ServiceCategory,
  QualityTier,
  QuotationResult,
  KitchenShape,
  StandardizedServicesState,
  ShippingZone,
  ShippingConfig,
} from './quotation.types';
import {
  JAYKA_SERVICES,
  STANDARDIZED_SERVICES,
  KITCHEN_PRICE_PER_ML,
  KITCHEN_DEDUCTION_SUPERIOR_L,
  KITCHEN_DEDUCTION_INFERIOR_L,
  CLOSET_PRICE_PER_M2,
  DOOR_PRICE_UNDER_90,
  DOOR_PRICE_OVER_90,
  TV_UNIT_PRICE_PER_SHEET,
  QUALITY_OPTIONS,
  PRESET_DESTINATIONS,
  DEFAULT_FUEL_RATE_PER_KM,
  DEFAULT_TOLL_COST,
  type PresetDestination,
} from './pricingData';
import { calculateQuotation } from './useQuotationCalculator';

interface CotizadorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceId?: string;
}

// Formateador de moneda colombiana (COP)
const fmt = (num: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num);

const TOTAL_STEPS = 5;

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

  // Paso 2: Servicios y Medidas
  const [selectedServices, setSelectedServices] = useState<ServiceCategory[]>(['cocinas']);
  const [areaM2, setAreaM2] = useState<number>(30);
  const [serviceAreas, setServiceAreas] = useState<Partial<Record<ServiceCategory, number>>>({});
  const [bathroomCount, setBathroomCount] = useState<number>(1);
  const [showOtherServices, setShowOtherServices] = useState<boolean>(false);

  // Estados específicos para los servicios estandarizados
  // 1. Cocina
  const [kitchenShape, setKitchenShape] = useState<KitchenShape>('lineal');
  const [kitchenLinearMeters, setKitchenLinearMeters] = useState<number>(3.0);
  const [kitchenLadoA, setKitchenLadoA] = useState<number>(2.5);
  const [kitchenLadoB, setKitchenLadoB] = useState<number>(2.0);

  // 2. Closets
  const [closetWidth, setClosetWidth] = useState<number>(2.0);
  const [closetHeight, setClosetHeight] = useState<number>(2.3);
  const [closetM2, setClosetM2] = useState<number>(4.6);
  const [closetMode, setClosetMode] = useState<'dimensions' | 'direct'>('dimensions');

  // 3. Puertas Entamboradas
  const [doorsUnder90, setDoorsUnder90] = useState<number>(2);
  const [doorsOver90, setDoorsOver90] = useState<number>(0);

  // 4. Centros de Entretenimiento
  const [tvSheetsCount, setTvSheetsCount] = useState<number>(1);

  // Paso 3: Calidad
  const [qualityTier, setQualityTier] = useState<QualityTier>('baja'); // Estándar incluida por defecto

  // Paso 4: Logística de Envío y Domicilio
  const [shippingZone, setShippingZone] = useState<ShippingZone>('villavicencio');
  const [destinationPresetId, setDestinationPresetId] = useState<string>('villavicencio');
  const [destinationCity, setDestinationCity] = useState<string>('Villavicencio');
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [fuelCostPerKm, setFuelCostPerKm] = useState<number>(DEFAULT_FUEL_RATE_PER_KM);
  const [tollCount, setTollCount] = useState<number>(0);
  const [tollCostEach, setTollCostEach] = useState<number>(DEFAULT_TOLL_COST);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  // Paso 5: Resultado y Estado
  const [result, setResult] = useState<QuotationResult | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasSaved, setHasSaved] = useState<boolean>(false);

  // Auto-cálculo reactivo de medidas de cocina en L
  const kitchenLadoTotal = kitchenLadoA + kitchenLadoB;
  const kitchenMlSup = Math.max(0.2, kitchenLadoTotal - KITCHEN_DEDUCTION_SUPERIOR_L);
  const kitchenMlInf = Math.max(0.2, kitchenLadoTotal - KITCHEN_DEDUCTION_INFERIOR_L);
  const kitchenEffectiveMl =
    kitchenShape === 'lineal'
      ? kitchenLinearMeters
      : Math.round(((kitchenMlSup + kitchenMlInf) / 2) * 100) / 100;

  // Actualizar m² de closet cuando cambian las dimensiones
  useEffect(() => {
    if (closetMode === 'dimensions') {
      setClosetM2(Math.round(closetWidth * closetHeight * 100) / 100);
    }
  }, [closetWidth, closetHeight, closetMode]);

  // Si se abre con un servicio inicial desde la landing
  useEffect(() => {
    if (initialServiceId && isOpen) {
      let matched: ServiceCategory | undefined;
      const lower = initialServiceId.toLowerCase();
      if (lower.includes('cocin')) matched = 'cocinas';
      else if (lower.includes('closet')) matched = 'closets';
      else if (lower.includes('puert')) matched = 'puertas';
      else if (lower.includes('tv') || lower.includes('entretenimiento')) matched = 'centros_tv';
      else {
        const found = JAYKA_SERVICES.find(
          (s) => s.id === initialServiceId || s.category.toLowerCase().includes(lower)
        );
        if (found) matched = found.id;
      }
      if (matched && !selectedServices.includes(matched)) {
        setSelectedServices([matched]);
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

  // Construir objeto consolidado de estado estandarizado
  const currentStandardizedState = useMemo<StandardizedServicesState>(() => {
    return {
      kitchen: {
        shape: kitchenShape,
        linearMeters: kitchenLinearMeters,
        ladoA: kitchenLadoA,
        ladoB: kitchenLadoB,
        deductionSuperior: KITCHEN_DEDUCTION_SUPERIOR_L,
        deductionInferior: KITCHEN_DEDUCTION_INFERIOR_L,
        mlSuperior: kitchenMlSup,
        mlInferior: kitchenMlInf,
        mlCalculated: kitchenEffectiveMl,
      },
      closet: {
        width: closetWidth,
        height: closetHeight,
        m2: closetM2,
      },
      doors: {
        under90: doorsUnder90,
        over90: doorsOver90,
      },
      tvUnit: {
        sheetsCount: tvSheetsCount,
      },
    };
  }, [
    kitchenShape,
    kitchenLinearMeters,
    kitchenLadoA,
    kitchenLadoB,
    kitchenMlSup,
    kitchenMlInf,
    kitchenEffectiveMl,
    closetWidth,
    closetHeight,
    closetM2,
    doorsUnder90,
    doorsOver90,
    tvSheetsCount,
  ]);

  // Configuración reactiva de envío y transporte
  const currentShippingConfig = useMemo<ShippingConfig>(() => {
    const isVillar = shippingZone === 'villavicencio';
    const fuelCost = isVillar ? 0 : Math.round(distanceKm * fuelCostPerKm);
    const tollsTotal = isVillar ? 0 : Math.round(tollCount * tollCostEach);
    const shippingCost = fuelCost + tollsTotal;
    const tollText = tollCount > 0 ? ` + ${tollCount} peaje(s)` : '';
    const shippingDetails = isVillar
      ? 'Envío e instalación urbana en Villavicencio (100% Incluido)'
      : `Transporte intermunicipal a ${destinationCity} (${distanceKm} km${tollText})`;

    return {
      zone: shippingZone,
      destinationCity,
      distanceKm,
      fuelCostPerKm,
      tollCount,
      tollCostEach,
      shippingCost,
      shippingDetails,
    };
  }, [
    shippingZone,
    destinationCity,
    distanceKm,
    fuelCostPerKm,
    tollCount,
    tollCostEach,
  ]);

  // Subtotal en tiempo real para el paso 2 y paso 4
  const livePreviewQuote = useMemo(() => {
    return calculateQuotation({
      selectedServices,
      areaM2,
      serviceAreas,
      bathroomCount,
      standardizedState: currentStandardizedState,
      qualityTier,
      shipping: currentShippingConfig,
    });
  }, [
    selectedServices,
    areaM2,
    serviceAreas,
    bathroomCount,
    currentStandardizedState,
    qualityTier,
    currentShippingConfig,
  ]);

  // Manejar cambio de destino predefinido
  const handleSelectPresetDestination = (preset: PresetDestination) => {
    setDestinationPresetId(preset.id);
    setShippingZone(preset.zone);
    if (preset.zone === 'villavicencio') {
      setDestinationCity('Villavicencio');
      setDistanceKm(0);
      setTollCount(0);
      setFuelCostPerKm(0);
      setTollCostEach(0);
    } else {
      setDestinationCity(preset.name.split(' (')[0]);
      setDistanceKm(preset.distanceKm);
      setTollCount(preset.tollCount);
      setFuelCostPerKm(preset.fuelCostPerKm > 0 ? preset.fuelCostPerKm : DEFAULT_FUEL_RATE_PER_KM);
      setTollCostEach(preset.tollCostEach > 0 ? preset.tollCostEach : DEFAULT_TOLL_COST);
    }
  };

  // Validar si el usuario puede avanzar
  const canProceed = useCallback(() => {
    switch (step) {
      case 1:
        return clientName.trim().length >= 2 && clientPhone.trim().length >= 7;
      case 2: {
        if (selectedServices.length === 0) return false;
        if (selectedServices.includes('cocinas')) {
          if (kitchenShape === 'lineal' && kitchenLinearMeters <= 0) return false;
          if (kitchenShape === 'en_l' && (kitchenLadoA <= 0 || kitchenLadoB <= 0)) return false;
        }
        if (selectedServices.includes('closets')) {
          if (closetM2 <= 0) return false;
        }
        if (selectedServices.includes('puertas')) {
          if (doorsUnder90 <= 0 && doorsOver90 <= 0) return false;
        }
        if (selectedServices.includes('centros_tv')) {
          if (tvSheetsCount <= 0) return false;
        }
        return true;
      }
      case 3:
        return true;
      case 4: {
        if (shippingZone === 'fuera') {
          return destinationCity.trim().length >= 2 && distanceKm > 0;
        }
        return true;
      }
      default:
        return false;
    }
  }, [
    step,
    clientName,
    clientPhone,
    selectedServices,
    kitchenShape,
    kitchenLinearMeters,
    kitchenLadoA,
    kitchenLadoB,
    closetM2,
    doorsUnder90,
    doorsOver90,
    tvSheetsCount,
    shippingZone,
    destinationCity,
    distanceKm,
  ]);

  // Avanzar
  const goNext = () => {
    if (step === 4) {
      const computedResult = calculateQuotation({
        selectedServices,
        areaM2,
        serviceAreas,
        bathroomCount,
        standardizedState: currentStandardizedState,
        qualityTier,
        shipping: currentShippingConfig,
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
      .map(
        (li) =>
          `• *${li.service}* (${li.area} ${li.unit} a ${fmt(li.unitPrice)}): *${fmt(li.subtotal)}*` +
          (li.details ? `\n   _${li.details}_` : '')
      )
      .join('\n\n');

    const shippingMsg =
      result.shippingCost > 0
        ? `🚚 *Transporte y Flete:* ${result.shippingDetails} (+${fmt(result.shippingCost)})\n`
        : `🚚 *Transporte y Entrega:* 100% Incluido en Villavicencio ($0 COP)\n`;

    return (
      `🏛️ *COTIZACIÓN DE PROYECTO — JAYKA CREANDO ESPACIOS*\n\n` +
      `¡Hola equipo Jayka! Acabo de generar mi presupuesto en su cotizador online:\n\n` +
      `👤 *Cliente:* ${clientName}\n` +
      `📞 *Teléfono:* ${clientPhone}\n` +
      (clientEmail ? `✉️ *Email:* ${clientEmail}\n` : '') +
      `📍 *Ubicación del Proyecto:* ${projectLocation}\n` +
      `✨ *Gama:* ${QUALITY_OPTIONS.find((q) => q.value === qualityTier)?.label}\n\n` +
      `*Partidas Cotizadas:*\n${servicesList}\n\n` +
      shippingMsg +
      (additionalNotes.trim() ? `📝 *Observaciones de entrega:* ${additionalNotes.trim()}\n` : '') +
      `\n💰 *VALOR ESTIMADO TOTAL: ${fmt(result.grandTotal)} COP*\n` +
      `✅ *Condición comercial:* Tarifa Todo Incluido (materiales RH, mano de obra, herrajes de cierre suave, flete e instalación).\n` +
      `⏱️ *Tiempo aproximado:* ~${result.estimatedDays} días hábiles\n\n` +
      (wantsContact
        ? `✅ *Deseo agendar visita técnica presencial para confirmar medidas exactas en el lugar.*`
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
    doc.setTextColor(44, 185, 155); // #2CB99B
    doc.text('PRESUPUESTO FORMAL', 196, 18, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Jayka Creando Espacios S.A.S.', 196, 24, { align: 'right' });
    doc.text('Carpintería Arquitectónica · Mobiliario a Medida · Remodelaciones', 196, 29, { align: 'right' });
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
      `Fecha: ${now.toLocaleDateString('es-CO')}  |  Vigencia: 15 días calendario`,
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
    doc.text(`Destino Entrega: ${result.destinationCity}`, 110, 68);

    // 4. Tabla de Partidas con AutoTable
    const tableBody = result.lineItems.map((li) => [
      li.details ? `${li.service}\n${li.details}` : li.service,
      `${li.area} ${li.unit}`,
      fmt(li.unitPrice),
      fmt(li.subtotal),
    ]);

    autoTable(doc, {
      startY: 82,
      head: [['Concepto / Servicio Especializado', 'Medida', 'Precio Unitario', 'Subtotal']],
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

    // 5. Desglose Financiero con Logística
    const totalsRows: [string, string][] = [
      ['Subtotal partidas directas', fmt(result.subtotalServices)],
      [
        'Transporte, Logística y Domicilio',
        result.shippingCost > 0
          ? `+${fmt(result.shippingCost)} (${result.destinationCity})`
          : 'Incluido ($0 COP - Villavicencio)',
      ],
      ['Modalidad comercial', 'Tarifa Todo Incluido'],
    ];

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
    currentY = (doc.lastAutoTable?.finalY ?? currentY + 30) + 6;

    // Total en caja destacada
    doc.setFillColor(240, 253, 250);
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
    doc.text(`Tiempo de fabricación: ~${result.estimatedDays} días hábiles`, 102, currentY + 14);

    // 6. Términos y Condiciones al pie
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      '• Todos los valores incluyen: Melamina RH antihumedad, herrajes de cierre suave, mano de obra, transporte e instalación.',
      14,
      262
    );
    doc.text(
      '• Este presupuesto constituye un cálculo preliminar con base en los datos ingresados en el cotizador digital.',
      14,
      267
    );
    doc.text(
      '• Se formaliza previa toma de medidas exacta en obra física por parte del equipo técnico de Jayka Creando Espacios.',
      14,
      272
    );
    doc.text(
      '• Canal oficial de atención y agendamiento: WhatsApp +57 312 493 7069 | facturacionjayka@gmail.com',
      14,
      277
    );

    // Guardar archivo local
    const filename = `Cotizacion_Jayka_${clientName.trim().replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
    return filename;
  };

  // Abre el chat de WhatsApp en una nueva pestaña
  const openWhatsApp = () => {
    if (!result) return;
    const url = `https://wa.me/573124937069?text=${encodeURIComponent(buildWhatsAppMessage())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Descarga PDF → espera 4 s → abre WhatsApp → espera 1 s → cierra y reinicia
  const handleDownloadPDF = async () => {
    if (!result) return;
    persistQuotation(result);
    await generatePDF();
    setTimeout(() => {
      openWhatsApp();
      setTimeout(() => {
        handleReset();
        onClose();
      }, 1_000);
    }, 4_000);
  };

  // Abre WhatsApp → espera 4 s → descarga PDF → espera 1 s → cierra y reinicia
  const handleSendWhatsApp = () => {
    if (!result) return;
    persistQuotation(result);
    openWhatsApp();
    setTimeout(async () => {
      await generatePDF();
      setTimeout(() => {
        handleReset();
        onClose();
      }, 1_000);
    }, 4_000);
  };

  // Manejar cierre del modal: siempre reiniciar el formulario
  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Reiniciar cotizador
  const handleReset = () => {
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setProjectLocation('Villavicencio, Meta');
    setWantsContact(true);
    setSelectedServices(['cocinas']);
    setAreaM2(30);
    setServiceAreas({});
    setBathroomCount(1);
    setKitchenShape('lineal');
    setKitchenLinearMeters(3.0);
    setKitchenLadoA(2.5);
    setKitchenLadoB(2.0);
    setClosetWidth(2.0);
    setClosetHeight(2.3);
    setClosetM2(4.6);
    setDoorsUnder90(2);
    setDoorsOver90(0);
    setTvSheetsCount(1);
    setQualityTier('baja');
    setShippingZone('villavicencio');
    setDestinationPresetId('villavicencio');
    setDestinationCity('Villavicencio');
    setDistanceKm(0);
    setFuelCostPerKm(DEFAULT_FUEL_RATE_PER_KM);
    setTollCount(0);
    setTollCostEach(DEFAULT_TOLL_COST);
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
        <div className="px-6 py-4 sm:px-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2CB99B]/10 flex items-center justify-center text-[#2CB99B]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                Jayka Creando Espacios
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Cotizador Inteligente Estandarizado
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
              Paso {step} de {TOTAL_STEPS}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
              aria-label="Cerrar cotizador"
              onClick={handleClose}
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
                  Ingresa tus datos para generar un presupuesto formal personalizado con tarifas directas.
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
                    Ubicación del Inmueble
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ej: Villavicencio, Meta (Conjunto / Barrio)"
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
                      Un asesor de Jayka te contactará directamente para confirmar medidas exactas en tu obra.
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

          {/* PASO 2: Selección de Servicios y Medidas Estandarizadas */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Precios Estandarizados · Todo Incluido
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Servicios y Medidas</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Selecciona los módulos a medida. Todos los precios incluyen tableros RH, herrajes de cierre suave e instalación.
                  </p>
                </div>

                <div className="bg-teal-50/70 p-3 rounded-2xl border border-teal-200/60 flex items-center gap-3 shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-[#2CB99B] text-white flex items-center justify-center font-bold text-sm">
                    {selectedServices.length}
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase">Partidas Activas</div>
                    <div className="text-sm font-extrabold text-[#0D9488]">
                      {fmt(livePreviewQuote.subtotalServices)}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── LAS 4 TARJETAS ESTANDARIZADAS ────────────────────── */}
              <div className="space-y-4">
                {/* 1. MOBILIARIO DE COCINA INTEGRAL */}
                <div
                  className={`rounded-2xl border-2 transition-all p-5 ${
                    selectedServices.includes('cocinas')
                      ? 'border-[#2CB99B] bg-white shadow-sm ring-1 ring-[#2CB99B]/30'
                      : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => toggleService('cocinas')}
                      className="cursor-pointer flex items-start gap-3 flex-1"
                    >
                      <span className="text-2xl p-2.5 bg-white rounded-2xl shadow-xs border border-gray-100">
                        🍳
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-gray-900">
                            Mobiliario de Cocina Integral
                          </h4>
                          <span className="text-xs font-extrabold px-2.5 py-0.5 bg-[#2CB99B]/10 text-[#0D9488] rounded-full">
                            {fmt(KITCHEN_PRICE_PER_ML)} / metro lineal
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Mueble superior e inferior completo, melamina RH antihumedad, mesón y herrajes de cierre suave.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleService('cocinas')}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 mt-1 ${
                        selectedServices.includes('cocinas')
                          ? 'border-[#2CB99B] bg-[#2CB99B]'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {selectedServices.includes('cocinas') && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>

                  {/* Panel de configuración si está seleccionada */}
                  {selectedServices.includes('cocinas') && (
                    <div className="mt-4 pt-4 border-t border-[#2CB99B]/20 space-y-4">
                      {/* Selector Lineal vs En L */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Tipo de Distribución:
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setKitchenShape('lineal')}
                            className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                              kitchenShape === 'lineal'
                                ? 'border-[#2CB99B] bg-[#2CB99B]/10 text-[#0D9488]'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            📏 Cocina Lineal
                          </button>

                          <button
                            type="button"
                            onClick={() => setKitchenShape('en_l')}
                            className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                              kitchenShape === 'en_l'
                                ? 'border-[#2CB99B] bg-[#2CB99B]/10 text-[#0D9488]'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            📐 Cocina en "L"
                          </button>
                        </div>
                      </div>

                      {/* Configuración Lineal */}
                      {kitchenShape === 'lineal' && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <span className="text-xs font-bold text-gray-800">
                                Largo total de pared (metros lineales):
                              </span>
                              <p className="text-[11px] text-gray-500">
                                Medida horizontal de la pared donde se instalará la cocina.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setKitchenLinearMeters((m) =>
                                    Math.max(1, Math.round((m - 0.5) * 10) / 10)
                                  )
                                }
                                className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-300">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="1"
                                  max="25"
                                  value={kitchenLinearMeters}
                                  onChange={(e) =>
                                    setKitchenLinearMeters(
                                      Math.max(0.5, parseFloat(e.target.value) || 0)
                                    )
                                  }
                                  className="w-14 text-sm font-bold text-center focus:outline-none"
                                />
                                <span className="text-xs font-semibold text-gray-500">ml</span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setKitchenLinearMeters((m) =>
                                    Math.round((m + 0.5) * 10) / 10
                                  )
                                }
                                className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                            <span className="text-gray-600 font-medium">
                              Subtotal estimado ({kitchenLinearMeters.toFixed(2)} ml):
                            </span>
                            <span className="text-sm font-extrabold text-[#0D9488]">
                              {fmt(kitchenLinearMeters * KITCHEN_PRICE_PER_ML)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Configuración En L */}
                      {kitchenShape === 'en_l' && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">
                                Lado 1 de la L (metros):
                              </label>
                              <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-300">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0.5"
                                  max="20"
                                  value={kitchenLadoA}
                                  onChange={(e) =>
                                    setKitchenLadoA(
                                      Math.max(0.5, parseFloat(e.target.value) || 0)
                                    )
                                  }
                                  className="w-full text-sm font-bold focus:outline-none"
                                />
                                <span className="text-xs font-semibold text-gray-500">m</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">
                                Lado 2 de la L (metros):
                              </label>
                              <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-300">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0.5"
                                  max="20"
                                  value={kitchenLadoB}
                                  onChange={(e) =>
                                    setKitchenLadoB(
                                      Math.max(0.5, parseFloat(e.target.value) || 0)
                                    )
                                  }
                                  className="w-full text-sm font-bold focus:outline-none"
                                />
                                <span className="text-xs font-semibold text-gray-500">m</span>
                              </div>
                            </div>
                          </div>

                          {/* Desglose de descuentos estándar */}
                          <div className="p-3 bg-white rounded-xl border border-emerald-200/80 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-gray-500">
                              <span>Suma de paredes brutas ({kitchenLadoA.toFixed(2)}m + {kitchenLadoB.toFixed(2)}m):</span>
                              <span className="font-semibold">{kitchenLadoTotal.toFixed(2)} m</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-700">
                              <span>• Mueble superior (descuento esquina 0.30 m):</span>
                              <span className="font-bold text-gray-900">{kitchenMlSup.toFixed(2)} ml</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-700">
                              <span>• Mueble inferior (descuento esquina 0.60 m):</span>
                              <span className="font-bold text-gray-900">{kitchenMlInf.toFixed(2)} ml</span>
                            </div>
                            <div className="pt-2 border-t border-gray-100 flex items-center justify-between font-bold text-[#0D9488]">
                              <span>Metraje lineal liquidado:</span>
                              <span className="text-sm">{kitchenEffectiveMl.toFixed(2)} ml</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-gray-600 font-medium">
                              Subtotal estimado Cocina en L:
                            </span>
                            <span className="text-sm font-extrabold text-[#0D9488]">
                              {fmt(kitchenEffectiveMl * KITCHEN_PRICE_PER_ML)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. CLOSETS & VESTIERES */}
                <div
                  className={`rounded-2xl border-2 transition-all p-5 ${
                    selectedServices.includes('closets')
                      ? 'border-[#2CB99B] bg-white shadow-sm ring-1 ring-[#2CB99B]/30'
                      : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => toggleService('closets')}
                      className="cursor-pointer flex items-start gap-3 flex-1"
                    >
                      <span className="text-2xl p-2.5 bg-white rounded-2xl shadow-xs border border-gray-100">
                        🚪
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-gray-900">
                            Closets & Vestieres
                          </h4>
                          <span className="text-xs font-extrabold px-2.5 py-0.5 bg-[#2CB99B]/10 text-[#0D9488] rounded-full">
                            {fmt(CLOSET_PRICE_PER_M2)} / m²
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Distribución personalizada con cajonería, zapatero, maletero y tubos colgadores en melamina RH.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleService('closets')}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 mt-1 ${
                        selectedServices.includes('closets')
                          ? 'border-[#2CB99B] bg-[#2CB99B]'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {selectedServices.includes('closets') && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>

                  {selectedServices.includes('closets') && (
                    <div className="mt-4 pt-4 border-t border-[#2CB99B]/20 space-y-4">
                      {/* Modo de ingreso */}
                      <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="closetMode"
                            checked={closetMode === 'dimensions'}
                            onChange={() => setClosetMode('dimensions')}
                            className="text-[#2CB99B] focus:ring-[#2CB99B]"
                          />
                          Calcular por Medidas (Ancho × Alto)
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="closetMode"
                            checked={closetMode === 'direct'}
                            onChange={() => setClosetMode('direct')}
                            className="text-[#2CB99B] focus:ring-[#2CB99B]"
                          />
                          Ingresar m² Directos
                        </label>
                      </div>

                      {closetMode === 'dimensions' ? (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">
                                Ancho del Closet (m):
                              </label>
                              <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-300">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0.5"
                                  max="15"
                                  value={closetWidth}
                                  onChange={(e) =>
                                    setClosetWidth(
                                      Math.max(0.5, parseFloat(e.target.value) || 0)
                                    )
                                  }
                                  className="w-full text-sm font-bold focus:outline-none"
                                />
                                <span className="text-xs font-semibold text-gray-500">m</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">
                                Alto del Closet (m):
                              </label>
                              <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-300">
                                <input
                                  type="number"
                                  step="0.05"
                                  min="1.0"
                                  max="3.5"
                                  value={closetHeight}
                                  onChange={(e) =>
                                    setClosetHeight(
                                      Math.max(1.0, parseFloat(e.target.value) || 0)
                                    )
                                  }
                                  className="w-full text-sm font-bold focus:outline-none"
                                />
                                <span className="text-xs font-semibold text-gray-500">m</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                            <span className="text-gray-600 font-medium">
                              Área calculada: <strong>{closetM2.toFixed(2)} m²</strong> ({closetWidth.toFixed(2)}m × {closetHeight.toFixed(2)}m)
                            </span>
                            <span className="text-sm font-extrabold text-[#0D9488]">
                              {fmt(closetM2 * CLOSET_PRICE_PER_M2)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-gray-800">
                              Área total de closets en m²:
                            </span>
                            <p className="text-[11px] text-gray-500">
                              Suma el área de todos los closets a fabricar.
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-300">
                            <input
                              type="number"
                              step="0.1"
                              min="1"
                              max="100"
                              value={closetM2}
                              onChange={(e) =>
                                setClosetM2(Math.max(0.5, parseFloat(e.target.value) || 0))
                              }
                              className="w-16 text-sm font-bold text-center focus:outline-none"
                            />
                            <span className="text-xs font-semibold text-gray-500">m²</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. PUERTAS ENTAMBORADAS */}
                <div
                  className={`rounded-2xl border-2 transition-all p-5 ${
                    selectedServices.includes('puertas')
                      ? 'border-[#2CB99B] bg-white shadow-sm ring-1 ring-[#2CB99B]/30'
                      : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => toggleService('puertas')}
                      className="cursor-pointer flex items-start gap-3 flex-1"
                    >
                      <span className="text-2xl p-2.5 bg-white rounded-2xl shadow-xs border border-gray-100">
                        🪵
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-gray-900">
                            Puertas Entamboradas
                          </h4>
                          <span className="text-xs font-extrabold px-2.5 py-0.5 bg-[#2CB99B]/10 text-[#0D9488] rounded-full">
                            Desde {fmt(DOOR_PRICE_UNDER_90)} / unidad
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Puertas de paso interiores con marco, cerradura e instalación completa.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleService('puertas')}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 mt-1 ${
                        selectedServices.includes('puertas')
                          ? 'border-[#2CB99B] bg-[#2CB99B]'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {selectedServices.includes('puertas') && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>

                  {selectedServices.includes('puertas') && (
                    <div className="mt-4 pt-4 border-t border-[#2CB99B]/20 space-y-3">
                      {/* Opción 1: Hasta 90 cm */}
                      <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900">
                              Puertas hasta 90 cm de ancho:
                            </span>
                            <span className="text-xs font-bold text-[#0D9488]">
                              {fmt(DOOR_PRICE_UNDER_90)} c/u
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500">
                            Medida estándar para alcobas, baños y estudios (60 a 90 cm).
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDoorsUnder90((c) => Math.max(0, c - 1))}
                            className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">
                            {doorsUnder90}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDoorsUnder90((c) => c + 1)}
                            className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Opción 2: Desde 90 cm en adelante */}
                      <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900">
                              Puertas desde 90 cm en adelante:
                            </span>
                            <span className="text-xs font-bold text-[#0D9488]">
                              {fmt(DOOR_PRICE_OVER_90)} c/u
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500">
                            Gran formato, puertas principales o vanos especiales mayores a 90 cm.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDoorsOver90((c) => Math.max(0, c - 1))}
                            className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">
                            {doorsOver90}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDoorsOver90((c) => c + 1)}
                            className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">
                          Total puertas: {doorsUnder90 + doorsOver90} und
                        </span>
                        <span className="text-sm font-extrabold text-[#0D9488]">
                          {fmt(
                            doorsUnder90 * DOOR_PRICE_UNDER_90 +
                              doorsOver90 * DOOR_PRICE_OVER_90
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. CENTROS DE ENTRETENIMIENTO & TV */}
                <div
                  className={`rounded-2xl border-2 transition-all p-5 ${
                    selectedServices.includes('centros_tv')
                      ? 'border-[#2CB99B] bg-white shadow-sm ring-1 ring-[#2CB99B]/30'
                      : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => toggleService('centros_tv')}
                      className="cursor-pointer flex items-start gap-3 flex-1"
                    >
                      <span className="text-2xl p-2.5 bg-white rounded-2xl shadow-xs border border-gray-100">
                        📺
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-gray-900">
                            Centros de Entretenimiento & TV
                          </h4>
                          <span className="text-xs font-extrabold px-2.5 py-0.5 bg-[#2CB99B]/10 text-[#0D9488] rounded-full">
                            {fmt(TV_UNIT_PRICE_PER_SHEET)} / lámina de material
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Paneles flotantes, muebles suspendidos y repisas. Incluye lámina, mano de obra, herrajes y transporte.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleService('centros_tv')}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 mt-1 ${
                        selectedServices.includes('centros_tv')
                          ? 'border-[#2CB99B] bg-[#2CB99B]'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {selectedServices.includes('centros_tv') && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>

                  {selectedServices.includes('centros_tv') && (
                    <div className="mt-4 pt-4 border-t border-[#2CB99B]/20 space-y-3">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-gray-800">
                              Cantidad estimada de láminas de material:
                            </span>
                            <p className="text-[11px] text-gray-500">
                              Cada lámina cubre aprox. 4.4 m² (tablero completo 2.44m × 1.83m).
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setTvSheetsCount((c) => Math.max(1, c - 1))}
                              className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-gray-900">
                              {tvSheetsCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => setTvSheetsCount((c) => c + 1)}
                              className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Guía rápida de láminas */}
                        <div className="p-3 bg-white rounded-lg border border-gray-200 text-[11px] text-gray-600 space-y-1">
                          <div className="font-bold text-gray-800 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-[#2CB99B]" />
                            Guía orientativa de diseño:
                          </div>
                          <div>
                            • <strong>1 Lámina:</strong> Panel flotante sencillo para TV hasta 55" o mueble suspendido básico.
                          </div>
                          <div>
                            • <strong>2 Láminas:</strong> Panel TV completo hasta 65" con mueble bajo suspendido con cajones.
                          </div>
                          <div>
                            • <strong>3+ Láminas:</strong> Muro completo alistonado, biblioteca lateral o diseño de pared a pared.
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                          <span className="text-gray-600 font-medium">
                            Subtotal estimado ({tvSheetsCount} lámina{tvSheetsCount > 1 ? 's' : ''}):
                          </span>
                          <span className="text-sm font-extrabold text-[#0D9488]">
                            {fmt(tvSheetsCount * TV_UNIT_PRICE_PER_SHEET)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── ACORDEÓN PARA OTROS SERVICIOS OPCIONALES ──────────── */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtherServices(!showOtherServices)}
                  className="w-full py-3 px-4 rounded-xl border border-dashed border-gray-300 bg-gray-50/60 hover:bg-gray-100 text-xs font-bold text-gray-600 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gray-400" />
                    ¿Deseas agregar otros servicios? (Ventanería, Drywall, Pisos, Baños)
                  </span>
                  {showOtherServices ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {showOtherServices && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 animate-fade-in">
                    {JAYKA_SERVICES.filter(
                      (s) => !STANDARDIZED_SERVICES.includes(s.id)
                    ).map((svc) => {
                      const isSelected = selectedServices.includes(svc.id);
                      return (
                        <div
                          key={svc.id}
                          onClick={() => toggleService(svc.id)}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-[#2CB99B] bg-[#2CB99B]/5'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{svc.icon}</span>
                            <div>
                              <div className="text-xs font-bold text-gray-900">{svc.label}</div>
                              <div className="text-[11px] text-gray-400">
                                Desde {fmt(svc.pricing.baja.totalM2)} / {svc.unit}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-[#2CB99B] bg-[#2CB99B]' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASO 3: Nivel de Acabados / Gama */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Estándar de Acabados y Materiales</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Nuestros precios estandarizados corresponden a la <strong>Línea Estándar Jayka</strong> (incluida sin recargos). Si deseas acabados especiales o herrajes de gama superior, puedes seleccionar una línea opcional.
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

                        <h3 className="text-base font-bold text-gray-900 mb-1">{opt.label}</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">{opt.desc}</p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#2CB99B]" />
                          Garantía Jayka
                        </span>
                        <span className="font-bold text-gray-700">
                          {opt.factor === 1.0 ? 'Tarifa Base' : `+${Math.round((opt.factor - 1) * 100)}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Vista previa con la gama elegida */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Total Partidas con {QUALITY_OPTIONS.find((q) => q.value === qualityTier)?.label}:
                  </span>
                  <span className="text-base font-extrabold text-[#0D9488]">
                    {fmt(livePreviewQuote.subtotalServices)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PASO 4: Logística de Envío y Domicilio */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  Logística, Transporte y Domicilio
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Destino de Entrega e Instalación</h2>
                <p className="text-sm text-gray-500 mt-1">
                  El transporte dentro de <strong>Villavicencio está 100% incluido</strong>. Si tu proyecto es en otro municipio, calculamos el flete considerando kilometraje, combustible y peajes.
                </p>
              </div>

              {/* Dos opciones principales: Dentro vs Fuera */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() =>
                    handleSelectPresetDestination(
                      PRESET_DESTINATIONS.find((p) => p.id === 'villavicencio')!
                    )
                  }
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    shippingZone === 'villavicencio'
                      ? 'border-[#2CB99B] bg-[#2CB99B]/5 shadow-md ring-2 ring-[#2CB99B]/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                          shippingZone === 'villavicencio'
                            ? 'bg-[#2CB99B] text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                          Envío Incluido
                        </span>
                        <h4 className="text-base font-bold text-gray-900 mt-1">
                          Dentro de Villavicencio
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Casco urbano y zonas residenciales de la ciudad.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        shippingZone === 'villavicencio'
                          ? 'border-[#2CB99B] bg-[#2CB99B]'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {shippingZone === 'villavicencio' && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Costo de flete:</span>
                    <span className="font-extrabold text-[#0D9488] text-sm">$0 COP (Gratis)</span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    if (shippingZone === 'villavicencio') {
                      handleSelectPresetDestination(
                        PRESET_DESTINATIONS.find((p) => p.id === 'acacias')!
                      );
                    }
                  }}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    shippingZone === 'fuera'
                      ? 'border-[#2CB99B] bg-[#2CB99B]/5 shadow-md ring-2 ring-[#2CB99B]/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                          shippingZone === 'fuera'
                            ? 'bg-[#2CB99B] text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                          Intermunicipal
                        </span>
                        <h4 className="text-base font-bold text-gray-900 mt-1">
                          Fuera de Villavicencio
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Acacías, Restrepo, Cumaral, Puerto López, Bogotá y más.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        shippingZone === 'fuera'
                          ? 'border-[#2CB99B] bg-[#2CB99B]'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {shippingZone === 'fuera' && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Cálculo de flete:</span>
                    <span className="font-extrabold text-blue-700 text-sm">Km + Combustible + Peajes</span>
                  </div>
                </div>
              </div>

              {/* Panel de configuración cuando es Fuera de Villavicencio */}
              {shippingZone === 'fuera' && (
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-[#2CB99B]" />
                      Selecciona un Destino Frecuente o Personalizado:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {PRESET_DESTINATIONS.filter((p) => p.zone === 'fuera').map((preset) => {
                        const isPresetActive = destinationPresetId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPresetDestination(preset)}
                            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                              isPresetActive
                                ? 'border-[#2CB99B] bg-white ring-2 ring-[#2CB99B]/30 shadow-xs'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div>
                              <div
                                className={`text-xs font-bold truncate ${
                                  isPresetActive ? 'text-[#0D9488]' : 'text-gray-800'
                                }`}
                              >
                                {preset.name}
                              </div>
                              <div className="text-[11px] text-gray-400 mt-0.5">
                                ~{preset.distanceKm} km {preset.tollCount > 0 ? `· ${preset.tollCount} peaje(s)` : ''}
                              </div>
                            </div>
                            <div className="mt-2 text-xs font-extrabold text-gray-900">
                              {fmt(
                                preset.distanceKm * (preset.fuelCostPerKm || DEFAULT_FUEL_RATE_PER_KM) +
                                  preset.tollCount * (preset.tollCostEach || DEFAULT_TOLL_COST)
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detalle y ajuste manual */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Municipio o Destino:
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={destinationCity}
                            onChange={(e) => {
                              setDestinationCity(e.target.value);
                              setDestinationPresetId('personalizado');
                            }}
                            placeholder="Ej: Acacías, Restrepo..."
                            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-bold border border-gray-200 rounded-lg focus:outline-none focus:border-[#2CB99B]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Distancia (Kilómetros):
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setDistanceKm((k) => Math.max(5, k - 5));
                              setDestinationPresetId('personalizado');
                            }}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center shrink-0"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex-1 flex items-center justify-center gap-1 bg-gray-50 border border-gray-200 px-2 py-1.5 rounded-lg">
                            <input
                              type="number"
                              min="1"
                              max="1500"
                              value={distanceKm}
                              onChange={(e) => {
                                setDistanceKm(Math.max(1, parseInt(e.target.value) || 0));
                                setDestinationPresetId('personalizado');
                              }}
                              className="w-14 text-center font-bold text-sm bg-transparent focus:outline-none"
                            />
                            <span className="text-xs text-gray-500 font-semibold">km</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDistanceKm((k) => k + 5);
                              setDestinationPresetId('personalizado');
                            }}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Peajes en la Ruta:
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setTollCount((t) => Math.max(0, t - 1));
                              setDestinationPresetId('personalizado');
                            }}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center shrink-0"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex-1 flex items-center justify-center gap-1 bg-gray-50 border border-gray-200 px-2 py-1.5 rounded-lg">
                            <span className="font-bold text-sm text-gray-900">{tollCount}</span>
                            <span className="text-xs text-gray-500 font-semibold">peaje(s)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setTollCount((t) => t + 1);
                              setDestinationPresetId('personalizado');
                            }}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Resumen de cálculo del flete */}
                    <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs border border-gray-200">
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Fuel className="w-3.5 h-3.5 text-amber-600" />
                          Combustible y transporte ({distanceKm} km a {fmt(fuelCostPerKm)}/km):
                        </span>
                        <span className="font-semibold text-gray-900">
                          {fmt(distanceKm * fuelCostPerKm)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Map className="w-3.5 h-3.5 text-blue-600" />
                          Peajes ({tollCount} peaje{tollCount === 1 ? '' : 's'} a {fmt(tollCostEach)} c/u):
                        </span>
                        <span className="font-semibold text-gray-900">
                          {fmt(tollCount * tollCostEach)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex items-center justify-between font-bold text-blue-700 text-sm">
                        <span>Total Flete de Transporte:</span>
                        <span>{fmt(currentShippingConfig.shippingCost)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Observaciones de entrega */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Observaciones de Entrega o Acceso al Inmueble (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Ej: Conjunto cerrado con vigilancia, apartamento en piso 3 con ascensor de carga, carretera destapada los últimos 500m..."
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
                    <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
                      <div>
                        <div className="font-semibold text-gray-800">{li.service}</div>
                        {li.details && (
                          <div className="text-xs text-gray-500 font-normal">{li.details}</div>
                        )}
                        <div className="text-xs text-gray-400">
                          {li.area} {li.unit} a {fmt(li.unitPrice)} / {li.unit}
                        </div>
                      </div>
                      <div className="font-bold text-gray-900 text-right">{fmt(li.subtotal)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen financiero */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between py-1 text-gray-600">
                  <span>Subtotal Partidas Estandarizadas</span>
                  <span className="font-semibold text-gray-900">{fmt(result.subtotalServices)}</span>
                </div>

                {/* Fila de Logística y Transporte */}
                <div className="flex justify-between py-1 items-center border-t border-gray-100 pt-2">
                  <div>
                    <span className="font-medium text-gray-700">Logística de Entrega y Flete</span>
                    <div className="text-[11px] text-gray-400">{result.shippingDetails}</div>
                  </div>
                  <span
                    className={`font-bold ${
                      result.shippingCost > 0 ? 'text-blue-700' : 'text-emerald-700'
                    }`}
                  >
                    {result.shippingCost > 0 ? `+${fmt(result.shippingCost)}` : 'Incluido ($0 COP)'}
                  </span>
                </div>

                {/* Banner de todo incluido */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Tarifa Integral Todo Incluido:</strong> Tableros melamínicos RH de alta resistencia a la humedad, herrajes de cierre suave con garantía, mano de obra calificada, transporte e instalación.
                  </div>
                </div>

                {/* Gran Total */}
                <div className="pt-4 mt-2 border-t-2 border-[#2CB99B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs uppercase tracking-wider font-bold text-gray-500">
                      Total Estimado del Proyecto
                    </div>
                    <div className="text-xs text-gray-400">
                      Tiempo estimado de fabricación: ~{result.estimatedDays} días hábiles
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
                  onClick={handleDownloadPDF}
                  className="flex-1 py-3.5 px-5 rounded-2xl bg-[#111827] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-md"
                >
                  <FileDown className="w-4 h-4 text-[#2CB99B]" />
                  Descargar PDF &amp; Enviar WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="flex-1 py-3.5 px-5 rounded-2xl bg-[#25D366] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                  Enviar WhatsApp &amp; Descargar PDF
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="py-3.5 px-4 rounded-2xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-semibold text-sm flex items-center justify-center gap-1.5 transition-all"
                  title="Cerrar y nueva cotización"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Cerrar</span>
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
