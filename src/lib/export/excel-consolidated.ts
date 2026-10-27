import * as XLSX from "xlsx";
import type { StandardInvoiceData } from "@/types/accounting";

const TIPO_LABEL: Record<StandardInvoiceData["tipoDocumento"], string> = {
  factura_electronica: "Factura Electrónica",
  documento_soporte: "Documento Soporte",
  nota_credito: "Nota Crédito",
  recibo: "Recibo / POS",
};

/**
 * Genera un libro Excel (.xlsx) consolidado en memoria con dos hojas:
 * 1. "Consolidado": Encabezados de comprobantes con bases e impuestos.
 * 2. "Detalle Partidas": Desglose de ítems asociados por CUFE y consecutivo.
 */
export function buildConsolidatedExcel(invoices: StandardInvoiceData[]): Buffer {
  const wb = XLSX.utils.book_new();

  // 1. Hoja Consolidado
  const consolidadoRows = invoices.map((inv) => ({
    "Fecha Emisión": inv.fechaEmision,
    "Hora Emisión": inv.horaEmision,
    "Tipo Documento": TIPO_LABEL[inv.tipoDocumento] || inv.tipoDocumento,
    Prefijo: inv.prefijo,
    Consecutivo: inv.consecutivo,
    "NIT Emisor": inv.emisor.nit,
    "DV Emisor": inv.emisor.digitoVerificacion,
    "Razón Social Emisor": inv.emisor.razonSocial,
    "NIT Adquirente": inv.adquirente.nit,
    "DV Adquirente": inv.adquirente.digitoVerificacion,
    "Razón Social Adquirente": inv.adquirente.razonSocial,
    Subtotal: inv.subtotal,
    "IVA 19%": inv.impuestos.iva19,
    "IVA 5%": inv.impuestos.iva5,
    "IVA 0% / Exento": inv.impuestos.iva0,
    ReteFuente: inv.impuestos.reteFuente,
    ReteICA: inv.impuestos.reteIca,
    ReteIVA: inv.impuestos.reteIva,
    "Total a Pagar": inv.totalPagar,
    Moneda: inv.moneda,
    CUFE: inv.cufe,
  }));

  const wsConsolidado = XLSX.utils.json_to_sheet(
    consolidadoRows.length > 0 ? consolidadoRows : [{ "Mensaje": "No se encontraron facturas procesadas" }]
  );

  // Ancho automático de columnas
  if (consolidadoRows.length > 0) {
    wsConsolidado["!cols"] = [
      { wch: 13 }, // Fecha
      { wch: 12 }, // Hora
      { wch: 20 }, // Tipo
      { wch: 8 },  // Prefijo
      { wch: 14 }, // Consecutivo
      { wch: 14 }, // NIT Emisor
      { wch: 6 },  // DV Emisor
      { wch: 32 }, // Razón Social Emisor
      { wch: 14 }, // NIT Adquirente
      { wch: 6 },  // DV Adquirente
      { wch: 30 }, // Razón Social Adquirente
      { wch: 15 }, // Subtotal
      { wch: 13 }, // IVA 19
      { wch: 13 }, // IVA 5
      { wch: 14 }, // IVA 0
      { wch: 13 }, // ReteFuente
      { wch: 13 }, // ReteICA
      { wch: 13 }, // ReteIVA
      { wch: 16 }, // Total a Pagar
      { wch: 8 },  // Moneda
      { wch: 45 }, // CUFE
    ];
  }

  // 2. Hoja Detalle de Partidas
  const partidaRows: Record<string, unknown>[] = [];
  invoices.forEach((inv) => {
    const docRef = [inv.prefijo, inv.consecutivo].filter(Boolean).join("-") || "SIN_NUM";
    if (inv.items.length === 0) {
      partidaRows.push({
        Documento: docRef,
        "NIT Emisor": inv.emisor.nit,
        "Razón Social": inv.emisor.razonSocial,
        Código: "",
        Descripción: "(Sin ítems desglosados)",
        Cantidad: 1,
        "Valor Unitario": inv.subtotal,
        "Total Partida": inv.subtotal,
        CUFE: inv.cufe,
      });
    } else {
      inv.items.forEach((it, idx) => {
        partidaRows.push({
          "#": idx + 1,
          Documento: docRef,
          "NIT Emisor": inv.emisor.nit,
          "Razón Social": inv.emisor.razonSocial,
          Código: it.codigo,
          Descripción: it.descripcion,
          Cantidad: it.cantidad,
          "Valor Unitario": it.valorUnitario,
          "Total Partida": it.totalItem,
          CUFE: inv.cufe,
        });
      });
    }
  });

  const wsPartidas = XLSX.utils.json_to_sheet(
    partidaRows.length > 0 ? partidaRows : [{ "Mensaje": "Sin partidas" }]
  );

  if (partidaRows.length > 0) {
    wsPartidas["!cols"] = [
      { wch: 5 },
      { wch: 14 },
      { wch: 14 },
      { wch: 28 },
      { wch: 12 },
      { wch: 40 },
      { wch: 10 },
      { wch: 14 },
      { wch: 14 },
      { wch: 40 },
    ];
  }

  XLSX.utils.book_append_sheet(wb, wsConsolidado, "Consolidado");
  XLSX.utils.book_append_sheet(wb, wsPartidas, "Partidas");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
