import { processBatchFiles } from "@/lib/batch/processor";
import type { BatchProcessingResponse, FileItem } from "@/types/accounting";

export const maxDuration = 120; // 2 minutos para procesamiento de lotes en serverless

export async function POST(request: Request): Promise<Response> {
  const startedAt = Date.now();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      {
        total: 0,
        successful: 0,
        failed: 0,
        results: [],
        processingTimeMs: Date.now() - startedAt,
        error: "La petición debe ser multipart/form-data con al menos un archivo en 'files' o 'file'.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Recolectar todos los archivos enviados en 'files' o 'file' o cualquier campo
  const rawFiles: File[] = [];
  for (const [, value] of formData.entries()) {
    if (value instanceof File && value.size > 0) {
      rawFiles.push(value);
    }
  }

  if (rawFiles.length === 0) {
    return Response.json(
      {
        total: 0,
        successful: 0,
        failed: 0,
        results: [],
        processingTimeMs: Date.now() - startedAt,
        error: "No se recibieron archivos válidos para procesar.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Convertir a FileItem en memoria volátil (Buffers)
  const fileItems: FileItem[] = [];
  for (const f of rawFiles) {
    const arrayBuffer = await f.arrayBuffer();
    fileItems.push({
      name: f.name,
      buffer: Buffer.from(arrayBuffer),
      mimeType: f.type || "application/octet-stream",
      sizeBytes: f.size,
    });
  }

  try {
    const batchResponse: BatchProcessingResponse = await processBatchFiles(fileItems);
    return Response.json(batchResponse, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: unknown) {
    console.error("[batch-extract] Error inesperado en el procesador de lotes:", err);
    return Response.json(
      {
        total: fileItems.length,
        successful: 0,
        failed: fileItems.length,
        results: [],
        processingTimeMs: Date.now() - startedAt,
        error: err instanceof Error ? err.message : "Error interno durante el procesamiento del lote.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
