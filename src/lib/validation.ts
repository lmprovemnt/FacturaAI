import type { InvoiceData } from "@/types/invoice";

/** Pesos oficiales DIAN para el cálculo del dígito de verificación (de derecha a izquierda). */
const DIAN_WEIGHTS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71] as const;

export function calcularDV(nitBase: string): number | null {
  const digits = nitBase.replace(/\D/g, "");
  if (digits.length === 0 || digits.length > DIAN_WEIGHTS.length) return null;
  let sum = 0;
  const reversed = digits.split("").reverse();
  reversed.forEach((d, i) => {
    sum += Number(d) * DIAN_WEIGHTS[i];
  });
  const mod = sum % 11;
  return mod > 1 ? 11 - mod : mod;
}

export type NitStatus =
  | { kind: "empty" }
  | { kind: "no-dv"; expected: number | null }
  | { kind: "valid" }
  | { kind: "invalid"; expected: number | null };

export function validarNit(nit: string): NitStatus {
  const clean = nit.replace(/[.\s]/g, "");
  if (!clean) return { kind: "empty" };
  const [base, dv] = clean.split("-");
  const expected = calcularDV(base ?? "");
  if (dv === undefined || dv === "") return { kind: "no-dv", expected };
  return Number(dv) === expected ? { kind: "valid" } : { kind: "invalid", expected };
}

export interface ValidationWarning {
  id: string;
  message: string;
}

const TOLERANCE = 1; // pesos de tolerancia por redondeo

/** Reglas de consistencia contable para apoyar la revisión humana. */
export function getValidationWarnings(data: InvoiceData): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const { totales, items, documento, emisor } = data;

  if (!emisor.razonSocial) {
    warnings.push({ id: "razon", message: "Falta la razón social del emisor." });
  }

  const nit = validarNit(emisor.nit);
  if (nit.kind === "empty") {
    warnings.push({ id: "nit", message: "Falta el NIT del emisor." });
  } else if (nit.kind === "invalid") {
    warnings.push({
      id: "nit",
      message: `El dígito de verificación del NIT no coincide (esperado: ${nit.expected ?? "?"}).`,
    });
  }

  if (documento.fechaEmision && !/^\d{4}-\d{2}-\d{2}$/.test(documento.fechaEmision)) {
    warnings.push({ id: "fecha", message: "La fecha de emisión no está en formato YYYY-MM-DD." });
  }

  if (items.length > 0) {
    const sumItems = items.reduce((acc, it) => acc + it.totalItem, 0);
    if (Math.abs(sumItems - totales.subtotal) > TOLERANCE && totales.subtotal > 0) {
      warnings.push({
        id: "items-subtotal",
        message: `La suma de ítems (${formatMoney(sumItems, totales.moneda)}) difiere del subtotal (${formatMoney(totales.subtotal, totales.moneda)}). Puede deberse a ítems con IVA incluido.`,
      });
    }
    items.forEach((it, idx) => {
      const expected = it.cantidad * it.valorUnitario;
      if (Math.abs(expected - it.totalItem) > TOLERANCE && expected > 0) {
        warnings.push({
          id: `item-${idx}`,
          message: `Ítem ${idx + 1}: cantidad × valor unitario (${formatMoney(expected, totales.moneda)}) ≠ total del ítem.`,
        });
      }
    });
  }

  const expectedTotal = totales.subtotal + totales.iva - totales.reteFuente - totales.reteIca;
  const expectedTotalNoRet = totales.subtotal + totales.iva;
  if (
    totales.totalPagar > 0 &&
    Math.abs(expectedTotal - totales.totalPagar) > TOLERANCE &&
    Math.abs(expectedTotalNoRet - totales.totalPagar) > TOLERANCE
  ) {
    warnings.push({
      id: "total",
      message: `Subtotal + IVA − retenciones (${formatMoney(expectedTotal, totales.moneda)}) no cuadra con el total a pagar.`,
    });
  }

  return warnings;
}

export function formatMoney(value: number, currency = "COP"): string {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency || "COP",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString("es-CO")}`;
  }
}
