import { buildConsolidatedExcel } from "@/lib/export/excel-consolidated";
import { buildSiigoPurchasesTemplate } from "@/lib/export/templates/siigo";
import { buildAlegraExpensesTemplate } from "@/lib/export/templates/alegra";
import type { ExportFormat, ExportRequest, StandardInvoiceData } from "@/types/accounting";

export const maxDuration = 60;

const VALID_FORMATS: readonly ExportFormat[] = ["consolidated", "siigo", "alegra"];

export async function POST(request: Request): Promise<Response> {
  let body: Partial<ExportRequest>;
  try {
    body = (await request.json()) as Partial<ExportRequest>;
  } catch {
    return Response.json(
      { error: "La petición debe incluir un cuerpo JSON válido con 'format' e 'invoices'." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const format = body.format;
  if (!format || !VALID_FORMATS.includes(format)) {
    return Response.json(
      {
        error: `Formato de exportación no válido ('${format}'). Formatos admitidos: ${VALID_FORMATS.join(", ")}.`,
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const invoices = body.invoices;
  if (!Array.isArray(invoices) || invoices.length === 0) {
    return Response.json(
      { error: "Se requiere un arreglo 'invoices' con al menos una factura para exportar." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    let excelBuffer: Buffer;

    switch (format) {
      case "consolidated":
        excelBuffer = buildConsolidatedExcel(invoices as StandardInvoiceData[]);
        break;
      case "siigo":
        excelBuffer = buildSiigoPurchasesTemplate(invoices as StandardInvoiceData[]);
        break;
      case "alegra":
        excelBuffer = buildAlegraExpensesTemplate(invoices as StandardInvoiceData[]);
        break;
    }

    const today = new Date().toISOString().slice(0, 10);
    const fileName = `FacturAI_${format}_${today}.xlsx`;

    return new Response(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(excelBuffer.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    console.error("[export-api] Error al generar archivo Excel:", err);
    return Response.json(
      {
        error: err instanceof Error ? err.message : "Error interno durante la generación del archivo Excel.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
