import * as XLSX from "xlsx";
import type { StandardInvoiceData } from "@/types/accounting";

function addDays(dateStr: string, days: number): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  } catch {
    return dateStr;
  }
}

/**
 * Genera la plantilla de importación de Facturas de Proveedores y Gastos
 * para el sistema contable Alegra en formato Excel (.xlsx).
 */
export function buildAlegraExpensesTemplate(invoices: StandardInvoiceData[]): Buffer {
  const wb = XLSX.utils.book_new();

  const rows: Record<string, unknown>[] = [];

  invoices.forEach((inv) => {
    const proveedor = inv.emisor.razonSocial;
    const nitCompleto = inv.emisor.digitoVerificacion
      ? `${inv.emisor.nit}-${inv.emisor.digitoVerificacion}`
      : inv.emisor.nit;
    const numFactura = [inv.prefijo, inv.consecutivo].filter(Boolean).join("-") || "1";
    const fecha = inv.fechaEmision;
    const vencimiento = addDays(fecha, 30); // 30 días estándar para compras a crédito
    const cufe = inv.cufe;

    let nombreImpuesto = "Ninguno (0%)";
    if (inv.impuestos.iva19 > 0) {
      nombreImpuesto = "IVA 19%";
    } else if (inv.impuestos.iva5 > 0) {
      nombreImpuesto = "IVA 5%";
    }

    if (inv.items.length === 0) {
      rows.push({
        "Proveedor": proveedor,
        "NIT Proveedor": nitCompleto,
        "Número de Factura": numFactura,
        "Fecha": fecha,
        "Fecha de Vencimiento": vencimiento,
        "Ítem": "Gasto General",
        "Descripción": `Compra/Gasto ${numFactura} de ${proveedor}`,
        "Precio": inv.subtotal,
        "Cantidad": 1,
        "Descuento": 0,
        "Impuesto": nombreImpuesto,
        "Valor Impuesto": inv.impuestos.iva19 + inv.impuestos.iva5,
        "ReteFuente": inv.impuestos.reteFuente,
        "ReteICA": inv.impuestos.reteIca,
        "Total": inv.totalPagar,
        "Observaciones / CUFE": cufe,
      });
    } else {
      inv.items.forEach((item, idx) => {
        const isFirst = idx === 0;
        rows.push({
          "Proveedor": proveedor,
          "NIT Proveedor": nitCompleto,
          "Número de Factura": numFactura,
          "Fecha": fecha,
          "Fecha de Vencimiento": vencimiento,
          "Ítem": item.codigo || item.descripcion.slice(0, 30),
          "Descripción": item.descripcion,
          "Precio": item.valorUnitario,
          "Cantidad": item.cantidad,
          "Descuento": 0,
          "Impuesto": nombreImpuesto,
          "Valor Impuesto": isFirst ? inv.impuestos.iva19 + inv.impuestos.iva5 : 0,
          "ReteFuente": isFirst ? inv.impuestos.reteFuente : 0,
          "ReteICA": isFirst ? inv.impuestos.reteIca : 0,
          "Total": isFirst ? inv.totalPagar : item.totalItem,
          "Observaciones / CUFE": isFirst ? cufe : "",
        });
      });
    }
  });

  const ws = XLSX.utils.json_to_sheet(
    rows.length > 0 ? rows : [{ "Mensaje": "Sin datos para Alegra" }]
  );

  if (rows.length > 0) {
    ws["!cols"] = [
      { wch: 30 }, // Proveedor
      { wch: 16 }, // NIT Proveedor
      { wch: 18 }, // Número de Factura
      { wch: 14 }, // Fecha
      { wch: 14 }, // Vencimiento
      { wch: 20 }, // Ítem
      { wch: 35 }, // Descripción
      { wch: 14 }, // Precio
      { wch: 10 }, // Cantidad
      { wch: 10 }, // Descuento
      { wch: 14 }, // Impuesto
      { wch: 14 }, // Valor Impuesto
      { wch: 14 }, // ReteFuente
      { wch: 14 }, // ReteICA
      { wch: 14 }, // Total
      { wch: 45 }, // Observaciones / CUFE
    ];
  }

  XLSX.utils.book_append_sheet(wb, ws, "Alegra_Gastos");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
