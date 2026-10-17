"use client"

import { useEffect, useState } from "react"
import { Link } from "@/src/i18n/routing"
import { api } from "@/lib/api"
import { PageHeader, Section, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"

type Overview = {
  users: number; vips: number; premiumGuilds: number
  economy7d: { created: number; destroyed: number; movements: number }
  campaigns: { code: string; status: string }[]
  activeNotices: number
}
const n = (v: number) => (v || 0).toLocaleString("pt-BR")

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const load = () => { setError(null); api.getAdminOverview().then((r) => setData(r.data)).catch((e) => setError(e.message)) }
  useEffect(load, [])

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return <LoadingState />

  const net = data.economy7d.created - data.economy7d.destroyed
  const tiles = [
    { label: "Usuários com perfil", value: n(data.users) },
    { label: "VIPs ativos", value: n(data.vips) },
    { label: "Servidores Premium", value: n(data.premiumGuilds) },
    { label: "Avisos no ar", value: n(data.activeNotices), href: "/admin/avisos" },
  ]
  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Administração" title="Visão geral" description="Números gerais da Lunna. Tudo que muda algo fica no registro de ações." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-[14px] border border-border bg-card p-4">
            <p className="text-[12px] text-muted-foreground">{t.label}</p>
            <p className="mt-1 text-[24px] font-bold text-foreground">{t.value}</p>
            {t.href && <Link href={t.href} className="text-[12px] text-[#a78bfa] hover:underline">Ver</Link>}
          </div>
        ))}
      </div>
      <Section title="Economia nos últimos 7 dias" description="Moedas criadas (daily, trabalho, dungeons…) e destruídas (lojas, gacha, taxas). Transferências entre jogadores não entram.">
        <div className="grid gap-3 sm:grid-cols-3">
          <div><p className="text-[12px] text-muted-foreground">Criadas</p><p className="text-[20px] font-bold text-emerald-500">+{n(data.economy7d.created)}</p></div>
          <div><p className="text-[12px] text-muted-foreground">Destruídas</p><p className="text-[20px] font-bold text-red-500">−{n(data.economy7d.destroyed)}</p></div>
          <div><p className="text-[12px] text-muted-foreground">Saldo (inflação)</p><p className={`text-[20px] font-bold ${net > 0 ? "text-amber-500" : "text-foreground"}`}>{net > 0 ? "+" : ""}{n(net)}</p></div>
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">{n(data.economy7d.movements)} movimentações registradas.</p>
      </Section>
      <Section title="Campanhas em andamento" description="Enviando ou pausadas.">
        {data.campaigns.length === 0 ? <p className="text-[13px] text-muted-foreground">Nenhuma.</p> : (
          <div className="flex flex-wrap gap-2">
            {data.campaigns.map((c) => <Link key={c.code} href="/admin/campanhas"><Pill tone={c.status === "sending" ? "success" : "neutral"}>{c.code} · {c.status === "sending" ? "enviando" : "pausada"}</Pill></Link>)}
          </div>
        )}
      </Section>
    </div>
  )
}
