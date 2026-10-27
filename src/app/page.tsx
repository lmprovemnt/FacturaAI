"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileSpreadsheet,
  Sparkles,
  Zap,
  AlertTriangle,
  FileCode,
  FileText,
  Scale,
  Check,
  ChevronRight,
  Cpu,
  Lock,
} from "lucide-react";
import Header from "@/components/Header";
import { BentoCard } from "@/components/bento/BentoCard";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"xml" | "pdf">("xml");

  return (
    <div className="min-h-screen flex flex-col text-zinc-100 font-sans selection:bg-blue-600/30 selection:text-white">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-24 sm:space-y-32">
        {/* ====================================================================
            1. HERO SECTION: Impacto Visual & Aceleración Contable
            ==================================================================== */}
        <section className="text-center max-w-4xl mx-auto space-y-6 pt-4 sm:pt-8">
          {/* Badge Dorado Superior */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold text-amber-300 shadow-lg shadow-amber-400/5 backdrop-blur-xl"
          >
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Motor Certificado DIAN UBL 2.1 • Cero Digitación Manual</span>
          </motion.div>

          {/* Gran Título con Gradiente Metálico */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]"
          >
            De 15 minutos a 0.4s por factura:{" "}
            <span className="metallic-text">La nueva era de la contabilidad</span>
          </motion.h1>

          {/* Subtítulo Claro y Explicativo */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto"
          >
            Digitalización contable de nivel institucional. Extrae NIT, CUFE, IVA y retenciones desde archivos PDF, fotos o XML nativo. Conciliación y exportación directa a <strong className="text-zinc-200">Siigo, Alegra y Excel</strong> con precisión quirúrgica.
          </motion.p>

          {/* Llamadas a la Acción Principales */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
          >
            <Link
              href="/login?mode=register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-xl shadow-blue-600/30 border border-blue-400/30"
            >
              <span>Comenzar Prueba Gratuita (15 Facturas)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-medium text-zinc-200 bg-white/[0.05] hover:bg-white/[0.09] active:scale-95 border border-white/[0.09] transition-all backdrop-blur-xl"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Explorar Workspace Demo</span>
            </Link>

            <Link
              href="/precios"
              className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-2xl text-sm font-medium text-amber-300 hover:text-amber-200 transition-colors"
            >
              <span>Ver Planes en COP</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Barra de KPIs en Tiempo Real */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-8 max-w-3xl mx-auto"
          >
            <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl">
              <span className="block font-mono text-2xl font-bold text-white">0.4 seg</span>
              <span className="text-[0.72rem] text-zinc-400 uppercase tracking-wider">Por comprobante</span>
            </div>
            <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl">
              <span className="block font-mono text-2xl font-bold text-emerald-400">99.8%</span>
              <span className="text-[0.72rem] text-zinc-400 uppercase tracking-wider">Acierto Módulo 11</span>
            </div>
            <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl">
              <span className="block font-mono text-2xl font-bold text-amber-300">10x</span>
              <span className="text-[0.72rem] text-zinc-400 uppercase tracking-wider">Ahorro en causación</span>
            </div>
            <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl">
              <span className="block font-mono text-2xl font-bold text-blue-400">100% RAM</span>
              <span className="text-[0.72rem] text-zinc-400 uppercase tracking-wider">Ley 1581 Habeas Data</span>
            </div>
          </motion.div>
        </section>

        {/* ====================================================================
            2. EL PROBLEMA VS LA SOLUCIÓN: Caos Tradicional vs FacturAI
            ==================================================================== */}
        <section id="problema" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
              El Dilema Contable en Colombia
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              ¿Por qué los despachos contables pierden hasta 40 horas al mes?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* Tarjeta El Problema */}
            <div className="rounded-3xl p-6 sm:p-8 bg-red-950/[0.12] border border-red-500/20 backdrop-blur-xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>El Método Tradicional (Manual)</span>
                </div>
                <h3 className="text-xl font-bold text-white">Digitación manual propensa a errores costosos</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  A fin de mes, los contadores reciben cientos de correos con facturas electrónicas, imágenes borrosas y archivos comprimidos que deben transcribir campo por campo.
                </p>

                <ul className="space-y-3 pt-2 text-xs text-zinc-300">
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-400 font-bold">✕</span>
                    <span><strong>15 minutos promedio</strong> por cada factura para transcribir ítems, NIT y retenciones.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>Descuadres en cálculo de <strong>ReteFuente (2.5%, 3.5%, 4%)</strong> y bases exentas.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>Riesgo de sanciones ante la DIAN por NITs sin dígito de verificación correcto.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>Fatiga del equipo contable y horas extra no facturables en fechas límite.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl p-3 bg-red-500/10 border border-red-500/25 text-[0.72rem] text-red-300 font-mono">
                Pérdida estimada: $1.800.000 COP al mes en tiempo operativo por auxiliar.
              </div>
            </div>

            {/* Tarjeta La Solución FacturAI */}
            <div className="rounded-3xl p-6 sm:p-8 bg-blue-950/[0.15] border border-blue-500/30 shadow-2xl shadow-blue-500/10 backdrop-blur-2xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  <span>La Solución Inteligente: FacturAI</span>
                </div>
                <h3 className="text-xl font-bold text-white">Automatización de extremo a extremo en 0.4s</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  El motor híbrido procesa el XML UBL 2.1 nativo instantáneamente o utiliza IA multimodal para extraer información de facturas impresas, tickets y PDFs escaneados.
                </p>

                <ul className="space-y-3 pt-2 text-xs text-zinc-200">
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>0.4 segundos</strong> de tiempo de procesamiento por comprobante en lotes de hasta 50 archivos.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Auditoría matemática automática:</strong> Si Subtotal + IVA ≠ Total, el sistema te avisa y permite auto-cuadrar.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Exportador oficial para Siigo Nube, Alegra y Excel:</strong> Listos para causación contable.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Cumplimiento Ley 1581:</strong> Los documentos se examinan en memoria volátil sin persistencia en disco.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl p-3 bg-emerald-500/10 border border-emerald-500/25 text-[0.72rem] text-emerald-300 font-mono flex items-center justify-between">
                <span>Eficiencia: 95% de reducción en tiempo de digitación.</span>
                <span className="font-bold text-white">ROI Inmediato</span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            3. SIMULADOR INTERACTIVO EN VIVO: Extracción Neural en Tiempo Real
            ==================================================================== */}
        <section id="solucion" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Experiencia en Tiempo Real
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Observa cómo el motor analiza una factura colombiana
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Alterna entre la lectura XML UBL 2.1 nativa y la extracción por IA Multimodal
            </p>
          </div>

          {/* Selector de Modo del Simulador */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setActiveTab("xml")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "xml"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>XML UBL 2.1 (Instantáneo)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pdf")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "pdf"
                    ? "bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>PDF / Foto Escaneada (IA Gemini)</span>
              </button>
            </div>
          </div>

          {/* Terminal de Extracción Simulada */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0c0e14] border border-white/[0.1] shadow-2xl relative overflow-hidden">
            {/* Línea de escaneo láser animada */}
            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse opacity-75" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Documento Fuente Simulado */}
              <div className="lg:col-span-5 rounded-2xl p-4 bg-white/[0.02] border border-white/[0.06] space-y-3 font-mono text-[0.72rem] text-zinc-400">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="text-zinc-300 font-semibold">
                    {activeTab === "xml" ? "AttachedDocument.xml (UBL 2.1)" : "Factura_Proveedor_001.pdf"}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[0.65rem] bg-emerald-500/20 text-emerald-400 font-bold">
                    CUFE Válido
                  </span>
                </div>

                <div className="space-y-1.5 text-zinc-400 text-xs">
                  <p><span className="text-zinc-500">Emisor:</span> SERVICIOS DE TECNOLOGÍA ANDINA SAS</p>
                  <p><span className="text-zinc-500">NIT:</span> 901.345.678-2 (DV: 2)</p>
                  <p><span className="text-zinc-500">Consecutivo:</span> FE-88902</p>
                  <p><span className="text-zinc-500">Fecha:</span> 2026-10-22 14:30:00</p>
                  <p className="truncate text-zinc-500">CUFE: 6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f</p>
                </div>
              </div>

              {/* Conector Central de Proceso */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center gap-2 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-xl shadow-blue-500/25 border border-blue-400/30 animate-bounce">
                  <Cpu className="h-6 w-6" />
                </div>
                <span className="text-[0.68rem] font-mono text-zinc-400">
                  {activeTab === "xml" ? "Parser Nativo DIAN (0.05s)" : "Visión Gemini 2.5 Flash (0.4s)"}
                </span>
              </div>

              {/* Estructura Contable Extraída */}
              <div className="lg:col-span-5 rounded-2xl p-4 bg-blue-950/[0.2] border border-blue-500/30 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-blue-500/20">
                  <span className="text-blue-300 font-semibold">Conciliación Contable Extraída</span>
                  <span className="text-[0.65rem] text-amber-300 font-bold">100% Cuadrado</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-zinc-300">
                    <span>Base Subtotal Gravable:</span>
                    <span className="text-white font-bold">$ 2.450.000 COP</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>IVA Generado (19%):</span>
                    <span className="text-white font-bold">$ 465.500 COP</span>
                  </div>
                  <div className="flex justify-between text-amber-300">
                    <span>ReteFuente practicada (2.5%):</span>
                    <span className="font-bold">- $ 61.250 COP</span>
                  </div>
                  <div className="flex justify-between text-amber-300">
                    <span>ReteICA aplicado (9.66‰):</span>
                    <span className="font-bold">- $ 23.667 COP</span>
                  </div>
                  <div className="pt-2 border-t border-white/[0.08] flex justify-between text-sm font-bold text-emerald-400">
                    <span>Neto a Causar / Pagar:</span>
                    <span>$ 2.830.583 COP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            4. BENTO GRID DE CAPACIDADES ARQUITECTÓNICAS
            ==================================================================== */}
        <section id="capacidades" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Tecnología de Vanguardia
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Diseñado para la exigencia del régimen tributario colombiano
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {/* Bento 1: Motor XML UBL 2.1 Nativo */}
            <BentoCard glowColor="blue" className="md:col-span-12 lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <FileCode className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Motor XML UBL 2.1 Nativo de Ultra-Velocidad
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Descomprime y lee archivos <code className="text-zinc-200 font-mono">.XML</code> y comprobantes electrónicos oficiales de la DIAN en menos de 0.05 segundos, sin consumir créditos de inteligencia artificial.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-blue-300 font-mono">
                <span>AttachedDocuments • CUFE SHA-384</span>
                <span>0.05 seg</span>
              </div>
            </BentoCard>

            {/* Bento 2: Visión Multimodal con Gemini 2.5 Flash */}
            <BentoCard glowColor="gold" className="md:col-span-12 lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Visión Multimodal Gemini 2.5 Flash
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  OCR neuronal con Structured Outputs JSON Schema para facturas impresas, recibos de caja menor y documentos arrugados o de baja calidad.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs text-amber-300 font-mono">
                Extracción estructurada infalible
              </div>
            </BentoCard>

            {/* Bento 3: Conexión con Siigo, Alegra y Excel */}
            <BentoCard glowColor="blue" className="md:col-span-12 lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Exportador Multi-Software
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Genera en 1 clic los archivos para importar causaciones masivas en Siigo Nube, Alegra y un libro Excel de 3 hojas para auditoría.
                </p>
              </div>
            </BentoCard>

            {/* Bento 4: Auditoría de Coherencia Matemática */}
            <BentoCard className="md:col-span-12 lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] text-zinc-200">
                  <Scale className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Balance Débito / Crédito
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Si la suma de Subtotal + IVA difiere del Total a Pagar, el sistema activa una alerta visual y permite auto-conciliar en un solo clic.
                </p>
              </div>
            </BentoCard>

            {/* Bento 5: Privacidad Total Ley 1581 */}
            <BentoCard className="md:col-span-12 lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Memoria Volátil Protegida
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Cumplimiento estricto de la Ley 1581 de 2012 (Habeas Data). Tus facturas se analizan en memoria RAM y nunca se almacenan en disco.
                </p>
              </div>
            </BentoCard>
          </div>
        </section>

        {/* ====================================================================
            5. CÓMO FUNCIONA EN 3 PASOS GUIADOS
            ==================================================================== */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Curva de Aprendizaje Cero
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Comienza a operar en menos de 60 segundos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl space-y-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white font-mono font-bold text-sm">
                01
              </span>
              <h3 className="text-base font-bold text-white">Carga tu lote o archivo .ZIP</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Arrastra hasta 50 comprobantes o el archivo comprimido que descargas del portal de la DIAN o de tu correo de facturación.
              </p>
            </div>

            <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl space-y-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-zinc-950 font-mono font-bold text-sm">
                02
              </span>
              <h3 className="text-base font-bold text-white">Validación con supervisión humana</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Revisa los datos detectados en una tabla tipo terminal financiera. Si necesitas corregir un dato, haz clic en la celda correspondiente.
              </p>
            </div>

            <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl space-y-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-white font-mono font-bold text-sm">
                03
              </span>
              <h3 className="text-base font-bold text-white">Descarga y causa en tu software</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Elige si deseas tu consolidado general en Excel (.xlsx) o los archivos con la plantilla exacta para Siigo Nube o Alegra Gastos.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================================
            6. LLAMADO FINAL A LA ACCIÓN (CTA BANNER)
            ==================================================================== */}
        <section className="rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-blue-900/30 via-white/[0.02] to-amber-900/20 border border-blue-500/30 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full text-[0.68rem] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/30 inline-block">
              15 Facturas Gratuitas • Sin Tarjeta de Crédito
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Comprueba la precisión con tus propias facturas
            </h2>
            <p className="text-xs sm:text-base text-zinc-300 leading-relaxed">
              Únete a cientos de contadores y despachos en Colombia que han eliminado la digitación manual de su día a día.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/login?mode=register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-xl shadow-blue-600/30"
            >
              <span>Crear Cuenta Gratuita</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/precios"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-medium text-zinc-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] transition-all"
            >
              <span>Ver Planes y Precios COP</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer Minimalista */}
      <footer className="w-full border-t border-white/[0.08] bg-[#060608] py-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">FacturAI Colombia</span>
            <span>• Cumplimiento DIAN UBL 2.1 y Ley 1581 de 2012</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/precios" className="hover:text-zinc-300 transition-colors">Planes</Link>
            <Link href="/login" className="hover:text-zinc-300 transition-colors">Ingresar</Link>
            <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Workspace</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
