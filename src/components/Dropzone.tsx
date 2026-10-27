"use client";

import { useCallback, useEffect, useId, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { FileText, Image as ImageIcon, Lock, ArrowUpCircle, Loader2 } from "lucide-react";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, isAllowedMimeType } from "@/types/invoice";

interface DropzoneProps {
  onFileAccepted: (file: File) => void;
  onReject: (message: string) => void;
  isProcessing: boolean;
  processingFileName?: string;
}

const PROCESSING_STEPS = [
  "Cargando documento en memoria protegida…",
  "Extrayendo estructura visual con Gemini 2.5 Flash…",
  "Identificando emisor, NIT y resolución DIAN…",
  "Leyendo prefijo, consecutivo y fecha…",
  "Conciliando base gravable, IVA y retenciones…",
  "Calculando balance y verificación contable…",
] as const;

const ACCEPT_ATTR = ALLOWED_MIME_TYPES.join(",");

export default function Dropzone({
  onFileAccepted,
  onReject,
  isProcessing,
  processingFileName,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const dragCounter = useRef(0);
  const inputId = useId();

  useEffect(() => {
    if (!isProcessing) return;
    const interval = window.setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, PROCESSING_STEPS.length - 1));
    }, 1700);
    return () => {
      window.clearInterval(interval);
      setStepIndex(0);
    };
  }, [isProcessing]);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!isAllowedMimeType(file.type)) {
        onReject(`"${file.name}" no es un formato soportado. Formatos admitidos: PDF, JPG, PNG o WEBP.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        onReject(`"${file.name}" supera el límite de ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`);
        return;
      }
      onFileAccepted(file);
    },
    [onFileAccepted, onReject],
  );

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isProcessing) return;
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    if (isProcessing) return;
    const files = e.dataTransfer.files;
    if (files.length > 1) {
      onReject("Procesa un documento a la vez. Se seleccionó el primer archivo.");
    }
    handleFile(files[0]);
  };

  const openPicker = () => {
    if (!isProcessing) inputRef.current?.click();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  };

  if (isProcessing) {
    return (
      <div
        id="dropzone-processing"
        aria-live="polite"
        aria-busy="true"
        className="apple-card motion-asentar relative overflow-hidden px-6 py-12 text-center"
      >
        {/* Shimmer con GPU Transform (no background-position) */}
        <div className="shimmer-track absolute inset-0 pointer-events-none opacity-40">
          <div className="shimmer-bar" />
        </div>

        <div className="relative mx-auto flex max-w-sm flex-col items-center">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--accent)] shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin" strokeWidth={2} />
          </div>

          <h3 className="text-base font-semibold text-[var(--text)] tracking-tight">
            Asentando documento
          </h3>

          {processingFileName && (
            <p className="mt-1 truncate max-w-xs text-xs text-[var(--text-muted)] mono-num">
              {processingFileName}
            </p>
          )}

          {/* Barra de progreso Apple */}
          <div className="mt-6 h-1 w-52 overflow-hidden rounded-full bg-[var(--surface-sunken)] border border-[var(--border-subtle)]">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-500 ease-out"
              style={{ width: `${((stepIndex + 1) / PROCESSING_STEPS.length) * 100}%` }}
            />
          </div>

          <p key={stepIndex} className="motion-asentar mt-3 text-xs font-medium text-[var(--accent)]">
            {PROCESSING_STEPS[stepIndex]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="dropzone"
      role="button"
      tabIndex={0}
      aria-label="Zona de carga: arrastra una factura o presiona Enter para seleccionar un archivo"
      onClick={openPicker}
      onKeyDown={onKeyDown}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`group apple-card relative cursor-pointer px-6 py-12 text-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
        isDragging
          ? "border-[var(--accent)] bg-[var(--accent-subtle)] scale-[1.005]"
          : "hover:border-[var(--border-hover)] hover:bg-[var(--surface-raised)]"
      }`}
    >
      <div className="mx-auto flex max-w-md flex-col items-center">
        {/* Ícono de carga estilo Apple SF Symbol */}
        <div
          className={`mb-4 grid h-12 w-12 place-items-center rounded-full border transition-transform duration-150 ${
            isDragging
              ? "border-[var(--accent)] bg-[var(--accent)] text-white scale-105"
              : "border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--text-secondary)] group-hover:text-[var(--accent)] group-hover:scale-102"
          }`}
        >
          <ArrowUpCircle className="h-6 w-6" strokeWidth={1.75} />
        </div>

        <p className="text-base font-semibold text-[var(--text)] tracking-tight">
          {isDragging ? "Suelta el comprobante aquí" : "Arrastra tu factura o recibo"}
        </p>

        <p className="mt-1 text-xs text-[var(--text-muted)]">
          o haz clic para explorar en el equipo
        </p>

        {/* Formatos admitidos en pills minimalistas */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 text-[0.6875rem] text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-2.5 py-0.5">
            <FileText className="h-3 w-3 text-[var(--text-secondary)]" strokeWidth={1.5} /> PDF
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-2.5 py-0.5">
            <ImageIcon className="h-3 w-3 text-[var(--text-secondary)]" strokeWidth={1.5} /> JPG · PNG · WEBP
          </span>
          <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-2.5 py-0.5 mono-num">
            Hasta {MAX_FILE_SIZE_BYTES / 1024 / 1024} MB
          </span>
        </div>

        {/* Garantía de privacidad legal */}
        <p className="mt-5 inline-flex items-center gap-1 text-[0.6875rem] text-[var(--text-muted)]">
          <Lock className="h-3 w-3 text-[var(--text-tertiary)]" strokeWidth={1.5} />
          Procesamiento volátil en memoria. Sin retención de comprobantes.
        </p>
      </div>

      <label htmlFor={inputId} className="sr-only">
        Seleccionar archivo
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
