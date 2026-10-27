import type { InvoiceData } from "@/types/invoice";

const TIPO_LABEL: Record<InvoiceData["documento"]["tipoDocumento"], string> = {
  factura: "Factura",
  documento_soporte: "Documento soporte",
  recibo: "Recibo",
};

function buildFileName(data: InvoiceData): string {
  const ref = [data.documento.prefijo, data.documento.consecutivo]
    .filter(Boolean)
    .join("-")
    .replace(/[^\w-]/g, "");
  const nit = data.emisor.nit.replace(/[^\w-]/g, "");
  const date = data.documento.fechaEmision || new Date().toISOString().slice(0, 10);
  return `FacturAI_${nit || "emisor"}_${ref || "documento"}_${date}.xlsx`;
}

/**
 * Genera y descarga un .xlsx con tres hojas:
 *  1. "Resumen"  – una fila con todos los campos de cabecera (apto para importar a software contable).
 *  2. "Items"    – una fila por ítem con la referencia del documento.
 *  3. "Ficha"    – vista vertical campo/valor para lectura humana.
 *
 * Se importa `xlsx` de forma dinámica para no cargarlo en el bundle inicial.
 */
export async function exportInvoiceToExcel(data: InvoiceData): Promise<string> {
  const XLSX = await import("xlsx");
  const { emisor, documento, totales, items } = data;
  const referencia = [documento.prefijo, documento.consecutivo].filter(Boolean).join("-");

  // Hoja 1: Resumen (formato tabular)
  const resumenRow = {
    "Tipo documento": TIPO_LABEL[documento.tipoDocumento],
    Prefijo: documento.prefijo,
    Consecutivo: documento.consecutivo,
    "Fecha emisión": documento.fechaEmision,
    "Razón social emisor": emisor.razonSocial,
    "NIT emisor": emisor.nit,
    "Dirección emisor": emisor.direccion,
    "Teléfono emisor": emisor.telefono,
    Moneda: totales.moneda,
    Subtotal: totales.subtotal,
    IVA: totales.iva,
    ReteFuente: totales.reteFuente,
    ReteICA: totales.reteIca,
    "Total a pagar": totales.totalPagar,
    "Nº ítems": items.length,
  };
  const wsResumen = XLSX.utils.json_to_sheet([resumenRow]);
  wsResumen["!cols"] = Object.keys(resumenRow).map((k) => ({
    wch: Math.max(k.length, String(resumenRow[k as keyof typeof resumenRow]).length) + 2,
  }));

  // Hoja 2: Items
  const itemRows = items.map((it, idx) => ({
    "#": idx + 1,
    Documento: referencia,
    "NIT emisor": emisor.nit,
    Descripción: it.descripcion,
    Cantidad: it.cantidad,
    "Valor unitario": it.valorUnitario,
    "Total ítem": it.totalItem,
  }));
  const wsItems = XLSX.utils.json_to_sheet(
    itemRows.length > 0
      ? itemRows
      : [{ "#": "", Documento: referencia, "NIT emisor": emisor.nit, Descripción: "(sin ítems)", Cantidad: "", "Valor unitario": "", "Total ítem": "" }],
  );
  wsItems["!cols"] = [
    { wch: 5 },
    { wch: 18 },
    { wch: 16 },
    { wch: Math.max(14, ...items.map((i) => Math.min(i.descripcion.length, 80))) + 2 },
    { wch: 10 },
    { wch: 16 },
    { wch: 16 },
  ];

  // Hoja 3: Ficha (clave / valor)
  const ficha: (string | number)[][] = [
    ["FacturAI Colombia – Ficha de documento"],
    [],
    ["EMISOR"],
    ["Razón social", emisor.razonSocial],
    ["NIT", emisor.nit],
    ["Dirección", emisor.direccion],
    ["Teléfono", emisor.telefono],
    [],
    ["DOCUMENTO"],
    ["Tipo", TIPO_LABEL[documento.tipoDocumento]],
    ["Prefijo", documento.prefijo],
    ["Consecutivo", documento.consecutivo],
    ["Fecha de emisión", documento.fechaEmision],
    [],
    ["TOTALES"],
    ["Moneda", totales.moneda],
    ["Subtotal", totales.subtotal],
    ["IVA", totales.iva],
    ["ReteFuente", totales.reteFuente],
    ["ReteICA", totales.reteIca],
    ["Total a pagar", totales.totalPagar],
    [],
    ["Exportado", new Date().toISOString()],
  ];
  const wsFicha = XLSX.utils.aoa_to_sheet(ficha);
  wsFicha["!cols"] = [{ wch: 22 }, { wch: 48 }];

  // Formato numérico para columnas monetarias
  const moneyFmt = "#,##0.00";
  applyNumberFormat(XLSX, wsResumen, ["J", "K", "L", "M", "N"], moneyFmt);
  applyNumberFormat(XLSX, wsItems, ["F", "G"], moneyFmt);

  const wb = XLSX.utils.book_new();
  wb.Props = { Title: `FacturAI ${referencia}`, Author: "FacturAI Colombia" };
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
  XLSX.utils.book_append_sheet(wb, wsItems, "Items");
  XLSX.utils.book_append_sheet(wb, wsFicha, "Ficha");

  const fileName = buildFileName(data);
  XLSX.writeFile(wb, fileName, { compression: true });
  return fileName;
}

type XLSXModule = typeof import("xlsx");
type WorkSheet = import("xlsx").WorkSheet;

function applyNumberFormat(XLSX: XLSXModule, ws: WorkSheet, cols: string[], fmt: string): void {
  const ref = ws["!ref"];
  if (!ref) return;
  const range = XLSX.utils.decode_range(ref);
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    for (const col of cols) {
      const cell = ws[`${col}${r + 1}`];
      if (cell && cell.t === "n") cell.z = fmt;
    }
  }
}
