import { AlertCircle, AlertTriangle, KeyRound, X } from "lucide-react";
import type { ReactNode } from "react";

export type AlertVariant = "error" | "warning" | "config";

interface AlertProps {
  variant?: AlertVariant;
  title: string;
  children?: ReactNode;
  onDismiss?: () => void;
  id?: string;
}

const STYLES: Record<
  AlertVariant,
  {
    wrap: string;
    iconColor: string;
    Icon: typeof AlertCircle;
  }
> = {
  error: {
    wrap: "border-[var(--negative-border)] bg-[var(--negative-surface)] text-[var(--negative-text)]",
    iconColor: "text-[var(--negative)]",
    Icon: AlertCircle,
  },
  warning: {
    wrap: "border-[var(--warning-border)] bg-[var(--warning-surface)] text-[var(--warning-text)]",
    iconColor: "text-[var(--warning)]",
    Icon: AlertTriangle,
  },
  config: {
    wrap: "border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--text)]",
    iconColor: "text-[var(--accent)]",
    Icon: KeyRound,
  },
};

export default function Alert({ variant = "error", title, children, onDismiss, id }: AlertProps) {
  const { wrap, iconColor, Icon } = STYLES[variant];

  return (
    <aside
      id={id}
      role="alert"
      className={`motion-asentar flex items-start gap-3 rounded-[var(--radius-md)] border p-3.5 sm:p-4 ${wrap}`}
    >
      <Icon className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${iconColor}`} strokeWidth={1.75} />
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-semibold tracking-tight text-[var(--text)]">
          {title}
        </p>
        {children && (
          <div className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
            {children}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar notificación"
          className="min-h-[32px] min-w-[32px] inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-active)] transition-colors"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      )}
    </aside>
  );
}
