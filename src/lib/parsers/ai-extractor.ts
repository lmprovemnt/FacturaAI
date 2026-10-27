import { GoogleGenAI, Type, type Schema } from "@google/genai";
import {
  DOCUMENT_TYPES,
  type DocumentType,
  type InvoiceItem,
  type PartyIdentification,
  type StandardInvoiceData,
  type TaxBreakdown,
} from "@/types/accounting";
import { calcularDVIng } from "@/lib/parsers/ubl-parser";

const MODEL = "gemini-2.5-flash";

const partySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    razonSocial: {
      type: Type.STRING,
      description: "Nombre legal o razón social completa del emisor o adquirente.",
    },
    nit: {
      type: Type.STRING,
      description: "Número de Identificación Tributaria o cédula, únicamente dígitos sin guiones ni DV.",
    },
    digitoVerificacion: {
      type: Type.STRING,
      description: "Dígito de verificación DIAN (0-9). Cadena vacía si es cédula extranjera o no aplica.",
    },
    direccion: {
      type: Type.STRING,
      description: "Dirección fiscal o domicilio comercial.",
    },
    telefono: {
      type: Type.STRING,
      description: "Número telefónico de contacto.",
    },
    email: {
      type: Type.STRING,
      description: "Correo electrónico para recepción o emisión de facturas.",
    },
  },
  required: ["razonSocial", "nit", "digitoVerificacion", "direccion", "telefono", "email"],
  propertyOrdering: ["razonSocial", "nit", "digitoVerificacion", "direccion", "telefono", "email"],
};

/**
 * Esquema estricto (Structured Output) para Gemini 2.5 Flash,
 * alineado con el modelo StandardInvoiceData.
 */
export const standardInvoiceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    cufe: {
      type: Type.STRING,
      description: "Código Único de Factura Electrónica (CUFE) o CUDE (cadena hexadecimal de 64-96 caracteres). Cadena vacía si no existe.",
    },
    tipoDocumento: {
      type: Type.STRING,
      format: "enum",
      enum: [...DOCUMENT_TYPES],
      description:
        "'factura_electronica' para factura de venta electrónica, 'documento_soporte' para adquisiciones a no obligados, 'nota_credito' para notas crédito, 'recibo' para comprobantes de pago o POS.",
    },
    prefijo: {
      type: Type.STRING,
      description: "Prefijo de numeración autorizado por la DIAN (ej. 'FE', 'SETP', 'FC'). Cadena vacía si no tiene.",
    },
    consecutivo: {
      type: Type.STRING,
      description: "Número consecutivo de la factura o comprobante (ej. '1234', '98501').",
    },
    fechaEmision: {
      type: Type.STRING,
      description: "Fecha de expedición en formato ISO YYYY-MM-DD.",
    },
    horaEmision: {
      type: Type.STRING,
      description: "Hora de expedición en formato HH:MM:SS. '00:00:00' si no aparece.",
    },
    moneda: {
      type: Type.STRING,
      description: "Código ISO de la moneda (ej. 'COP', 'USD').",
    },
    emisor: partySchema,
    adquirente: partySchema,
    subtotal: {
      type: Type.NUMBER,
      description: "Base gravable total antes de impuestos y retenciones.",
    },
    impuestos: {
      type: Type.OBJECT,
      properties: {
        iva19: {
          type: Type.NUMBER,
          description: "Valor liquidado de IVA a la tarifa general del 19%. 0 si no aplica.",
        },
        iva5: {
          type: Type.NUMBER,
          description: "Valor liquidado de IVA a la tarifa diferencial del 5%. 0 si no aplica.",
        },
        iva0: {
          type: Type.NUMBER,
          description: "Base gravable o valor de operaciones exentas/excluidas (0%).",
        },
        reteFuente: {
          type: Type.NUMBER,
          description: "Valor total de retención en la fuente practicada a título de renta. 0 si no aplica.",
        },
        reteIca: {
          type: Type.NUMBER,
          description: "Valor de retención de Industria y Comercio (ReteICA). 0 si no aplica.",
        },
        reteIva: {
          type: Type.NUMBER,
          description: "Valor de retención en la fuente a título de IVA (ReteIVA). 0 si no aplica.",
        },
      },
      required: ["iva19", "iva5", "iva0", "reteFuente", "reteIca", "reteIva"],
      propertyOrdering: ["iva19", "iva5", "iva0", "reteFuente", "reteIca", "reteIva"],
    },
    totalPagar: {
      type: Type.NUMBER,
      description: "Valor neto total a pagar liquidado en el comprobante.",
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          codigo: {
            type: Type.STRING,
            description: "Código de referencia, SKU o código UNSPSC del producto/servicio.",
          },
          descripcion: {
            type: Type.STRING,
            description: "Descripción detallada del bien o servicio prestado.",
          },
          cantidad: {
            type: Type.NUMBER,
            description: "Cantidad de unidades facturadas.",
          },
          valorUnitario: {
            type: Type.NUMBER,
            description: "Precio unitario antes de impuestos.",
          },
          totalItem: {
            type: Type.NUMBER,
            description: "Subtotal o valor total de la línea (cantidad × valor unitario).",
          },
        },
        required: ["codigo", "descripcion", "cantidad", "valorUnitario", "totalItem"],
        propertyOrdering: ["codigo", "descripcion", "cantidad", "valorUnitario", "totalItem"],
      },
    },
  },
  required: [
    "cufe",
    "tipoDocumento",
    "prefijo",
    "consecutivo",
    "fechaEmision",
    "horaEmision",
    "moneda",
    "emisor",
    "adquirente",
    "subtotal",
    "impuestos",
    "totalPagar",
    "items",
  ],
  propertyOrdering: [
    "cufe",
    "tipoDocumento",
    "prefijo",
    "consecutivo",
    "fechaEmision",
    "horaEmision",
    "moneda",
    "emisor",
    "adquirente",
    "subtotal",
    "impuestos",
    "totalPagar",
    "items",
  ],
};

