/**
 * Modelo de datos contable unificado para FacturAI Colombia.
 * Este modelo estandariza la representación de comprobantes electrónicos procesados
 * tanto por el parser nativo DIAN UBL 2.1 como por el extractor multimodal de IA.
 */

export type DocumentType =
  | "factura_electronica"
  | "documento_soporte"
  | "nota_credito"
  | "recibo";

export const DOCUMENT_TYPES: readonly DocumentType[] = [
  "factura_electronica",
  "documento_soporte",
  "nota_credito",
  "recibo",
] as const;

export interface PartyIdentification {
  razonSocial: string;
  /** Número de Identificación Tributaria (sin el dígito de verificación ni guiones) */
  nit: string;
  /** Dígito de verificación (0-9) según algoritmo DIAN o schemeID */
  digitoVerificacion: string;
  direccion: string;
  telefono: string;
  email: string;
}

export interface TaxBreakdown {
  /** IVA generado a la tarifa general del 19% */
  iva19: number;
  /** IVA generado a la tarifa preferencial del 5% */
  iva5: number;
  /** Operaciones excluidas, exentas o con IVA 0% */
  iva0: number;
  /** Retención en la fuente a título de renta practicada */
  reteFuente: number;
  /** Retención de Industria y Comercio (ICA) */
  reteIca: number;
  /** Retención en la fuente a título de IVA (ReteIVA) */
  reteIva: number;
}

export interface InvoiceItem {
  /** Código del producto o servicio (estándar UNSPSC, EAN o código interno) */
  codigo: string;
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
  totalItem: number;
}

export interface StandardInvoiceData {
  /** Código Único de Factura Electrónica (CUFE) o CUDE para documento soporte */
  cufe: string;
  tipoDocumento: DocumentType;
  prefijo: string;
  consecutivo: string;
  /** Formato ISO: YYYY-MM-DD */
  fechaEmision: string;
  /** Formato: HH:MM:SS */
  horaEmision: string;
  /** Código ISO 4217 (ej. COP, USD) */
  moneda: string;
  emisor: PartyIdentification;
  adquirente: PartyIdentification;
  /** Base gravable antes de tributos */
  subtotal: number;
  impuestos: TaxBreakdown;
  /** Total a pagar liquidado */
  totalPagar: number;
  items: InvoiceItem[];
}

export type ExtractionSource = "xml_ubl" | "ai_gemini";

export interface FileItem {
  name: string;
  buffer: Buffer;
  mimeType: string;
  sizeBytes: number;
}

export interface ExtractionResult {
  success: boolean;
  fileName: string;
  source: ExtractionSource;
  data?: StandardInvoiceData;
  error?: string;
  processingTimeMs: number;
}

export interface BatchProcessingResponse {
  total: number;
  successful: number;
  failed: number;
  results: ExtractionResult[];
  processingTimeMs: number;
}

export type ExportFormat = "consolidated" | "siigo" | "alegra";

export interface ExportRequest {
  format: ExportFormat;
  invoices: StandardInvoiceData[];
}
