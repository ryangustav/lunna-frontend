"use client"

import { use, useEffect, useState } from "react"
import { AlertTriangle, Info, ShieldAlert } from "lucide-react"
import { Navbar } from "@/components/lunna/navbar"
import { SimpleMarkdown } from "@/components/lunna/simple-markdown"
import { api } from "@/lib/api"

type Notice = {
  slug: string; title: string; summary: string; body: string; severity: "info" | "warning" | "critical"
  starts_at: string; ends_at: string | null; updated_at: string
  incident: null | { occurred_at: string | null; data_affected: string; risks: string; measures: string; contact: string }
}

const SEVERITY = {
  info: { label: "Aviso", cls: "border-[#7c3aed]/30 bg-[#7c3aed]/10 text-[#a78bfa]", icon: <Info className="h-4 w-4" /> },
  warning: { label: "Aviso importante", cls: "border-amber-500/40 bg-amber-500/10 text-amber-500", icon: <AlertTriangle className="h-4 w-4" /> },
  critical: { label: "Aviso urgente", cls: "border-red-500/50 bg-red-500/10 text-red-500", icon: <ShieldAlert className="h-4 w-4" /> },
}
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" }) : "")

export default function NoticePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    api.getPublicNotice(slug).then((r) => setNotice(r.data)).catch(() => setMissing(true))
  }, [slug])

  const s = notice ? SEVERITY[notice.severity] || SEVERITY.info : null
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-[760px] flex-1 px-4 py-12 sm:px-6">
        {missing && <p className="text-muted-foreground">Este aviso não existe ou ainda não foi publicado.</p>}
        {!notice && !missing && <div className="h-40 animate-pulse rounded-[16px] bg-secondary" />}
        {notice && s && (
          <article className="flex flex-col gap-6">
            <header className="flex flex-col gap-3">
              <span className={`inline-flex w-max items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold ${s.cls}`}>{s.icon}{s.label}</span>
              <h1 className="text-[30px] font-bold leading-tight text-foreground">{notice.title}</h1>
              {notice.summary && <p className="text-[16px] text-muted-foreground">{notice.summary}</p>}
              <p className="text-[13px] text-muted-foreground">
                Publicado em {fmt(notice.starts_at)}{notice.updated_at && notice.updated_at !== notice.starts_at ? ` · atualizado em ${fmt(notice.updated_at)}` : ""}
                {notice.ends_at && new Date(notice.ends_at) < new Date() ? " · encerrado" : ""}
              </p>
            </header>

            {notice.incident && (
              <section className="rounded-[16px] border border-border bg-card p-5">
                <h2 className="mb-4 text-[16px] font-bold text-foreground">Comunicado de incidente de segurança</h2>
                <dl className="grid gap-4 text-[14px]">
                  {notice.incident.occurred_at && <div><dt className="font-semibold text-foreground">Quando aconteceu</dt><dd className="text-muted-foreground">{fmt(notice.incident.occurred_at)}</dd></div>}
                  {notice.incident.data_affected && <div><dt className="font-semibold text-foreground">Dados envolvidos</dt><dd className="whitespace-pre-wrap text-muted-foreground">{notice.incident.data_affected}</dd></div>}
                  {notice.incident.risks && <div><dt className="font-semibold text-foreground">Riscos para você</dt><dd className="whitespace-pre-wrap text-muted-foreground">{notice.incident.risks}</dd></div>}
                  {notice.incident.measures && <div><dt className="font-semibold text-foreground">O que já fizemos</dt><dd className="whitespace-pre-wrap text-muted-foreground">{notice.incident.measures}</dd></div>}
                  {notice.incident.contact && <div><dt className="font-semibold text-foreground">Contato</dt><dd className="text-muted-foreground">{notice.incident.contact}</dd></div>}
                </dl>
              </section>
            )}

            {notice.body && <SimpleMarkdown text={notice.body} />}
          </article>
        )}
      </main>
    </div>
  )
}
