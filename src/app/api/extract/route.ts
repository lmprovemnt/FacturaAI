import { ApiError, GoogleGenAI } from "@google/genai";
import {
  EXTRACTION_SYSTEM_PROMPT,
  invoiceResponseSchema,
  normalizeInvoice,
} from "@/lib/invoice-schema";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  isAllowedMimeType,
  type ExtractErrorCode,
  type ExtractErrorResponse,
  type ExtractSuccessResponse,
} from "@/types/invoice";

/** Tiempo máximo de ejecución (s) en plataformas serverless. */
export const maxDuration = 60;

const MODEL = "gemini-2.5-flash";

function errorResponse(status: number, code: ExtractErrorCode, message: string): Response {
  const body: ExtractErrorResponse = { ok: false, error: { code, message } };
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request): Promise<Response> {
  const startedAt = Date.now();

  // 1. Configuración
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return errorResponse(
      500,
      "MISSING_API_KEY",
      "El servidor no tiene configurada la variable GEMINI_API_KEY. Agrégala en .env.local y reinicia el servidor.",
    );
  }

  // 2. Lectura del multipart/form-data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(400, "NO_FILE", "La petición debe ser multipart/form-data con un campo 'file'.");
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return errorResponse(400, "NO_FILE", "No se recibió ningún archivo válido en el campo 'file'.");
  }

  // 3. Validaciones
  if (!isAllowedMimeType(file.type)) {
    return errorResponse(
      400,
      "UNSUPPORTED_TYPE",
      `Tipo de archivo no soportado (${file.type || "desconocido"}). Formatos permitidos: ${ALLOWED_MIME_TYPES.join(", ")}.`,
    );
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return errorResponse(
      400,
      "FILE_TOO_LARGE",
      `El archivo supera el límite de ${Math.round(MAX_FILE_SIZE_BYTES / 1024 / 1024)} MB.`,
    );
  }

  // 4. Conversión en memoria (nunca se persiste en disco – Ley 1581 de 2012)
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Data = buffer.toString("base64");

  // 5. Extracción con Gemini + Structured Outputs
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: file.type, data: base64Data } },
            {
              text: "Extrae los datos contables de este documento siguiendo estrictamente el esquema JSON.",
            },
          ],
        },
      ],
      config: {
        systemInstruction: EXTRACTION_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: invoiceResponseSchema,
        temperature: 0,
      },
    });

    const text = response.text;
    if (!text) {
      return errorResponse(
        500,
        "EMPTY_RESPONSE",
        "El modelo no devolvió contenido. Verifica que el documento sea legible e inténtalo de nuevo.",
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return errorResponse(500, "INVALID_RESPONSE", "La respuesta del modelo no es un JSON válido.");
    }

    const body: ExtractSuccessResponse = {
      ok: true,
      data: normalizeInvoice(parsed),
      meta: {
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        model: MODEL,
        processingMs: Date.now() - startedAt,
      },
    };
    return Response.json(body, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      if (err.status === 400 && /api key/i.test(err.message)) {
        return errorResponse(401, "INVALID_API_KEY", "La GEMINI_API_KEY configurada no es válida.");
      }
      if (err.status === 401 || err.status === 403) {
        return errorResponse(401, "INVALID_API_KEY", "La GEMINI_API_KEY no es válida o no tiene permisos.");
      }
      if (err.status === 429) {
        return errorResponse(429, "RATE_LIMITED", "Se alcanzó el límite de uso de la API. Intenta en unos segundos.");
      }
      if (err.status >= 400 && err.status < 500) {
        return errorResponse(400, "AI_ERROR", "El documento no pudo ser procesado por el modelo de IA.");
      }
      console.error("[extract] Gemini API error:", err.status, err.message);
      return errorResponse(502, "AI_ERROR", "El servicio de IA no está disponible temporalmente.");
    }
    console.error("[extract] Unexpected error:", err);
    return errorResponse(500, "INTERNAL_ERROR", "Error inesperado al procesar el documento.");
  } finally {
    // Liberar referencias del contenido en memoria lo antes posible
    buffer.fill(0);
  }
}
