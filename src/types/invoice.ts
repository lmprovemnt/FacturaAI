/**
 * Modelo de dominio de FacturAI Colombia.
 * Estas interfaces son compartidas entre el endpoint de extracción (servidor)
 * y la interfaz de validación humana (cliente).
 */

export type TipoDocumento = "factura" | "documento_soporte" | "recibo";

export const TIPOS_DOCUMENTO: readonly TipoDocumento[] = [
  "factura",
  "documento_soporte",
  "recibo",
] as const;

export interface Emisor {
  razonSocial: string;
  /** NIT con dígito de verificación si aplica, ej. "900123456-7" */
  nit: string;
  direccion: string;
  telefono: string;
}

export interface Documento {
  prefijo: string;
  consecutivo: string;
  /** Formato YYYY-MM-DD */
  fechaEmision: string;
  tipoDocumento: TipoDocumento;
}

export interface Totales {
  moneda: string;
  subtotal: number;
  iva: number;
  reteFuente: number;
  reteIca: number;
  totalPagar: number;
}

export interface Item {
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
  totalItem: number;
}

export interface InvoiceData {
  emisor: Emisor;
  documento: Documento;
  totales: Totales;
  items: Item[];
}

/** Códigos de error que el endpoint puede devolver al cliente. */
export type ExtractErrorCode =
  | "MISSING_API_KEY"
  | "INVALID_API_KEY"
  | "NO_FILE"
  | "UNSUPPORTED_TYPE"
  | "FILE_TOO_LARGE"
  | "EMPTY_RESPONSE"
  | "INVALID_RESPONSE"
  | "RATE_LIMITED"
  | "AI_ERROR"
  | "INTERNAL_ERROR";

export interface ExtractSuccessResponse {
  ok: true;
  data: InvoiceData;
  meta: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    model: string;
    processingMs: number;
  };
}

export interface ExtractErrorResponse {
  ok: false;
  error: {
    code: ExtractErrorCode;
    message: string;
  };
}

export type ExtractResponse = ExtractSuccessResponse | ExtractErrorResponse;

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/** Límite de tamaño para datos inline enviados a Gemini (10 MB). */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export function isAllowedMimeType(value: string): value is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(value);
}

export function createEmptyItem(): Item {
  return { descripcion: "", cantidad: 1, valorUnitario: 0, totalItem: 0 };
}
