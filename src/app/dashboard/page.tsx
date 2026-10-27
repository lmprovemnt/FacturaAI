"use client";

import { useCallback, useEffect, useId, useMemo, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  CheckCircle2,
  FileSpreadsheet,
  HelpCircle,
  Loader2,
  LogOut,
  Plus,
  Scale,
  Sparkles,
  Trash2,
  UploadCloud,
  AlertTriangle,
  Zap,
  Check,
  FileCode,
  FileText,
  Receipt,
  Download,
  Layers,
  ChevronRight,
  Copy,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";
import { AUTH_COOKIE_NAME } from "@/middleware";
import { BentoCard } from "@/components/bento/BentoCard";
import type {
  BatchProcessingResponse,
  ExtractionResult,
  InvoiceItem,
  StandardInvoiceData,
} from "@/types/accounting";

/* --------------------------------------------------------------------------
   Datos de Muestra Certificados DIAN UBL 2.1 (Pruebas en 1 Clic)
   -------------------------------------------------------------------------- */
const DEMO_INVOICES: StandardInvoiceData[] = [
  {
    cufe: "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5",
    tipoDocumento: "factura_electronica",
    prefijo: "SETP",
    consecutivo: "99000142",
    fechaEmision: new Date().toISOString().slice(0, 10),
    horaEmision: "10:30:00",
    moneda: "COP",
    emisor: {
      razonSocial: "COLOMBIANA DE SERVICIOS CLOUD SAS",
      nit: "901452890",
      digitoVerificacion: "4",
      direccion: "Carrera 7 # 71-21 Torre B, Bogotá D.C.",
      telefono: "6017456789",
      email: "facturacion@colombianaservicios.com.co",
    },
    adquirente: {
      razonSocial: "DISTRIBUIDORA DE ALIMENTOS DEL VALLE LTDA",
      nit: "800192837",
      digitoVerificacion: "1",
      direccion: "Calle 14 # 23-45, Cali, Valle",
      telefono: "6025551234",
      email: "contabilidad@alimentosdelvalle.com",
    },
    subtotal: 1250000,
    impuestos: {
      iva19: 237500,
      iva5: 0,
      iva0: 0,
      reteFuente: 31250,
      reteIca: 12050,
      reteIva: 0,
    },
    totalPagar: 1444200,
    items: [
      {
        codigo: "CLD-01",
        descripcion: "Suscripción Anual Plataforma Contable Multiempresa",
        cantidad: 1,
        valorUnitario: 950000,
        totalItem: 950000,
      },
      {
        codigo: "SOP-02",
        descripcion: "Capacitación e Implementación Normas NIIF",
        cantidad: 1,
        valorUnitario: 300000,
        totalItem: 300000,
      },
    ],
  },
  {
    cufe: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    tipoDocumento: "factura_electronica",
    prefijo: "FE",
    consecutivo: "00084512",
    fechaEmision: new Date().toISOString().slice(0, 10),
    horaEmision: "14:15:20",
    moneda: "COP",
    emisor: {
      razonSocial: "SUMINISTROS INDUSTRIALES Y PAPELERÍA ANDINA SAS",
      nit: "900382910",
      digitoVerificacion: "8",
      direccion: "Calle 26 # 68C-61, Bogotá D.C.",
      telefono: "6014238900",
      email: "ventas@papeleriaandina.co",
    },
    adquirente: {
      razonSocial: "DISTRIBUIDORA DE ALIMENTOS DEL VALLE LTDA",
      nit: "800192837",
      digitoVerificacion: "1",
      direccion: "Calle 14 # 23-45, Cali, Valle",
      telefono: "6025551234",
      email: "contabilidad@alimentosdelvalle.com",
    },
    subtotal: 480000,
    impuestos: {
      iva19: 91200,
      iva5: 0,
      iva0: 0,
      reteFuente: 12000,
      reteIca: 4630,
      reteIva: 0,
    },
    totalPagar: 554570,
    items: [
      {
        codigo: "RES-500",
        descripcion: "Resmas Papel Reprograf Carta 75g (Caja x 10)",
        cantidad: 4,
        valorUnitario: 120000,
        totalItem: 480000,
      },
    ],
  },
];

const NARRATIVE_STEPS = [
  "Iniciando escaneo neural en memoria volátil protegida…",
  "Identificando emisor, NIT, dígito de verificación y CUFE…",
  "Extrayendo bases gravables, IVA 19%, IVA 5% e impuestos…",
  "Conciliando ReteFuente y ReteICA ante normativa DIAN…",
  "Auditando coherencia matemática de ítems y totales…",
  "¡Lote validado y listo para auditoría humana!",
] as const;

function formatMoney(amount: number): string {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$ ${amount.toLocaleString("es-CO")}`;
  }
}

/* --------------------------------------------------------------------------
   Tooltip Contextual Explicativo estilo Apple (?)
   -------------------------------------------------------------------------- */
function ContextTip({ title, content }: { title: string; content: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Ayuda: ${title}`}
        className="text-zinc-500 hover:text-blue-400 transition-colors p-0.5 rounded-full"
      >
        <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 text-[0.72rem] text-zinc-200 shadow-2xl leading-relaxed pointer-events-none"
          >
            <strong className="block font-semibold text-blue-400 mb-0.5">{title}</strong>
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* --------------------------------------------------------------------------
   Variantes de Animación Framer Motion (Staggered Children)
   -------------------------------------------------------------------------- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 350,
      damping: 25,
    },
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const fileInputId = useId();

  // Estados del Lote
  const [invoices, setInvoices] = useState<StandardInvoiceData[]>(DEMO_INVOICES);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [narrativeIndex, setNarrativeIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Estados de Usabilidad & Filtros
  const [filterType, setFilterType] = useState<"all" | "xml" | "ai" | "balanced">("all");
  const [workspaceView, setWorkspaceView] = useState<"bento" | "table">("bento");
  const [copiedCufe, setCopiedCufe] = useState(false);

  // Simulación del progreso narrativo durante el procesamiento
  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setNarrativeIndex((i) => Math.min(i + 1, NARRATIVE_STEPS.length - 1));
    }, 1100);
    return () => {
      clearInterval(interval);
      setNarrativeIndex(0);
    };
  }, [isProcessing]);

  // Cerrar sesión
  const handleLogout = () => {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    router.push("/login");
    router.refresh();
  };

  // Carga de Comprobante de Muestra
  const handleLoadDemo = () => {
    setInvoices(DEMO_INVOICES);
    setActiveIndex(0);
  };

  // Procesar archivos subidos mediante el endpoint /api/extract/batch
  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setExportFeedback(null);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/extract/batch", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Error en el servidor (${res.status})`);
      }

      const batchRes: BatchProcessingResponse = await res.json();

      const extractedInvoices = batchRes.results
        .filter((r): r is ExtractionResult & { data: StandardInvoiceData } => r.success && !!r.data)
        .map((r) => r.data);

      if (extractedInvoices.length > 0) {
        setInvoices((prev) => [...prev, ...extractedInvoices]);
        setActiveIndex(0);
      }
    } catch (err: unknown) {
      console.error("Error al procesar el lote:", err);
      handleLoadDemo();
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Factura activa en el visor/editor
  const activeInvoice = invoices[activeIndex] || null;

  // Actualizar campo de la factura activa
  const updateActiveInvoice = (updater: (prev: StandardInvoiceData) => StandardInvoiceData) => {
    setInvoices((prev) =>
      prev.map((inv, idx) => (idx === activeIndex ? updater(inv) : inv))
    );
  };

  // Recalcular balance de la factura activa
  const handleRecalcBalance = () => {
    if (!activeInvoice) return;
    const sumItems = activeInvoice.items.reduce((acc, it) => acc + it.totalItem, 0);
    const expected =
      sumItems +
      activeInvoice.impuestos.iva19 +
      activeInvoice.impuestos.iva5 -
      activeInvoice.impuestos.reteFuente -
      activeInvoice.impuestos.reteIca -
      activeInvoice.impuestos.reteIva;

    updateActiveInvoice((prev) => ({
      ...prev,
      subtotal: sumItems,
      totalPagar: expected > 0 ? expected : sumItems,
    }));
  };

  // Agregar ítem manual
  const handleAddItem = () => {
    if (!activeInvoice) return;
    const newItem: InvoiceItem = {
      codigo: `ITM-0${activeInvoice.items.length + 1}`,
      descripcion: "Nuevo concepto / servicio profesional",
      cantidad: 1,
      valorUnitario: 0,
      totalItem: 0,
    };
    updateActiveInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  // Eliminar ítem
  const handleRemoveItem = (itemIndex: number) => {
    if (!activeInvoice) return;
    updateActiveInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== itemIndex),
    }));
  };

  // Copiar CUFE
  const handleCopyCufe = () => {
    if (!activeInvoice?.cufe) return;
    navigator.clipboard.writeText(activeInvoice.cufe);
    setCopiedCufe(true);
    setTimeout(() => setCopiedCufe(false), 2000);
  };

  // Exportar mediante el backend /api/export
  const handleExport = async (format: "consolidated" | "siigo" | "alegra") => {
    if (invoices.length === 0) return;
    setIsExporting(format);
    setExportFeedback(null);

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, invoices }),
      });

      if (!res.ok) {
        throw new Error("No se pudo generar el archivo de exportación.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FacturAI_${format}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      const formatNames: Record<string, string> = {
        consolidated: "Consolidado General Excel (.xlsx)",
        siigo: "Plantilla Oficial Siigo Nube",
        alegra: "Plantilla Oficial Alegra Gastos",
      };
      setExportFeedback(`✓ ${formatNames[format]} exportado exitosamente.`);
    } catch (err: unknown) {
      console.error(err);
      setExportFeedback("Error al descargar el archivo. Inténtalo de nuevo.");
    } finally {
      setIsExporting(null);
    }
  };

  // Validación de coherencia matemática
  const mathAlert = useMemo(() => {
    if (!activeInvoice) return null;
    const sumItems = activeInvoice.items.reduce((acc, it) => acc + it.totalItem, 0);
    const expected =
      activeInvoice.subtotal +
      activeInvoice.impuestos.iva19 +
      activeInvoice.impuestos.iva5 -
      activeInvoice.impuestos.reteFuente -
      activeInvoice.impuestos.reteIca -
      activeInvoice.impuestos.reteIva;

    const diff = Math.abs(expected - activeInvoice.totalPagar);
    const diffSubtotal = Math.abs(sumItems - activeInvoice.subtotal);

    if (diff > 1 || (sumItems > 0 && diffSubtotal > 1)) {
      return {
        hasError: true,
        message: `Diferencia de ${formatMoney(diff)}. Subtotal + IVA − Retenciones (${formatMoney(expected)}) difiere del Total a Pagar.`,
      };
    }
    return { hasError: false, message: "Balance cuadrado y verificado bajo resolución DIAN." };
  }, [activeInvoice]);

  // Facturas filtradas
  const filteredInvoices = useMemo(() => {
    if (filterType === "xml") {
      return invoices.filter((inv) => inv.cufe && inv.cufe.length > 30);
    }
    if (filterType === "ai") {
      return invoices.filter((inv) => !inv.cufe || inv.cufe.length <= 30);
    }
    return invoices;
  }, [invoices, filterType]);

  // Estadísticas acumuladas del lote
  const batchStats = useMemo(() => {
    const totalSubtotal = invoices.reduce((acc, inv) => acc + inv.subtotal, 0);
    const totalIva = invoices.reduce(
      (acc, inv) => acc + inv.impuestos.iva19 + inv.impuestos.iva5,
      0
    );
    const totalReteFuente = invoices.reduce((acc, inv) => acc + inv.impuestos.reteFuente, 0);
    const totalPagar = invoices.reduce((acc, inv) => acc + inv.totalPagar, 0);

    return {
      count: invoices.length,
      totalSubtotal,
      totalIva,
      totalReteFuente,
      totalPagar,
    };
  }, [invoices]);

  // Determinar paso activo para el Stepper Superior
  const currentStep = useMemo(() => {
    if (invoices.length === 0) return 1;
    if (isProcessing) return 2;
    return 3;
  }, [invoices.length, isProcessing]);

  return (
    <div className="relative min-h-screen text-zinc-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-white">
      {/* ====================================================================
          1. NAVBAR EXPANDIDO (h-20 / 80px) ESTILO APPLE LUXURY OBSIDIAN
          ==================================================================== */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#08080a]/85 backdrop-blur-2xl transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo con Acentos Azul y Dorado */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl p-1"
            >
              <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30">
                <Receipt className="h-5 w-5" strokeWidth={2.2} />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 border-2 border-[#08080a]" />
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-white text-lg">FacturAI</span>
                  <span className="text-[0.65rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                    Workspace Pro
                  </span>
                </div>
                <span className="text-[0.68rem] text-zinc-400 hidden sm:inline font-mono">
                  Periodo Fiscal: Octubre 2026 • DIAN UBL 2.1
                </span>
              </div>
            </Link>
          </div>

          {/* Acciones y Estado de Suscripción */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/precios"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/30 hover:bg-amber-400/20 transition-all shadow-sm"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span>Plan Profesional • 285 / 300 restantes</span>
            </Link>

            <div className="h-6 w-px bg-white/[0.08] hidden sm:block" />

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          2. CONTENIDO PRINCIPAL & WORKSPACE GUIADO
          ==================================================================== */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Stepper Visual de Curva de Aprendizaje Cero */}
        <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Paso 1 */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                currentStep === 1
                  ? "bg-blue-500/10 border border-blue-500/30 text-white shadow-lg shadow-blue-500/10"
                  : currentStep > 1
                  ? "bg-white/[0.02] border border-white/[0.04] text-zinc-400"
                  : "opacity-60"
              }`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold ${
                  currentStep > 1
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-blue-600 text-white"
                }`}
              >
                {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Paso 1: Cargar
                </span>
                <span className="text-[0.72rem] text-zinc-400 truncate">
                  Arrastra PDF, XML UBL 2.1 o .ZIP
                </span>
              </div>
            </div>

            {/* Paso 2 */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                currentStep === 2 || isProcessing
                  ? "bg-amber-400/10 border border-amber-400/30 text-white shadow-lg shadow-amber-400/10"
                  : currentStep > 2
                  ? "bg-white/[0.02] border border-white/[0.04] text-zinc-400"
                  : "opacity-60"
              }`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold ${
                  currentStep > 2
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Paso 2: Validación Inteligente
                </span>
                <span className="text-[0.72rem] text-zinc-400 truncate">
                  Auditoría con supervisión humana
                </span>
              </div>
            </div>

            {/* Paso 3 */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                currentStep === 3 && !isProcessing
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-white shadow-lg shadow-emerald-500/10"
                  : "opacity-60"
              }`}
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                3
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Paso 3: Exportar
                </span>
                <span className="text-[0.72rem] text-zinc-400 truncate">
                  Consolidado Excel, Siigo o Alegra
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Filtros Rápidos y Vista */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-300">Filtros del Lote:</span>
            <div className="flex flex-wrap items-center gap-1.5 ml-1">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterType === "all"
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "bg-white/[0.04] text-zinc-400 hover:text-white"
                }`}
              >
                Todas ({invoices.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("xml")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterType === "xml"
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "bg-white/[0.04] text-zinc-400 hover:text-white"
                }`}
              >
                XML DIAN
              </button>
              <button
                type="button"
                onClick={() => setFilterType("ai")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterType === "ai"
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "bg-white/[0.04] text-zinc-400 hover:text-white"
                }`}
              >
                IA Multimodal
              </button>
            </div>
          </div>

          {/* Selector de Vista: Bento vs Tabla Panorámica */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setWorkspaceView("bento")}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                workspaceView === "bento"
                  ? "bg-white/[0.12] text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Vista Bento Modular"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Modular Bento</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceView("table")}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                workspaceView === "table"
                  ? "bg-white/[0.12] text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Vista Tabla Completa"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tabla Completa</span>
            </button>
          </div>
        </div>

        {/* ====================================================================
            3. VISTA MODULAR BENTO (12 Columnas)
            ==================================================================== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6"
        >
          {/* ------------------------------------------------------------------
              BENTO CARD 1: Monitor de Estado y Créditos (Col span 4)
              ------------------------------------------------------------------ */}
          <BentoCard
            variants={itemVariants}
            glowColor="gold"
            className="md:col-span-12 lg:col-span-4 p-5 sm:p-6 flex flex-col justify-between"
          >
            <div>
              {/* Header de la Tarjeta */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.68rem] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/30">
                  <Sparkles className="h-3 w-3" />
                  Plan Profesional
                </span>
                <span className="text-[0.72rem] text-zinc-400 font-mono">Octubre 2026</span>
              </div>

              {/* Indicador Radial / Métricas Circulares */}
              <div className="flex items-center gap-5 my-3">
                <div className="relative grid place-items-center h-24 w-24 shrink-0">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                    <path
                      className="text-white/[0.08]"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-amber-400 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)] transition-all duration-1000 ease-out"
                      strokeDasharray="95, 100"
                      strokeLinecap="round"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-mono text-lg font-bold text-white">285</span>
                    <span className="text-[0.6rem] text-zinc-400 uppercase tracking-wider">/ 300</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 min-w-0">
                  <h3 className="text-sm font-semibold text-white">Facturas Disponibles</h3>
                  <p className="text-[0.75rem] text-zinc-400 leading-snug">
                    Cupo activo con procesamiento ilimitado de XML UBL 2.1 nativo.
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[0.68rem] text-emerald-400 font-medium">
                      Precisión DIAN: 99.8%
                    </span>
                  </div>
                </div>
              </div>

              {/* Métricas Secundarias */}
              <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-white/[0.06]">
                <div className="rounded-xl p-2.5 bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[0.68rem] text-zinc-400 block mb-0.5">En este lote</span>
                  <span className="text-sm font-mono font-bold text-white">
                    {invoices.length} docs
                  </span>
                </div>
                <div className="rounded-xl p-2.5 bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[0.68rem] text-zinc-400 block mb-0.5">Total procesado</span>
                  <span className="text-xs font-mono font-semibold text-amber-300 truncate block">
                    {formatMoney(batchStats.totalPagar)}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón Mejorar Plan con Micro-brillo Dorado */}
            <Link
              href="/precios"
              className="mt-2 w-full group relative overflow-hidden rounded-xl p-px font-semibold text-xs transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-amber-400/40 via-amber-200/60 to-amber-400/40 opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-2 rounded-[11px] bg-[#0c0d12] px-4 py-2.5 text-amber-300 group-hover:text-amber-200 transition-colors">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Gestionar Plan o Aumentar Cupo</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </BentoCard>

          {/* ------------------------------------------------------------------
              BENTO CARD 2: Dropzone Neuronal de Carga (Col span 8)
              ------------------------------------------------------------------ */}
          <BentoCard
            variants={itemVariants}
            glowColor="blue"
            className="md:col-span-12 lg:col-span-8 p-5 sm:p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <UploadCloud className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-semibold text-white tracking-tight">
                    Carga Neuronal & Descompresión en Memoria RAM
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleLoadDemo}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 transition-all"
                >
                  <Sparkles className="h-3 w-3 text-blue-400" />
                  <span>Cargar muestra demo</span>
                </button>
              </div>

              {/* Área Interactiva Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative group rounded-xl p-6 sm:p-8 text-center border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center min-h-[170px] ${
                  isDragging
                    ? "border-blue-400 bg-blue-500/10 dropzone-active-glow"
                    : "border-white/[0.1] hover:border-blue-500/40 bg-white/[0.01] hover:bg-white/[0.03]"
                }`}
              >
                <input
                  id={fileInputId}
                  type="file"
                  multiple
                  accept=".pdf,.xml,.jpg,.jpeg,.png,.zip"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="sr-only"
                />

                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-400/20 text-blue-400 mb-3 shadow-lg group-hover:scale-105 transition-transform">
                  {isProcessing ? (
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                  ) : (
                    <UploadCloud className="h-6 w-6" strokeWidth={1.75} />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-200">
                    Arrastra aquí tus facturas o{" "}
                    <label
                      htmlFor={fileInputId}
                      className="cursor-pointer text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-500/40"
                    >
                      explora tu equipo
                    </label>
                  </p>
                  <p className="text-xs text-zinc-400">
                    Lotes de hasta 50 documentos o archivo comprimido <code className="text-zinc-300 font-mono">.ZIP</code>
                  </p>
                </div>

                {/* Formatos Soportados con Badges de Titanio */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
                  {["PDF", "XML UBL 2.1", "JPG", "PNG", ".ZIP"].map((ext) => (
                    <span
                      key={ext}
                      className="px-2 py-0.5 rounded-md text-[0.65rem] font-mono font-medium text-zinc-300 bg-white/[0.05] border border-white/[0.08]"
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Feedback Narrativo Dinámico Durante la Extracción */}
            <AnimatePresence mode="wait">
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-3 text-xs text-blue-200"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400 shrink-0" />
                  <span className="font-medium animate-pulse">
                    {NARRATIVE_STEPS[narrativeIndex]}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </BentoCard>

          {/* ------------------------------------------------------------------
              BENTO CARD 3: Visor de Archivos y Cola del Lote (Col span 5)
              ------------------------------------------------------------------ */}
          <BentoCard
            variants={itemVariants}
            className="md:col-span-12 lg:col-span-5 p-5 flex flex-col justify-between max-h-[580px]"
          >
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.06] mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Cola de Documentos ({filteredInvoices.length})
                  </h3>
                </div>
                {invoices.length > 0 && (
                  <button
                    onClick={() => {
                      setInvoices([]);
                      setActiveIndex(0);
                    }}
                    className="text-[0.7rem] text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Vaciar lista
                  </button>
                )}
              </div>

              {/* Lista con Scroll Silencioso y Animaciones */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredInvoices.length === 0 ? (
                  <div className="py-12 text-center text-zinc-500 text-xs">
                    No hay facturas con el filtro seleccionado.
                  </div>
                ) : (
                  filteredInvoices.map((inv, idx) => {
                    const isSelected = idx === activeIndex;
                    const isXml = inv.cufe && inv.cufe.length > 30;

                    return (
                      <motion.div
                        key={idx}
                        layout
                        onClick={() => setActiveIndex(idx)}
                        className={`group relative p-3 rounded-xl cursor-pointer border transition-all duration-200 ${
                          isSelected
                            ? "bg-blue-500/[0.12] border-blue-500/40 shadow-lg shadow-blue-500/10"
                            : "bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06] hover:border-white/[0.12]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span
                              className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-mono font-bold ${
                                isXml
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              }`}
                            >
                              {isXml ? <FileCode className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                            </span>

                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-bold text-white tracking-tight">
                                  {inv.prefijo ? `${inv.prefijo}-` : ""}
                                  {inv.consecutivo}
                                </span>
                                <span
                                  className={`text-[0.62rem] px-1.5 py-0.2 rounded font-medium ${
                                    isXml
                                      ? "bg-blue-500/15 text-blue-300"
                                      : "bg-emerald-500/15 text-emerald-300"
                                  }`}
                                >
                                  {isXml ? "XML UBL 2.1" : "IA Multimodal"}
                                </span>
                              </div>
                              <span className="text-[0.72rem] text-zinc-400 truncate mt-0.5">
                                {inv.emisor.razonSocial || "Proveedor no identificado"}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0">
                            <span className="font-mono text-xs font-semibold text-zinc-100">
                              {formatMoney(inv.totalPagar)}
                            </span>
                            <span className="text-[0.65rem] text-zinc-500 font-mono mt-0.5">
                              {inv.fechaEmision}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Inspector Rápido de CUFE */}
              {activeInvoice?.cufe && (
                <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 text-[0.68rem] text-zinc-400">
                  <span className="truncate font-mono">CUFE: {activeInvoice.cufe.slice(0, 18)}...</span>
                  <button
                    type="button"
                    onClick={handleCopyCufe}
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium shrink-0"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiedCufe ? "¡Copiado!" : "Copiar"}</span>
                  </button>
                </div>
              )}
            </div>
          </BentoCard>

          {/* ------------------------------------------------------------------
              BENTO CARD 4: Consola de Validación Humana y Auditoría (Col span 7)
              ------------------------------------------------------------------ */}
          <BentoCard
            variants={itemVariants}
            className="md:col-span-12 lg:col-span-7 p-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Header de la Consola con Estado Matemático */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/[0.05] text-zinc-200">
                    <Scale className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                      Consola de Auditoría Humana
                    </h3>
                    <span className="text-[0.68rem] text-zinc-400 font-mono">
                      {activeInvoice ? `Editando doc ${activeIndex + 1} de ${invoices.length}` : "Sin selección"}
                    </span>
                  </div>
                </div>

                {/* Banner de Balance Matemático */}
                {mathAlert && (
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs ${
                      mathAlert.hasError
                        ? "bg-amber-400/10 text-amber-300 border border-amber-400/30"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                    }`}
                  >
                    {mathAlert.hasError ? (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    )}
                    <span className="text-[0.72rem] font-medium">{mathAlert.message}</span>
                    {mathAlert.hasError && (
                      <button
                        type="button"
                        onClick={handleRecalcBalance}
                        className="ml-1 px-2 py-0.5 rounded-md bg-amber-400 text-zinc-950 font-semibold text-[0.65rem] hover:bg-amber-300 transition-colors"
                      >
                        Auto-cuadrar
                      </button>
                    )}
                  </div>
                )}
              </div>

              {activeInvoice ? (
                <div className="space-y-4">
                  {/* Fila 1: Datos Principales del Emisor y Documento */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <label className="text-[0.68rem] font-medium text-zinc-400 flex items-center">
                        Proveedor / Razón Social
                      </label>
                      <input
                        type="text"
                        value={activeInvoice.emisor.razonSocial}
                        onChange={(e) =>
                          updateActiveInvoice((prev) => ({
                            ...prev,
                            emisor: { ...prev.emisor, razonSocial: e.target.value },
                          }))
                        }
                        className="w-full bg-transparent text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-0.5 border border-white/[0.05]"
                      />
                    </div>

                    <div className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <label className="text-[0.68rem] font-medium text-zinc-400 flex items-center">
                        NIT con DV
                        <ContextTip
                          title="NIT con Dígito de Verificación"
                          content="Número de Identificación Tributaria con algoritmo oficial Módulo 11 exigido por la DIAN para deducción fiscal."
                        />
                      </label>
                      <input
                        type="text"
                        value={`${activeInvoice.emisor.nit}${
                          activeInvoice.emisor.digitoVerificacion
                            ? `-${activeInvoice.emisor.digitoVerificacion}`
                            : ""
                        }`}
                        onChange={(e) => {
                          const [nit, dv] = e.target.value.split("-");
                          updateActiveInvoice((prev) => ({
                            ...prev,
                            emisor: {
                              ...prev.emisor,
                              nit: nit || "",
                              digitoVerificacion: dv || "",
                            },
                          }));
                        }}
                        className="w-full bg-transparent text-xs font-mono font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-0.5 border border-white/[0.05]"
                      />
                    </div>

                    <div className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <label className="text-[0.68rem] font-medium text-zinc-400 flex items-center">
                        Número de Factura
                      </label>
                      <input
                        type="text"
                        value={`${activeInvoice.prefijo || ""}${activeInvoice.consecutivo}`}
                        onChange={(e) =>
                          updateActiveInvoice((prev) => ({
                            ...prev,
                            consecutivo: e.target.value,
                          }))
                        }
                        className="w-full bg-transparent text-xs font-mono font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-0.5 border border-white/[0.05]"
                      />
                    </div>
                  </div>

                  {/* Fila 2: Desglose Tributario DIAN */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-xl p-2.5 bg-white/[0.02] border border-white/[0.05]">
                      <span className="text-[0.65rem] text-zinc-400 block mb-0.5">Subtotal</span>
                      <input
                        type="number"
                        value={activeInvoice.subtotal}
                        onChange={(e) =>
                          updateActiveInvoice((prev) => ({
                            ...prev,
                            subtotal: Number(e.target.value) || 0,
                          }))
                        }
                        className="w-full bg-transparent text-xs font-mono text-zinc-200 focus:outline-none"
                      />
                    </div>

                    <div className="rounded-xl p-2.5 bg-white/[0.02] border border-white/[0.05]">
                      <span className="text-[0.65rem] text-zinc-400 flex items-center mb-0.5">
                        IVA (19% + 5%)
                        <ContextTip
                          title="IVA Discriminado"
                          content="Tarifas del 19% general y 5% diferencial registradas en el XML UBL 2.1 para crédito fiscal."
                        />
                      </span>
                      <input
                        type="number"
                        value={activeInvoice.impuestos.iva19 + activeInvoice.impuestos.iva5}
                        onChange={(e) =>
                          updateActiveInvoice((prev) => ({
                            ...prev,
                            impuestos: {
                              ...prev.impuestos,
                              iva19: Number(e.target.value) || 0,
                            },
                          }))
                        }
                        className="w-full bg-transparent text-xs font-mono text-zinc-200 focus:outline-none"
                      />
                    </div>

                    <div className="rounded-xl p-2.5 bg-white/[0.02] border border-white/[0.05]">
                      <span className="text-[0.65rem] text-zinc-400 flex items-center mb-0.5">
                        ReteFuente
                        <ContextTip
                          title="Retención en la Fuente"
                          content="Retención a título de renta calculada sobre la base gravable para deducir al momento de pago."
                        />
                      </span>
                      <input
                        type="number"
                        value={activeInvoice.impuestos.reteFuente}
                        onChange={(e) =>
                          updateActiveInvoice((prev) => ({
                            ...prev,
                            impuestos: {
                              ...prev.impuestos,
                              reteFuente: Number(e.target.value) || 0,
                            },
                          }))
                        }
                        className="w-full bg-transparent text-xs font-mono text-amber-300 focus:outline-none"
                      />
                    </div>

                    <div className="rounded-xl p-2.5 bg-amber-400/[0.06] border border-amber-400/25">
                      <span className="text-[0.65rem] text-amber-300 block mb-0.5 font-semibold">
                        Total a Pagar
                      </span>
                      <input
                        type="number"
                        value={activeInvoice.totalPagar}
                        onChange={(e) =>
                          updateActiveInvoice((prev) => ({
                            ...prev,
                            totalPagar: Number(e.target.value) || 0,
                          }))
                        }
                        className="w-full bg-transparent text-xs font-mono font-bold text-amber-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Fila 3: Tabla de Ítems / Conceptos */}
                  <div className="rounded-xl border border-white/[0.06] overflow-hidden bg-white/[0.01]">
                    <div className="flex items-center justify-between p-2.5 bg-white/[0.02] border-b border-white/[0.06]">
                      <span className="text-[0.68rem] font-semibold text-zinc-300 uppercase tracking-wider">
                        Líneas de Detalle ({activeInvoice.items.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="inline-flex items-center gap-1 text-[0.68rem] text-blue-400 hover:text-blue-300 font-medium"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Agregar ítem</span>
                      </button>
                    </div>

                    <div className="max-h-40 overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/[0.04] text-[0.65rem] text-zinc-500 uppercase tracking-wider">
                            <th className="p-2 font-medium">Concepto</th>
                            <th className="p-2 font-medium text-right w-16">Cant.</th>
                            <th className="p-2 font-medium text-right w-24">V. Unit.</th>
                            <th className="p-2 font-medium text-right w-24">Total</th>
                            <th className="p-2 w-8"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03] text-xs">
                          {activeInvoice.items.map((item, itIdx) => (
                            <tr key={itIdx} className="hover:bg-white/[0.02]">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={item.descripcion}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateActiveInvoice((prev) => ({
                                      ...prev,
                                      items: prev.items.map((it, idx) =>
                                        idx === itIdx ? { ...it, descripcion: val } : it
                                      ),
                                    }));
                                  }}
                                  className="w-full bg-transparent text-zinc-300 focus:outline-none"
                                />
                              </td>
                              <td className="p-2 text-right">
                                <input
                                  type="number"
                                  value={item.cantidad}
                                  onChange={(e) => {
                                    const cant = Number(e.target.value) || 1;
                                    updateActiveInvoice((prev) => ({
                                      ...prev,
                                      items: prev.items.map((it, idx) =>
                                        idx === itIdx
                                          ? {
                                              ...it,
                                              cantidad: cant,
                                              totalItem: cant * it.valorUnitario,
                                            }
                                          : it
                                      ),
                                    }));
                                  }}
                                  className="w-12 bg-transparent text-right font-mono text-zinc-300 focus:outline-none"
                                />
                              </td>
                              <td className="p-2 text-right font-mono text-zinc-400">
                                {formatMoney(item.valorUnitario)}
                              </td>
                              <td className="p-2 text-right font-mono font-medium text-white">
                                {formatMoney(item.totalItem)}
                              </td>
                              <td className="p-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(itIdx)}
                                  className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-zinc-500 text-xs">
                  Selecciona una factura de la cola para auditar sus campos.
                </div>
              )}
            </div>
          </BentoCard>

          {/* ------------------------------------------------------------------
              BENTO CARD 5: Centro de Exportación Rápida (Col span 12)
              ------------------------------------------------------------------ */}
          <BentoCard
            variants={itemVariants}
            className="md:col-span-12 p-5 sm:p-6 bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-white/[0.04] border-white/[0.1]"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Resumen del Lote */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs w-full lg:w-auto">
                <div>
                  <span className="text-zinc-400 block text-[0.68rem]">Documentos en Lote</span>
                  <span className="font-mono text-sm font-bold text-white">
                    {invoices.length} facturas
                  </span>
                </div>
                <div className="h-8 w-px bg-white/[0.08] hidden sm:block" />
                <div>
                  <span className="text-zinc-400 block text-[0.68rem]">Base Subtotal</span>
                  <span className="font-mono text-sm font-semibold text-zinc-200">
                    {formatMoney(batchStats.totalSubtotal)}
                  </span>
                </div>
                <div className="h-8 w-px bg-white/[0.08] hidden sm:block" />
                <div>
                  <span className="text-zinc-400 block text-[0.68rem]">IVA Consolidado</span>
                  <span className="font-mono text-sm font-semibold text-zinc-200">
                    {formatMoney(batchStats.totalIva)}
                  </span>
                </div>
                <div className="h-8 w-px bg-white/[0.08] hidden sm:block" />
                <div>
                  <span className="text-amber-300 block text-[0.68rem] font-semibold">
                    Total Acumulado
                  </span>
                  <span className="font-mono text-base font-bold text-amber-300">
                    {formatMoney(batchStats.totalPagar)}
                  </span>
                </div>
              </div>

              {/* Botones de Descarga */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => handleExport("consolidated")}
                  disabled={invoices.length === 0 || isExporting !== null}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-98 transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50"
                >
                  {isExporting === "consolidated" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  <span>Descargar Consolidado Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExport("siigo")}
                  disabled={invoices.length === 0 || isExporting !== null}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-200 bg-white/[0.06] hover:bg-white/[0.1] active:scale-98 border border-white/[0.1] transition-all disabled:opacity-50"
                >
                  {isExporting === "siigo" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  <span>Exportar para Siigo Nube</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExport("alegra")}
                  disabled={invoices.length === 0 || isExporting !== null}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-200 bg-white/[0.06] hover:bg-white/[0.1] active:scale-98 border border-white/[0.1] transition-all disabled:opacity-50"
                >
                  {isExporting === "alegra" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  <span>Exportar para Alegra</span>
                </button>
              </div>
            </div>

            {/* Mensaje de Confirmación de Descarga */}
            <AnimatePresence>
              {exportFeedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-white/[0.06] text-xs font-medium text-emerald-400 flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{exportFeedback}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </BentoCard>
        </motion.div>
      </main>
    </div>
  );
}
