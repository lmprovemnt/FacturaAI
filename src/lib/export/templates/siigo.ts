import * as XLSX from "xlsx";
import type { StandardInvoiceData } from "@/types/accounting";

/**
 * Genera la plantilla de importación de Facturas de Compra y Gastos
 * compatible con Siigo Nube en formato Excel (.xlsx).
 */
export function buildSiigoPurchasesTemplate(invoices: StandardInvoiceData[]): Buffer {
  const wb = XLSX.utils.book_new();

  const rows: Record<string, unknown>[] = [];

  invoices.forEach((inv) => {
    const docNumero = [inv.prefijo, inv.consecutivo].filter(Boolean).join("-") || "1";
    const fecha = inv.fechaEmision; // Formato YYYY-MM-DD
    const nitTercero = inv.emisor.nit;
    const dvTercero = inv.emisor.digitoVerificacion;
    const nombreTercero = inv.emisor.razonSocial;
    const cufe = inv.cufe;

    // Determinar tasa promedio o efectiva de IVA para la factura
    let tasaIva = 0;
    if (inv.impuestos.iva19 > 0) {
      tasaIva = 19;
    } else if (inv.impuestos.iva5 > 0) {
      tasaIva = 5;
    }

    if (inv.items.length === 0) {
      rows.push({
        "Tipo de Comprobante": "F-Compras",
        "Consecutivo": docNumero,
        "Fecha de Elaboración": fecha,
        "Identificación Tercero": nitTercero,
        "Dígito de Verificación": dvTercero,
        "Sucursal": "0",
        "Razón Social": nombreTercero,
        "Código Producto/Servicio": "GASTO_GENERAL",
        "Descripción": "Compra / Gasto según comprobante " + docNumero,
        "Cantidad": 1,
        "Valor Unitario": inv.subtotal,
        "Descuento": 0,
        "Subtotal": inv.subtotal,
        "% IVA": tasaIva,
        "Valor IVA": inv.impuestos.iva19 + inv.impuestos.iva5,
        "Valor ReteFuente": inv.impuestos.reteFuente,
        "Valor ReteICA": inv.impuestos.reteIca,
        "Valor ReteIVA": inv.impuestos.reteIva,
        "Total": inv.totalPagar,
        "Observaciones / CUFE": cufe,
      });
    } else {
      inv.items.forEach((item, idx) => {
        // En facturas con múltiples ítems, distribuimos los impuestos proporcionalmente o en el primer ítem
        const isFirst = idx === 0;
        const itemIva = isFirst ? inv.impuestos.iva19 + inv.impuestos.iva5 : 0;
        const itemReteFuente = isFirst ? inv.impuestos.reteFuente : 0;
        const itemReteIca = isFirst ? inv.impuestos.reteIca : 0;
        const itemReteIva = isFirst ? inv.impuestos.reteIva : 0;
        const itemTotal = isFirst ? inv.totalPagar : item.totalItem;

        rows.push({
          "Tipo de Comprobante": "F-Compras",
          "Consecutivo": docNumero,
          "Fecha de Elaboración": fecha,
          "Identificación Tercero": nitTercero,
          "Dígito de Verificación": dvTercero,
          "Sucursal": "0",
          "Razón Social": nombreTercero,
          "Código Producto/Servicio": item.codigo || "GENERICO",
          "Descripción": item.descripcion,
          "Cantidad": item.cantidad,
          "Valor Unitario": item.valorUnitario,
          "Descuento": 0,
          "Subtotal": item.totalItem,
          "% IVA": tasaIva,
          "Valor IVA": itemIva,
          "Valor ReteFuente": itemReteFuente,
          "Valor ReteICA": itemReteIca,
          "Valor ReteIVA": itemReteIva,
          "Total": itemTotal,
          "Observaciones / CUFE": isFirst ? cufe : "",
        });
      });
    }
  });

  const ws = XLSX.utils.json_to_sheet(
    rows.length > 0 ? rows : [{ "Mensaje": "Sin datos para Siigo Nube" }]
  );

  if (rows.length > 0) {
    ws["!cols"] = [
      { wch: 18 }, // Tipo Comprobante
      { wch: 14 }, // Consecutivo
      { wch: 14 }, // Fecha
      { wch: 14 }, // NIT
      { wch: 6 },  // DV
      { wch: 8 },  // Sucursal
      { wch: 28 }, // Razón Social
      { wch: 16 }, // Código
      { wch: 35 }, // Descripción
      { wch: 10 }, // Cantidad
      { wch: 14 }, // Valor Unitario
      { wch: 10 }, // Descuento
      { wch: 14 }, // Subtotal
      { wch: 8 },  // % IVA
      { wch: 14 }, // Valor IVA
      { wch: 14 }, // ReteFuente
      { wch: 14 }, // ReteICA
      { wch: 14 }, // ReteIVA
      { wch: 14 }, // Total
      { wch: 45 }, // CUFE
    ];
  }

  XLSX.utils.book_append_sheet(wb, ws, "Siigo_Compras");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
