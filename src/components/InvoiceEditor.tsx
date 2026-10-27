"use client";

import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Building2,
  Calculator,
  CheckCircle2,
  FileSpreadsheet,
  ListOrdered,
  Plus,
  ReceiptText,
  RotateCcw,
  Scale,
  Trash2,
} from "lucide-react";
import {
  TIPOS_DOCUMENTO,
  createEmptyItem,
  type Documento,
  type Emisor,
  type InvoiceData,
  type Item,
  type TipoDocumento,
  type Totales,
} from "@/types/invoice";
import { formatMoney, getValidationWarnings, validarNit } from "@/lib/validation";

/* --------------------------------------------------------------------------
   Campos de Formulario estilo Apple
   -------------------------------------------------------------------------- */

interface FieldShellProps {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

function FieldShell({ label, htmlFor, hint, className = "", children }: FieldShellProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-[0.6875rem] font-semibold uppercase tracking-[var(--tracking-caps)] text-[var(--text-muted)]"
      >
        {label}
      </label>
      {children}
      {hint && <div className="mt-1 text-[0.6875rem] leading-none">{hint}</div>}
    </div>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  edited?: boolean;
  type?: "text" | "date" | "tel";
  placeholder?: string;
  hint?: ReactNode;
  className?: string;
}

function TextField({
  id,
  label,
  value,
  onChange,
  edited,
  type = "text",
  placeholder,
  hint,
  className,
}: TextFieldProps) {
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} className={className}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        data-edited={edited ? "true" : "false"}
        onChange={(e) => onChange(e.target.value)}
        className="apple-field"
      />
    </FieldShell>
  );
}

interface NumberInputProps {
  id: string;
  value: number;
  onChange: (v: number) => void;
  edited?: boolean;
  className?: string;
  ariaLabel?: string;
}

/** Input numérico con buffer de edición y formateo contable */
function NumberInput({ id, value, onChange, edited, className = "", ariaLabel }: NumberInputProps) {
  const [draft, setDraft] = useState<string>(String(value));
  const [lastValue, setLastValue] = useState<number>(value);

  if (value !== lastValue) {
    setLastValue(value);
    if (Number(draft) !== value) setDraft(String(value));
  }

  return (
    <input
      id={id}
      type="number"
      inputMode="decimal"
      step="any"
      aria-label={ariaLabel}
      value={draft}
      data-edited={edited ? "true" : "false"}
      onChange={(e) => {
        setDraft(e.target.value);
        const n = Number(e.target.value);
        if (e.target.value !== "" && Number.isFinite(n)) onChange(n);
      }}
      onBlur={() => {
        if (draft === "" || !Number.isFinite(Number(draft))) {
          setDraft("0");
          onChange(0);
        }
      }}
      className={`apple-field mono-num text-right ${className}`}
    />
  );
}

interface MoneyFieldProps extends NumberInputProps {
  label: string;
  currency: string;
  emphasize?: boolean;
}

function MoneyField({ label, currency, emphasize, ...input }: MoneyFieldProps) {
  return (
    <FieldShell
      label={label}
      htmlFor={input.id}
      hint={
        <span className="mono-num text-[var(--text-muted)]">
          {formatMoney(input.value, currency)}
        </span>
      }
    >
      <NumberInput
        {...input}
        className={
          emphasize
            ? "border-[var(--accent)] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)]"
            : ""
        }
      />
    </FieldShell>
  );
}

/* --------------------------------------------------------------------------
   Sección Agrupada estilo Apple Card
   -------------------------------------------------------------------------- */