export const AI_ACCOUNTING_SYSTEM_PROMPT = `Actúa como un Auditor Contable y Tributario Senior especializado en el Estatuto Tributario de Colombia y la normativa de Facturación Electrónica de la DIAN.

Tu misión es extraer con exactitud matemática y contable los datos de este documento (factura electrónica, documento soporte, nota crédito o recibo).

REGLAS TRIBUTARIAS CRÍTICAS (COLOMBIA):
1. **Valores Monetarios:**
   - Devuelve todos los valores numéricos limpios (ej. 1250000.50). Nunca uses comas como separadores de miles ni símbolos como '$'.
   - En Colombia, '$1.250.000,00' equivale a 1250000.
2. **Identificación Tributaria (NIT):**
   - El NIT del emisor y adquirente debe extraerse únicamente con sus dígitos base.
   - El Dígito de Verificación (DV) debe reportarse por separado en 'digitoVerificacion' (ej. NIT 900123456 con DV 1). Si el documento no lo especifica expresamente, déjalo vacío ("").
3. **Desglose de Tributos:**
   - Clasifica el IVA según su tarifa: 'iva19' (tarifa general 19%), 'iva5' (tarifa diferencial 5%), 'iva0' (excluido/exento).
   - Extrae retenciones solo cuando estén explicitadas: ReteFuente, ReteICA y ReteIVA.
4. **Fechas:**
   - La fecha debe normalizarse estrictamente a ISO 'YYYY-MM-DD'.
   - La hora debe normalizarse a 'HH:MM:SS' (si no se encuentra, usa '00:00:00').
5. **Partidas / Ítems:**
   - Extrae el 100% de las filas de productos o servicios facturados. No omitas renglones.`;

/**
 * Procesa un archivo (PDF, PNG, JPG, WEBP) en memoria con Gemini 2.5 Flash
 * utilizando Structured Outputs para devolver un StandardInvoiceData estricto.
 */
export async function extractFromBufferAI(
  buffer: Buffer,
  mimeType: string
): Promise<StandardInvoiceData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY no está configurada en las variables de entorno. Es requerida para el pipeline multimodal."
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const base64Data = buffer.toString("base64");

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: "Extrae de forma exhaustiva y fiel los datos contables y tributarios colombianos de este comprobante conforme al esquema JSON.",
          },
        ],
      },
    ],
    config: {
      systemInstruction: AI_ACCOUNTING_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: standardInvoiceSchema,
      temperature: 0,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("El modelo de IA devolvió una respuesta vacía.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("La respuesta generada por la IA no tiene formato JSON válido.");
  }

  return normalizeAIInvoice(parsed);
}

