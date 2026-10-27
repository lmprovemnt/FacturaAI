"use client";

import { Clock, Cpu, FileText, HardDrive } from "lucide-react";
import type { ExtractSuccessResponse } from "@/types/invoice";

interface DocumentPreviewProps {
  file: File;
  previewUrl: string;
  meta: ExtractSuccessResponse["meta"];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Inspector macOS: Vista previa local del documento (Object URL en memoria)
 * con ficha de telemetría de procesamiento en hairline grid.
 */
export default function DocumentPreview({ file, previewUrl, meta }: DocumentPreviewProps) {
  const isPdf = file.type === "application/pdf";

  return (
    <aside
      id="document-preview"
      className="apple-card motion-asentar overflow-hidden"
      aria-label="Inspector de comprobante original"
    >
      {/* Cabecera del Inspector estilo macOS */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-3.5 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="grid h-6 w-6 place-items-center rounded-[var(--radius-sm)] bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)]">
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
          </span>
          <p className="truncate text-xs font-medium text-[var(--text)]" title={file.name}>
            {file.name}
          </p>
        </div>
        <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-[var(--text-muted)] shrink-0">
          Original
        </span>
      </div>

      {/* Visor de comprobante */}
      <div className="relative bg-[var(--bg)] flex items-center justify-center">
        {isPdf ? (
          <iframe
            src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`}
            title={`Vista previa de ${file.name}`}
            className="h-[52vh] w-full lg:h-[calc(100vh-19rem)] border-none"
          />
        ) : (
          <div className="max-h-[52vh] w-full overflow-auto p-2 lg:max-h-[calc(100vh-19rem)] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- blob URL en memoria volátil */}
            <img
              src={previewUrl}
              alt={`Vista previa de ${file.name}`}
              className="max-h-full max-w-full rounded-[var(--radius-sm)] object-contain shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Barra de telemetría: Tamaño / Tiempo / Modelo */}
      <dl className="grid grid-cols-3 divide-x divide-[var(--border-subtle)] border-t border-[var(--border-subtle)] bg-[var(--surface-sunken)] py-2 text-center">
        <div className="px-2">
          <dt className="flex items-center justify-center gap-1 text-[0.625rem] uppercase tracking-wider text-[var(--text-muted)]">
            <HardDrive className="h-2.5 w-2.5" strokeWidth={1.5} /> Peso
          </dt>
          <dd className="mt-0.5 text-xs font-medium mono-num text-[var(--text-secondary)]">
            {formatBytes(meta.sizeBytes)}
          </dd>
        </div>
        <div className="px-2">
          <dt className="flex items-center justify-center gap-1 text-[0.625rem] uppercase tracking-wider text-[var(--text-muted)]">
            <Clock className="h-2.5 w-2.5" strokeWidth={1.5} /> Inferencia
          </dt>
          <dd className="mt-0.5 text-xs font-medium mono-num text-[var(--text-secondary)]">
            {(meta.processingMs / 1000).toFixed(1)} s
          </dd>
        </div>
        <div className="px-2">
          <dt className="flex items-center justify-center gap-1 text-[0.625rem] uppercase tracking-wider text-[var(--text-muted)]">
            <Cpu className="h-2.5 w-2.5" strokeWidth={1.5} /> Motor
          </dt>
          <dd className="mt-0.5 text-xs font-medium mono-num truncate text-[var(--text-secondary)]" title={meta.model}>
            2.5 Flash
          </dd>
        </div>
      </dl>
    </aside>
  );
}
