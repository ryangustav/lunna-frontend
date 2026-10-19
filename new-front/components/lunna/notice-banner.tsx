"use client"

import { useEffect, useState } from "react"
import { Link } from "@/src/i18n/routing"
import { AlertTriangle, Info, ShieldAlert, X } from "lucide-react"
import { api } from "@/lib/api"
import { useT } from "@/lib/use-t"

type PublicNotice = { slug: string; title: string; summary: string; severity: "info" | "warning" | "critical" }

const STYLE = {
  info: { box: "border-[#7c3aed]/30 bg-[#7c3aed]/10 text-foreground", icon: <Info className="h-4 w-4 text-[#a78bfa]" /> },
  warning: { box: "border-amber-500/40 bg-amber-500/10 text-foreground", icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
  critical: { box: "border-red-500/50 bg-red-500/10 text-foreground", icon: <ShieldAlert className="h-4 w-4 text-red-500" /> },
}

const DISMISS_KEY = "lunna:dismissed-notices"
const readDismissed = (): string[] => {
  try { return JSON.parse(localStorage.getItem(DISMISS_KEY) || "[]") } catch { return [] }
}

/** Site-wide banner for notices published in the admin panel. Urgent ones cannot be dismissed. */
export function NoticeBanner() {
  const t = useT()
  const [notices, setNotices] = useState<PublicNotice[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])

  useEffect(() => {
    setDismissed(readDismissed())
    api.getPublicNotices().then((r) => setNotices(r?.data || [])).catch(() => {})
  }, [])

  const visible = notices
    .filter((n) => n.severity === "critical" || !dismissed.includes(n.slug))
    .sort((a, b) => ({ critical: 0, warning: 1, info: 2 }[a.severity] - { critical: 0, warning: 1, info: 2 }[b.severity]))
    .slice(0, 2)
  if (!visible.length) return null

  const dismiss = (slug: string) => {
    const next = [...new Set([...dismissed, slug])]
    setDismissed(next)
    try { localStorage.setItem(DISMISS_KEY, JSON.stringify(next)) } catch { /* private mode */ }
  }

  return (
    <div className="flex flex-col gap-2 px-4 pt-3">
      {visible.map((n) => {
        const s = STYLE[n.severity] || STYLE.info
        return (
          <div key={n.slug} role={n.severity === "critical" ? "alert" : "status"}
            className={`mx-auto flex w-full max-w-[1180px] items-start gap-3 rounded-[12px] border px-4 py-3 text-[13px] ${s.box}`}>
            <span className="mt-0.5 shrink-0">{s.icon}</span>
            <p className="min-w-0 flex-1">
              <strong className="font-semibold">{n.title}</strong>
              {n.summary && <span className="text-muted-foreground"> — {n.summary}</span>}{" "}
              <Link href={`/avisos/${n.slug}`} className="font-medium text-[#a78bfa] underline-offset-2 hover:underline">Ler o aviso</Link>
            </p>
            {n.severity !== "critical" && (
              <button onClick={() => dismiss(n.slug)} aria-label={t("Fechar aviso", "Close notice")} className="shrink-0 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
