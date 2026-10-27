import { Type, type Schema } from "@google/genai";
import {
  TIPOS_DOCUMENTO,
  type InvoiceData,
  type Item,
  type TipoDocumento,
} from "@/types/invoice";

/**
 * Esquema estricto (Structured Outputs) para Gemini.
 * Refleja 1:1 la interfaz `InvoiceData`.
 */
export const invoiceResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    emisor: {
      type: Type.OBJECT,
      description: "Datos del emisor/vendedor que expide el documento.",
      properties: {
        razonSocial: {
          type: Type.STRING,
          description: "Razón social o nombre completo del emisor.",
        },
        nit: {
          type: Type.STRING,
          description:
            "NIT o documento del emisor. Incluir el dígito de verificación separado por guion si aparece, ej. '900123456-7'.",
        },
        direccion: { type: Type.STRING, description: "Dirección del emisor." },
        telefono: { type: Type.STRING, description: "Teléfono del emisor." },
      },
      required: ["razonSocial", "nit", "direccion", "telefono"],
      propertyOrdering: ["razonSocial", "nit", "direccion", "telefono"],
    },
    documento: {
      type: Type.OBJECT,
      properties: {
        prefijo: {
          type: Type.STRING,
          description:
            "Prefijo de numeración autorizado por la DIAN (ej. 'FE', 'SETP'). Vacío si no existe.",
        },
        consecutivo: {
          type: Type.STRING,
          description: "Número consecutivo del documento, sin el prefijo.",
        },
        fechaEmision: {
          type: Type.STRING,
          description: "Fecha de emisión en formato ISO YYYY-MM-DD.",
        },
        tipoDocumento: {
          type: Type.STRING,
          format: "enum",
          enum: [...TIPOS_DOCUMENTO],
          description:
            "'factura' para factura de venta/electrónica, 'documento_soporte' para documento soporte en adquisiciones a no obligados a facturar, 'recibo' para recibos, tiquetes POS o cuentas de cobro.",
        },
      },
      required: ["prefijo", "consecutivo", "fechaEmision", "tipoDocumento"],
      propertyOrdering: ["prefijo", "consecutivo", "fechaEmision", "tipoDocumento"],
    },
    totales: {
      type: Type.OBJECT,
      properties: {
        moneda: {
          type: Type.STRING,
          description: "Código ISO 4217 de la moneda, ej. 'COP', 'USD'.",
        },
        subtotal: { type: Type.NUMBER, description: "Base gravable antes de impuestos." },
        iva: { type: Type.NUMBER, description: "Valor total del IVA." },
        reteFuente: {
          type: Type.NUMBER,
          description: "Retención en la fuente. 0 si no aplica.",
        },
        reteIca: { type: Type.NUMBER, description: "Retención de ICA. 0 si no aplica." },
        totalPagar: { type: Type.NUMBER, description: "Valor neto total a pagar." },
      },
      required: ["moneda", "subtotal", "iva", "reteFuente", "reteIca", "totalPagar"],
      propertyOrdering: ["moneda", "subtotal", "iva", "reteFuente", "reteIca", "totalPagar"],
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          descripcion: { type: Type.STRING },
          cantidad: { type: Type.NUMBER },
          valorUnitario: { type: Type.NUMBER },
          totalItem: { type: Type.NUMBER },
        },
        required: ["descripcion", "cantidad", "valorUnitario", "totalItem"],
        propertyOrdering: ["descripcion", "cantidad", "valorUnitario", "totalItem"],
      },
    },
  },
  required: ["emisor", "documento", "totales", "items"],
  propertyOrdering: ["emisor", "documento", "totales", "items"],
};

export const EXTRACTION_SYSTEM_PROMPT = `Eres un asistente contable experto en normativa tributaria colombiana (DIAN, Estatuto Tributario).
Tu tarea es extraer con máxima precisión los datos de facturas electrónicas, documentos soporte, tiquetes POS y recibos colombianos.

Reglas:
- Devuelve los valores monetarios como números puros (sin símbolos, sin separadores de miles). En Colombia el punto suele ser separador de miles y la coma decimal: "$1.234.567,50" => 1234567.5.
- Si un campo no aparece en el documento, usa "" para textos y 0 para números. Nunca inventes datos.
- La fecha debe normalizarse a YYYY-MM-DD.
- El NIT debe incluir el dígito de verificación separado por guion cuando esté presente (ej. 900123456-7). Elimina puntos y espacios.
- Las retenciones (ReteFuente, ReteICA) solo se reportan si aparecen explícitamente.
- Extrae TODAS las líneas de detalle de productos o servicios.`;

/* ------------------------------------------------------------------ */
/* Normalización defensiva: garantiza el contrato aunque el modelo     */
/* devuelva tipos inesperados (strings numéricos, nulls, etc.).        */
/* ------------------------------------------------------------------ */

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStr(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

export function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d,.-]/g, "");
    // Formato colombiano "1.234.567,89"
    const normalized =
      cleaned.includes(",") && cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toTipoDocumento(value: unknown): TipoDocumento {
  const str = toStr(value).toLowerCase();
  return (TIPOS_DOCUMENTO as readonly string[]).includes(str)
    ? (str as TipoDocumento)
    : "factura";
}

function normalizeItem(raw: unknown): Item {
  const r = isRecord(raw) ? raw : {};
  return {
    descripcion: toStr(r.descripcion),
    cantidad: toNumber(r.cantidad),
    valorUnitario: toNumber(r.valorUnitario),
    totalItem: toNumber(r.totalItem),
  };
}

export function normalizeInvoice(raw: unknown): InvoiceData {
  const root = isRecord(raw) ? raw : {};
  const emisor = isRecord(root.emisor) ? root.emisor : {};
  const documento = isRecord(root.documento) ? root.documento : {};
  const totales = isRecord(root.totales) ? root.totales : {};
  const items = Array.isArray(root.items) ? root.items : [];

  return {
    emisor: {
      razonSocial: toStr(emisor.razonSocial),
      nit: toStr(emisor.nit).replace(/[.\s]/g, ""),
      direccion: toStr(emisor.direccion),
      telefono: toStr(emisor.telefono),
    },
    documento: {
      prefijo: toStr(documento.prefijo),
      consecutivo: toStr(documento.consecutivo),
      fechaEmision: toStr(documento.fechaEmision),
      tipoDocumento: toTipoDocumento(documento.tipoDocumento),
    },
    totales: {
      moneda: toStr(totales.moneda).toUpperCase() || "COP",
      subtotal: toNumber(totales.subtotal),
      iva: toNumber(totales.iva),
      reteFuente: toNumber(totales.reteFuente),
      reteIca: toNumber(totales.reteIca),
      totalPagar: toNumber(totales.totalPagar),
    },
    items: items.map(normalizeItem),
  };
}
