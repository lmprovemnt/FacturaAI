"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Sparkles,
  Shield,
  ArrowRight,
  Receipt,
  FileCheck2,
  ChevronDown,
} from "lucide-react";

export type BillingCycle = "mensual" | "semestral" | "anual";

interface PlanConfig {
  id: string;
  name: string;
  badge?: string;
  highlighted?: boolean;
  description: string;
  price: Record<BillingCycle, { display: string; period: string; note?: string }>;
  features: string[];
  ctaText: string;
  ctaHref: string;
}

const PLANS: PlanConfig[] = [
  {
    id: "explorador",
    name: "Plan Explorador",
    badge: "Prueba Gratuita",
    description: "Para contadores y personas naturales que desean comprobar la precisión con sus propias facturas.",
    price: {
      mensual: { display: "$0", period: "COP para siempre", note: "Sin tarjeta de crédito requerida" },
      semestral: { display: "$0", period: "COP para siempre", note: "Sin tarjeta de crédito requerida" },
      anual: { display: "$0", period: "COP para siempre", note: "Sin tarjeta de crédito requerida" },
    },
    features: [
      "15 documentos contables de prueba",
      "Soporte de facturas en PDF e imágenes",
      "Lectura instantánea de XML UBL 2.1",
      "Exportación a Excel estructurado",
      "Extracción de NIT, CUFE y totales",
      "Validación de coherencia matemática",
    ],
    ctaText: "Crear Cuenta Gratuita",
    ctaHref: "/login?mode=register&plan=explorador",
  },
  {
    id: "profesional",
    name: "Plan Profesional",
    badge: "Recomendado para Contadores",
    highlighted: true,
    description: "Diseñado para contadores independientes con múltiples clientes y volumen mensual recurrente.",
    price: {
      mensual: { display: "$39.000", period: "COP / mes", note: "Facturación mensual recurrente" },
      semestral: { display: "$199.000", period: "COP / 6 meses", note: "Ahorras $35.000 COP (~15%)" },
      anual: { display: "$390.000", period: "COP / año", note: "2 Meses Gratis incluidos" },
    },
    features: [
      "300 documentos contables al mes",
      "Procesamiento masivo por lotes (ZIP y multi-archivo)",
      "Extracción nativa XML UBL 2.1 ultra-rápida (0.05s)",
      "Plantilla oficial de causación para Siigo Nube",
      "Plantilla oficial de causación para Alegra Gastos",
      "Validación de Dígito de Verificación Módulo 11",
      "Auditoría de balance débito / crédito automática",
      "Soporte contable prioritario vía WhatsApp y correo",
    ],
    ctaText: "Comenzar con Profesional",
    ctaHref: "/login?mode=register&plan=profesional",
  },
  {
    id: "estudio",
    name: "Estudio Contable",
    badge: "Pymes & Firmas",
    description: "Para firmas contables y empresas que procesan altos volúmenes de comprobantes con auxiliares.",
    price: {
      mensual: { display: "$79.000", period: "COP / mes", note: "Facturación mensual recurrente" },
      semestral: { display: "$400.000", period: "COP / 6 meses", note: "Ahorras $74.000 COP (~16%)" },
      anual: { display: "$790.000", period: "COP / año", note: "2 Meses Gratis incluidos" },
    },
    features: [
      "1.200 documentos contables al mes",
      "Hasta 3 cuentas para auxiliares contables",
      "Exportador multi-software (Siigo, Alegra, Excel 3 hojas)",
      "Asignación de cuentas de causación PUC personalizada",
      "Procesamiento de lotes prioritario con concurrencia alta",
      "Auditoría profunda de CUFE y AttachedDocuments",
      "Soporte 24/7 y sesión de onboarding guiada",
    ],
    ctaText: "Elegir Estudio Contable",
    ctaHref: "/login?mode=register&plan=estudio",
  },
];