function SectionCard({
  id,
  icon,
  title,
  subtitle,
  action,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="apple-card p-4 sm:p-5 motion-asentar"
    >
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
            {icon}
          </span>
          <div>
            <h3 id={`${id}-title`} className="text-xs font-semibold tracking-tight text-[var(--text)] uppercase">
              {title}
            </h3>
            {subtitle && <p className="text-[0.6875rem] text-[var(--text-muted)]">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const TIPO_LABELS: Record<TipoDocumento, string> = {
  factura: "Factura electrónica / venta",
  documento_soporte: "Documento soporte en adquisiciones",
  recibo: "Recibo de caja / tiquete POS",
};

/* --------------------------------------------------------------------------
   Editor Principal con Firma de Movimiento: "BALANCE"
   -------------------------------------------------------------------------- */

interface InvoiceEditorProps {
  data: InvoiceData;
  original: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

export default function InvoiceEditor({ data, original, onChange }: InvoiceEditorProps) {
  const { emisor, documento, totales, items } = data;
  const cur = totales.moneda || "COP";

  const setEmisor = <K extends keyof Emisor>(key: K, value: Emisor[K]) =>
    onChange({ ...data, emisor: { ...emisor, [key]: value } });
  const setDocumento = <K extends keyof Documento>(key: K, value: Documento[K]) =>
    onChange({ ...data, documento: { ...documento, [key]: value } });
  const setTotales = <K extends keyof Totales>(key: K, value: Totales[K]) =>
    onChange({ ...data, totales: { ...totales, [key]: value } });

  const setItem = <K extends keyof Item>(index: number, key: K, value: Item[K]) => {
    const next = items.map((it, i) => {
      if (i !== index) return it;
      const updated: Item = { ...it, [key]: value };
      if (key === "cantidad" || key === "valorUnitario") {
        updated.totalItem = round2(updated.cantidad * updated.valorUnitario);
      }
      return updated;
    });
    onChange({ ...data, items: next });
  };

  const addItem = () => onChange({ ...data, items: [...items, createEmptyItem()] });
  const removeItem = (index: number) => onChange({ ...data, items: items.filter((_, i) => i !== index) });

  const recalcTotals = () => {
    const subtotal = round2(items.reduce((a, it) => a + it.totalItem, 0));
    const totalPagar = round2(subtotal + totales.iva - totales.reteFuente - totales.reteIca);
    onChange({ ...data, totales: { ...totales, subtotal, totalPagar } });
  };

  const nitStatus = validarNit(emisor.nit);
  const warnings = getValidationWarnings(data);
  const sumItems = items.reduce((a, it) => a + it.totalItem, 0);

  // Cuadratura contable
  const expectedTotal = totales.subtotal + totales.iva - totales.reteFuente - totales.reteIca;
  const diffBalance = round2(Math.abs(expectedTotal - totales.totalPagar));
  const isBalanced = warnings.length === 0 && (totales.totalPagar === 0 || diffBalance <= 1);

  const nitHint =
    nitStatus.kind === "valid" ? (
      <span className="inline-flex items-center gap-1 text-[var(--positive-text)]">
        <CheckCircle2 className="h-3 w-3" strokeWidth={1.75} /> DV válido
      </span>
    ) : nitStatus.kind === "invalid" ? (
      <span className="inline-flex items-center gap-1 text-[var(--warning-text)]">
        <AlertTriangle className="h-3 w-3" strokeWidth={1.75} /> DV esperado: {nitStatus.expected}
      </span>
    ) : nitStatus.kind === "no-dv" && nitStatus.expected !== null ? (
      <span className="text-[var(--text-muted)]">Sin DV (calculado: {nitStatus.expected})</span>
    ) : null;

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------------------
          FIRMA DE MOVIMIENTO: INDICADOR DE BALANCE CONTABLE (Balanza)
          Micro-inclinación rotacional ante descuadre, se nivela a 0° al cuadrar
          ------------------------------------------------------------------ */}
      <div
        id="validation-summary"
        className={`apple-card motion-asentar border transition-all duration-300 p-4 ${
          isBalanced
            ? "border-[var(--positive-border)] bg-[var(--positive-surface)]"
            : "border-[var(--warning-border)] bg-[var(--warning-surface)]"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Balanza con animación reactiva motion-balance-scale */}
            <div
              className="motion-balance-scale grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] border"
              data-status={isBalanced ? "balanced" : "unbalanced"}
              style={{
                backgroundColor: isBalanced ? "rgba(48, 209, 88, 0.15)" : "rgba(255, 159, 10, 0.15)",
                borderColor: isBalanced ? "var(--positive-border)" : "var(--warning-border)",
                color: isBalanced ? "var(--positive-text)" : "var(--warning-text)",
              }}
            >
              {isBalanced ? (
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path className="svg-check-draw" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <Scale className="h-4 w-4" strokeWidth={1.75} />
              )}
            </div>

            <div>
              <p
                className={`text-xs sm:text-sm font-semibold tracking-tight ${
                  isBalanced ? "text-[var(--positive-text)]" : "text-[var(--warning-text)]"
                }`}
              >
                {isBalanced ? "Balance contable cuadrado" : "Descuadre o inconsistencia detectada"}
              </p>
              <p className="text-[0.6875rem] text-[var(--text-muted)] mt-0.5">
                {isBalanced
                  ? "Base gravable, impuestos y retenciones conciliados conforme a normativa DIAN."
                  : `${warnings.length} ${warnings.length === 1 ? "observación" : "observaciones"} pendientes de verificación.`}
              </p>
            </div>
          </div>

          <span
            className="mono-num text-[0.6875rem] font-medium px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-[var(--text-secondary)] shrink-0"
          >
            {isBalanced ? "Δ = $ 0.00" : `Δ = ${formatMoney(diffBalance, cur)}`}
          </span>
        </div>

        {/* Lista de advertencias si las hay */}
        {!isBalanced && warnings.length > 0 && (
          <ul className="mt-3 border-t border-[var(--border-subtle)] pt-2.5 space-y-1 text-xs text-[var(--warning-text)]">
            {warnings.map((w) => (
              <li key={w.id} className="flex items-start gap-1.5">
                <span className="opacity-60">•</span>
                <span>{w.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Grid de Secciones: Emisor y Documento */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sección Emisor */}
        <SectionCard
          id="section-emisor"
          icon={<Building2 className="h-3.5 w-3.5" strokeWidth={1.5} />}
          title="Emisor / Proveedor"
          subtitle="Identificación tributaria DIAN"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              id="emisor-razon-social"
              label="Razón social"
              className="sm:col-span-2"
              value={emisor.razonSocial}
              edited={emisor.razonSocial !== original.emisor.razonSocial}
              onChange={(v) => setEmisor("razonSocial", v)}
            />
            <TextField
              id="emisor-nit"
              label="NIT con DV"
              placeholder="900123456-7"
              value={emisor.nit}
              edited={emisor.nit !== original.emisor.nit}
              onChange={(v) => setEmisor("nit", v)}
              hint={nitHint}
            />
            <TextField
              id="emisor-telefono"
              label="Teléfono"
              type="tel"
              value={emisor.telefono}
              edited={emisor.telefono !== original.emisor.telefono}
              onChange={(v) => setEmisor("telefono", v)}
            />
            <TextField
              id="emisor-direccion"
              label="Dirección fiscal"
              className="sm:col-span-2"
              value={emisor.direccion}
              edited={emisor.direccion !== original.emisor.direccion}
              onChange={(v) => setEmisor("direccion", v)}
            />
          </div>
        </SectionCard>

        {/* Sección Documento */}
        <SectionCard
          id="section-documento"
          icon={<ReceiptText className="h-3.5 w-3.5" strokeWidth={1.5} />}
          title="Documento Contable"
          subtitle="Resolución y numeración"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldShell label="Tipo de comprobante" htmlFor="documento-tipo" className="sm:col-span-2">
              <select
                id="documento-tipo"
                value={documento.tipoDocumento}
                data-edited={documento.tipoDocumento !== original.documento.tipoDocumento ? "true" : "false"}
                onChange={(e) => setDocumento("tipoDocumento", e.target.value as TipoDocumento)}
                className="apple-field cursor-pointer"
              >
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t} value={t} className="bg-[var(--surface-opaque)] text-[var(--text)]">
                    {TIPO_LABELS[t]}
                  </option>
                ))}
              </select>
            </FieldShell>
            <TextField
              id="documento-prefijo"
              label="Prefijo"
              placeholder="FE"
              value={documento.prefijo}
              edited={documento.prefijo !== original.documento.prefijo}
              onChange={(v) => setDocumento("prefijo", v)}
            />
            <TextField
              id="documento-consecutivo"
              label="Consecutivo"
              value={documento.consecutivo}
              edited={documento.consecutivo !== original.documento.consecutivo}
              onChange={(v) => setDocumento("consecutivo", v)}
            />
            <TextField
              id="documento-fecha"
              label="Fecha de emisión"
              type="date"
              className="sm:col-span-2"
              value={documento.fechaEmision}
              edited={documento.fechaEmision !== original.documento.fechaEmision}
              onChange={(v) => setDocumento("fechaEmision", v)}
            />
          </div>
        </SectionCard>
      </div>

      {/* Sección Totales e Impuestos */}
      <SectionCard
        id="section-totales"
        icon={<Calculator className="h-3.5 w-3.5" strokeWidth={1.5} />}
        title="Totales, Impuestos y Retenciones"
        subtitle="Conciliación de base, IVA, ReteFuente y ReteICA"
        action={
          <button
            id="btn-recalcular-totales"
            type="button"
            onClick={recalcTotals}
            className="apple-btn-tint"
            title="Recalcular automáticamente: Subtotal = Σ ítems; Total = Subtotal + IVA − retenciones"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={1.75} />
            <span>Recalcular</span>
          </button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <FieldShell label="Moneda" htmlFor="totales-moneda">
            <input
              id="totales-moneda"
              value={totales.moneda}
              maxLength={3}
              data-edited={totales.moneda !== original.totales.moneda ? "true" : "false"}
              onChange={(e) => setTotales("moneda", e.target.value.toUpperCase())}
              className="apple-field uppercase mono-num text-center"
            />
          </FieldShell>
          {(
            [
              ["subtotal", "Subtotal (Base)"],
              ["iva", "IVA"],
              ["reteFuente", "ReteFuente"],
              ["reteIca", "ReteICA"],
              ["totalPagar", "Total a Pagar"],
            ] as const
          ).map(([key, label]) => (
            <MoneyField
              key={key}
              id={`totales-${key}`}
              label={label}
              currency={cur}
              value={totales[key]}
              emphasize={key === "totalPagar"}
              edited={totales[key] !== original.totales[key]}
              onChange={(v) => setTotales(key, v)}
            />
          ))}
        </div>
      </SectionCard>

      {/* Sección Detalle de Ítems (Tabla Compacta Contable) */}
      <SectionCard
        id="section-items"
        icon={<ListOrdered className="h-3.5 w-3.5" strokeWidth={1.5} />}
        title="Partidas y Detalle de Ítems"
        subtitle={`${items.length} ${items.length === 1 ? "línea" : "líneas"} · Σ ${formatMoney(sumItems, cur)}`}
        action={
          <button
            id="btn-agregar-item"
            type="button"
            onClick={addItem}
            className="apple-btn-tint"
          >
            <Plus className="h-3 w-3" strokeWidth={1.75} />
            <span>Añadir línea</span>
          </button>
        }
      >
        {items.length === 0 ? (
          <div className="rounded-[var(--radius-sm)] border border-dashed border-[var(--border)] p-8 text-center text-xs text-[var(--text-muted)]">
            <FileSpreadsheet className="mx-auto mb-2 h-6 w-6 text-[var(--text-tertiary)]" strokeWidth={1.5} />
            No se detectaron partidas. Puedes agregar una línea manual.
          </div>
        ) : (
          <div className="-mx-4 sm:-mx-5 overflow-x-auto">
            <table className="accounting-table min-w-[680px]">
              <thead>
                <tr>
                  <th className="w-10 text-center">#</th>
                  <th className="text-left">Descripción del Producto / Servicio</th>
                  <th className="w-24 text-right">Cantidad</th>
                  <th className="w-36 text-right">Valor Unitario</th>
                  <th className="w-36 text-right">Total Partida</th>
                  <th className="w-12 text-center">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const orig = original.items[idx];
                  return (
                    <tr key={idx} className="group">
                      <td className="text-center text-[0.6875rem] mono-num text-[var(--text-muted)]">
                        {idx + 1}
                      </td>
                      <td>
                        <input
                          id={`item-${idx}-descripcion`}
                          aria-label={`Descripción de línea ${idx + 1}`}
                          value={it.descripcion}
                          data-edited={!orig || orig.descripcion !== it.descripcion ? "true" : "false"}
                          onChange={(e) => setItem(idx, "descripcion", e.target.value)}
                          className="apple-field !h-7 !py-1 text-xs"
                        />
                      </td>
                      <td>
                        <NumberInput
                          id={`item-${idx}-cantidad`}
                          ariaLabel={`Cantidad de línea ${idx + 1}`}
                          value={it.cantidad}
                          edited={!orig || orig.cantidad !== it.cantidad}
                          onChange={(v) => setItem(idx, "cantidad", v)}
                          className="!h-7 !py-1 text-xs"
                        />
                      </td>
                      <td>
                        <NumberInput
                          id={`item-${idx}-valor-unitario`}
                          ariaLabel={`Valor unitario de línea ${idx + 1}`}
                          value={it.valorUnitario}
                          edited={!orig || orig.valorUnitario !== it.valorUnitario}
                          onChange={(v) => setItem(idx, "valorUnitario", v)}
                          className="!h-7 !py-1 text-xs"
                        />
                      </td>
                      <td>
                        <NumberInput
                          id={`item-${idx}-total`}
                          ariaLabel={`Total de partida ${idx + 1}`}
                          value={it.totalItem}
                          edited={!orig || orig.totalItem !== it.totalItem}
                          onChange={(v) => setItem(idx, "totalItem", v)}
                          className="!h-7 !py-1 text-xs font-semibold"
                        />
                      </td>
                      <td className="text-center">
                        <button
                          id={`btn-eliminar-item-${idx}`}
                          type="button"
                          onClick={() => removeItem(idx)}
                          aria-label={`Eliminar línea ${idx + 1}`}
                          className="min-h-[28px] min-w-[28px] inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--negative)] hover:bg-[var(--negative-surface)] transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
