import JSZip from "jszip";
import pLimit from "p-limit";
import type {
  BatchProcessingResponse,
  ExtractionResult,
  FileItem,
} from "@/types/accounting";
import { parseUBL21 } from "@/lib/parsers/ubl-parser";
import { extractFromBufferAI } from "@/lib/parsers/ai-extractor";

const BATCH_CONCURRENCY = 4;

const MIME_MAP: Record<string, string> = {
  xml: "application/xml",
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  zip: "application/zip",
};

export function inferMimeType(fileName: string, fallbackMime = ""): string {
  if (fallbackMime && fallbackMime !== "application/octet-stream") {
    return fallbackMime;
  }
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return MIME_MAP[ext] || "application/octet-stream";
}

export function isZipFile(file: FileItem): boolean {
  const mime = file.mimeType.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".zip") ||
    mime === "application/zip" ||
    mime === "application/x-zip-compressed" ||
    mime === "application/x-zip"
  );
}

/**
 * Descomprime de forma recursiva en memoria los archivos ZIP contenidos en el lote,
 * descartando carpetas y archivos de metadatos del sistema (__MACOSX, .DS_Store).
 */
export async function unpackZipInMemory(file: FileItem): Promise<FileItem[]> {
  const zip = new JSZip();
  let loadedZip: JSZip;
  try {
    loadedZip = await zip.loadAsync(file.buffer);
  } catch (err: unknown) {
    throw new Error(
      `El archivo ZIP '${file.name}' está corrupto o no pudo descomprimirse: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const extracted: FileItem[] = [];

  for (const relativePath of Object.keys(loadedZip.files)) {
    const entry = loadedZip.files[relativePath];
    if (!entry || entry.dir) continue;

    // Filtrar metadatos de sistemas operativos
    const baseName = relativePath.split("/").pop() ?? relativePath;
    if (
      baseName.startsWith(".") ||
      relativePath.includes("__MACOSX") ||
      baseName.toLowerCase() === "thumbs.db"
    ) {
      continue;
    }

    const buffer = await entry.async("nodebuffer");
    const mimeType = inferMimeType(baseName);

    const subItem: FileItem = {
      name: baseName,
      buffer,
      mimeType,
      sizeBytes: buffer.byteLength,
    };

    // Soporte para archivos ZIP anidados
    if (isZipFile(subItem)) {
      const nested = await unpackZipInMemory(subItem);
      extracted.push(...nested);
    } else {
      extracted.push(subItem);
    }
  }

  return extracted;
}

/**
 * Procesa un archivo individual según su tipo:
 * - XML UBL 2.1: Enrutado al parser nativo (costo 0 tokens, instantáneo).
 * - PDF / JPG / PNG / WEBP: Enrutado al pipeline multimodal con Gemini 2.5 Flash.
 */
async function processSingleFile(file: FileItem): Promise<ExtractionResult> {
  const startTime = Date.now();
  const lowerName = file.name.toLowerCase();
  const mime = inferMimeType(file.name, file.mimeType).toLowerCase();

  // 1. Enrutamiento directo a Parser Nativo XML UBL 2.1
  if (lowerName.endsWith(".xml") || mime === "application/xml" || mime === "text/xml") {
    try {
      const xmlString = file.buffer.toString("utf-8");
      const data = parseUBL21(xmlString);
      return {
        success: true,
        fileName: file.name,
        source: "xml_ubl",
        data,
        processingTimeMs: Date.now() - startTime,
      };
    } catch (err: unknown) {
      return {
        success: false,
        fileName: file.name,
        source: "xml_ubl",
        error: err instanceof Error ? err.message : "Error desconocido al parsear UBL 2.1",
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  // 2. Enrutamiento a Pipeline Multimodal de IA
  const isImageOrPdf =
    lowerName.endsWith(".pdf") ||
    lowerName.endsWith(".png") ||
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg") ||
    lowerName.endsWith(".webp") ||
    mime.startsWith("image/") ||
    mime === "application/pdf";

  if (isImageOrPdf) {
    try {
      const data = await extractFromBufferAI(file.buffer, mime);
      return {
        success: true,
        fileName: file.name,
        source: "ai_gemini",
        data,
        processingTimeMs: Date.now() - startTime,
      };
    } catch (err: unknown) {
      return {
        success: false,
        fileName: file.name,
        source: "ai_gemini",
        error: err instanceof Error ? err.message : "Error durante la extracción multimodal con IA",
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  // 3. Formato no compatible
  return {
    success: false,
    fileName: file.name,
    source: "xml_ubl",
    error: `Formato de archivo no admitido (${mime || "desconocido"}). Use XML UBL 2.1, PDF, JPG, PNG, WEBP o ZIP.`,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Orquestador principal de procesamiento por lotes con concurrencia controlada
 * y descompresión de contenedores ZIP en memoria.
 */
export async function processBatchFiles(files: FileItem[]): Promise<BatchProcessingResponse> {
  const batchStart = Date.now();

  // 1. Expandir todos los contenedores ZIP en memoria
  const queue: FileItem[] = [];
  for (const f of files) {
    if (isZipFile(f)) {
      try {
        const unzipped = await unpackZipInMemory(f);
        queue.push(...unzipped);
      } catch {
        // Si el ZIP mismo falla al descomprimirse, registrar el error como ítem del lote
        queue.push({
          name: f.name,
          buffer: Buffer.alloc(0),
          mimeType: "corrupt_zip",
          sizeBytes: 0,
        });
      }
    } else {
      queue.push(f);
    }
  }

  // 2. Ejecución concurrente con p-limit
  const limit = pLimit(BATCH_CONCURRENCY);
  const tasks = queue.map((file) =>
    limit(async () => {
      if (file.mimeType === "corrupt_zip") {
        return {
          success: false,
          fileName: file.name,
          source: "xml_ubl" as const,
          error: "El archivo ZIP no pudo ser descomprimido o está corrupto.",
          processingTimeMs: 0,
        };
      }
      return processSingleFile(file);
    })
  );

  const results = await Promise.all(tasks);

  const successful = results.filter((r) => r.success).length;
  const failed = results.length - successful;

  return {
    total: results.length,
    successful,
    failed,
    results,
    processingTimeMs: Date.now() - batchStart,
  };
}