const FAQS = [
  {
    q: "¿FacturAI almacena mis facturas o información financiera?",
    a: "No. Bajo el estricto cumplimiento de la Ley 1581 de 2012 (Habeas Data de Colombia), todos los documentos se procesan en la memoria RAM volátil de nuestros servidores. Una vez extraes o descargas el archivo, los datos temporales son eliminados.",
  },
  {
    q: "¿Es compatible con la normativa DIAN UBL 2.1?",
    a: "100% compatible. FacturAI incorpora un motor de lectura nativo de XML UBL 2.1 que extrae directamente los AttachedDocuments, CUFE SHA-384, tarifas de IVA (19%, 5%, 0%), ReteFuente y ReteICA sin margen de error.",
  },
  {
    q: "¿Cómo se importan los datos a Siigo Nube o Alegra?",
    a: "El botón de exportación genera un archivo Excel (.xlsx) estructurado con los encabezados y columnas exactas que exigen los importadores masivos de Siigo Nube y Alegra, ahorrándote horas de formateo.",
  },
  {
    q: "¿Qué sucede si supero las facturas de mi plan en un mes?",
    a: "Puedes adquirir paquetes adicionales de documentos o subir de plan en cualquier momento desde tu panel de usuario sin perder tu información.",
  },
];

export default function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>("anual");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="precios" aria-labelledby="pricing-heading" className="w-full py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.68rem] font-semibold uppercase tracking-wider bg-amber-400/10 border border-amber-400/30 text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            Monetización Transparente en Pesos Colombianos (COP)
          </span>

          <h1 id="pricing-heading" className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Invierte en tiempo, <span className="metallic-text">no en digitación manual</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Elige el plan ideal para tu despacho o empresa. Factura electrónica con IVA deducible, sin contratos forzosos y cancelación en cualquier momento.
          </p>
        </div>

        {/* Conmutador de Período estilo Píldora Apple */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setCycle("mensual")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                cycle === "mensual"
                  ? "bg-white/[0.12] text-white shadow-lg border border-white/[0.15]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Mensual
            </button>

            <button
              type="button"
              onClick={() => setCycle("semestral")}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                cycle === "semestral"
                  ? "bg-white/[0.12] text-white shadow-lg border border-white/[0.15]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Semestral</span>
              <span className="px-1.5 py-0.5 rounded-full text-[0.62rem] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Ahorra 15%
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCycle("anual")}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                cycle === "anual"
                  ? "bg-amber-400/20 text-amber-300 shadow-lg border border-amber-400/40"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Anual</span>
              <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                2 Meses Gratis
              </span>
            </button>
          </div>
        </div>

        {/* Cajas Bento de Precios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PLANS.map((plan) => {
            const currentPrice = plan.price[cycle];

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-white/[0.04] border-2 border-amber-400/50 shadow-2xl shadow-amber-400/10 backdrop-blur-2xl md:-translate-y-2"
                    : "bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.18] backdrop-blur-xl"
                }`}
              >
                {/* Insignia Recomendado */}
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 text-xs font-bold shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 fill-zinc-950" />
                    <span>Plan Más Elegido</span>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Título y Descripción */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-xl font-bold text-white tracking-tight">{plan.name}</h2>
                      {plan.badge && !plan.highlighted && (
                        <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-semibold text-zinc-400 bg-white/[0.05] border border-white/[0.08]">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-zinc-400 leading-relaxed min-h-[36px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Precio */}
                  <div className="py-4 border-y border-white/[0.06] space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        {currentPrice.display}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">{currentPrice.period}</span>
                    </div>
                    {currentPrice.note && (
                      <span className="block text-[0.72rem] font-medium text-amber-300">
                        {currentPrice.note}
                      </span>
                    )}
                  </div>

                  {/* Lista de Características */}
                  <ul className="space-y-3 text-xs text-zinc-300">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 mt-0.5">
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Botón de Acción */}
                <div className="mt-8 pt-4">
                  <Link
                    href={plan.ctaHref}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all ${
                      plan.highlighted
                        ? "bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-lg shadow-amber-400/20"
                        : "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1]"
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Garantías de Confianza */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
          <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">Factura con IVA deducible</h3>
              <p className="text-[0.72rem] text-zinc-400">Emitimos factura electrónica DIAN por tu suscripción.</p>
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">Cancelación en 1 Clic</h3>
              <p className="text-[0.72rem] text-zinc-400">Sin cláusulas de permanencia ni cobros sorpresivos.</p>
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">Compatible Siigo & Alegra</h3>
              <p className="text-[0.72rem] text-zinc-400">Archivos listos para causación automática.</p>
            </div>
          </div>
        </div>

        {/* Preguntas Frecuentes (FAQ) */}
        <div className="max-w-3xl mx-auto space-y-6 pt-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Preguntas Frecuentes</h2>
            <p className="text-xs text-zinc-400">Todo lo que necesitas saber antes de empezar</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-zinc-400 transition-transform ${
                        isOpen ? "rotate-180 text-blue-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-zinc-400 leading-relaxed border-t border-white/[0.04] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