/* --------------------------------------------------------------------------
   Normalizador Defensivo para StandardInvoiceData
   -------------------------------------------------------------------------- */

type UnknownRecord = Record<string, unknown>;

function isRecord(val: unknown): val is UnknownRecord {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function toStr(val: unknown): string {
  if (typeof val === "string") return val.trim();
  if (typeof val === "number" && Number.isFinite(val)) return String(val);
  return "";
}

function toNum(val: unknown): number {
  if (typeof val === "number") return Number.isFinite(val) ? val : 0;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^\d,.-]/g, "");
    if (!cleaned) return 0;
    const normalized =
      cleaned.includes(",") && cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toDocType(val: unknown): DocumentType {
  const str = toStr(val).toLowerCase();
  return (DOCUMENT_TYPES as readonly string[]).includes(str)
    ? (str as DocumentType)
    : "factura_electronica";
}

function normalizeParty(raw: unknown): PartyIdentification {
  const r = isRecord(raw) ? raw : {};
  const rawNit = toStr(r.nit).replace(/[.\s]/g, "");
  let nit = rawNit;
  let dv = toStr(r.digitoVerificacion);

  if (rawNit.includes("-")) {
    const [base, parsedDv] = rawNit.split("-");
    nit = base ?? "";
    if (!dv && parsedDv) dv = parsedDv;
  }

  if (!dv && nit) {
    dv = calcularDVIng(nit);
  }

  return {
    razonSocial: toStr(r.razonSocial) || "TERCERO NO IDENTIFICADO",
    nit: nit.replace(/\D/g, ""),
    digitoVerificacion: dv,
    direccion: toStr(r.direccion),
    telefono: toStr(r.telefono),
    email: toStr(r.email),
  };
}

function normalizeItem(raw: unknown): InvoiceItem {
  const r = isRecord(raw) ? raw : {};
  const cantidad = toNum(r.cantidad) || 1;
  const valorUnitario = toNum(r.valorUnitario);
  const totalItem = toNum(r.totalItem) || round2(cantidad * valorUnitario);

  return {
    codigo: toStr(r.codigo),
    descripcion: toStr(r.descripcion) || "Línea sin descripción",
    cantidad,
    valorUnitario: round2(valorUnitario),
    totalItem: round2(totalItem),
  };
}

function normalizeAIInvoice(raw: unknown): StandardInvoiceData {
  const root = isRecord(raw) ? raw : {};
  const emisor = normalizeParty(root.emisor);
  const adquirente = normalizeParty(root.adquirente);
  const imp = isRecord(root.impuestos) ? root.impuestos : {};

  const impuestos: TaxBreakdown = {
    iva19: round2(toNum(imp.iva19)),
    iva5: round2(toNum(imp.iva5)),
    iva0: round2(toNum(imp.iva0)),
    reteFuente: round2(toNum(imp.reteFuente)),
    reteIca: round2(toNum(imp.reteIca)),
    reteIva: round2(toNum(imp.reteIva)),
  };

  const rawItems = Array.isArray(root.items) ? root.items : [];
  const items = rawItems.map(normalizeItem);

  const subtotal = round2(toNum(root.subtotal));
  let totalPagar = round2(toNum(root.totalPagar));

  if (totalPagar === 0 && subtotal > 0) {
    totalPagar = round2(
      subtotal + impuestos.iva19 + impuestos.iva5 - impuestos.reteFuente - impuestos.reteIca - impuestos.reteIva
    );
  }

  return {
    cufe: toStr(root.cufe),
    tipoDocumento: toDocType(root.tipoDocumento),
    prefijo: toStr(root.prefijo),
    consecutivo: toStr(root.consecutivo),
    fechaEmision: toStr(root.fechaEmision) || new Date().toISOString().slice(0, 10),
    horaEmision: toStr(root.horaEmision) || "00:00:00",
    moneda: toStr(root.moneda).toUpperCase() || "COP",
    emisor,
    adquirente,
    subtotal,
    impuestos,
    totalPagar,
    items,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
