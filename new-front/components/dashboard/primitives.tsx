import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useT } from "@/lib/use-t"

/**
 * Dashboard building blocks. They reuse the exact type scale, radii and accent of the public
 * pages (components/lunna/*) so the dashboard reads as the same product:
 * eyebrow 11px/2px tracking, titles 26px bold, body 13–15px muted, cards 14px radius, one purple accent.
 */

export const ACCENT = "#7c3aed"

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        {eyebrow && (
          <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#7c3aed]">{eyebrow}</span>
        )}
        <h1 className="text-balance text-[26px] font-bold leading-tight tracking-[-0.5px] text-foreground">{title}</h1>
        {description && (
          <p className="max-w-[560px] text-[14px] leading-[1.7] text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

export function Section({
  title,
  description,
  icon,
  action,
  children,
  className,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-[14px] border border-border bg-card p-6", className)}>
      {(title || action) && (
        <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children ? "mb-5" : "")}>
          <div className="flex gap-3">
            {icon && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-secondary text-foreground [&_svg]:h-[18px] [&_svg]:w-[18px]">
                {icon}
              </div>
            )}
            <div className="flex flex-col gap-1">
              {title && <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>}
              {description && <p className="text-[13px] leading-[1.6] text-muted-foreground">{description}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: React.ReactNode
  hint?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-[13px] font-medium text-foreground">{label}</span>
      {children}
      {hint && <span className="text-[12px] leading-[1.5] text-muted-foreground">{hint}</span>}
    </label>
  )
}

type PrimaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }

/** The single purple action used across the site ("Adicionar ao Discord"). */
export function PrimaryButton({ loading, children, className, disabled, ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-[#7c3aed] px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

/** Secondary action, same as "Ver comandos" on the home page. */
export function SecondaryButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  )
}

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "accent" | "success" }) {
  const tones = {
    neutral: "border-border bg-secondary text-muted-foreground",
    accent: "border-[#7c3aed]/30 bg-[#7c3aed]/10 text-[#a78bfa]",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  }
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", tones[tone])}>
      {children}
    </span>
  )
}

export function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-56 animate-pulse rounded-md bg-secondary" />
      <div className="h-4 w-80 animate-pulse rounded-md bg-secondary" />
      <div className="h-40 animate-pulse rounded-[14px] bg-card" />
      <div className="h-40 animate-pulse rounded-[14px] bg-card" />
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const t = useT()
  return (
    <div className="rounded-[14px] border border-border bg-card p-8 text-center">
      <p className="text-[15px] font-semibold text-foreground">{t("Não foi possível carregar", "Couldn't load")}</p>
      <p className="mx-auto mt-1 max-w-md text-[13px] text-muted-foreground">{message}</p>
      {onRetry && (
        <SecondaryButton className="mt-5" onClick={onRetry}>
          {t("Tentar novamente", "Try again")}
        </SecondaryButton>
      )}
    </div>
  )
}
