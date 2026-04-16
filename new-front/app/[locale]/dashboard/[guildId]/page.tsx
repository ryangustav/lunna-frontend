"use client"

import React, { use } from "react"
import { Activity, ShieldAlert, Sparkles, Users } from "lucide-react"

export default function GuildOverviewPage({
  params,
}: {
  params: Promise<{ guildId: string }>
}) {
  const { guildId } = use(params)

  const statCards = [
    {
      label: "Membros Ativos",
      value: "...",
      desc: "Últimas 24h",
      icon: <Users className="h-5 w-5 text-blue-400" />,
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Comandos Usados",
      value: "...",
      desc: "Neste servidor",
      icon: <Sparkles className="h-5 w-5 text-primary" />,
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      label: "Ações de Moderação",
      value: "...",
      desc: "Mês atual",
      icon: <ShieldAlert className="h-5 w-5 text-red-400" />,
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    {
      label: "Ping do Servidor",
      value: "...",
      desc: "Latência média",
      icon: <Activity className="h-5 w-5 text-green-400" />,
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Visão Geral do Reino
        </h1>
        <p className="mt-2 text-muted-foreground">
          Acompanhe o fluxo mágico e estatísticas principais do seu servidor (ID:{" "}
          <code className="rounded bg-secondary px-1 text-primary">{guildId}</code>).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className={`flex flex-col space-y-4 rounded-3xl border ${stat.border} ${stat.bg} p-6 transition-transform hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="rounded-full bg-background/50 p-2 shadow-inner">
                {stat.icon}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-4xl font-black text-foreground">{stat.value}</span>
              <p className="text-xs font-medium text-muted-foreground">
                {stat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-border bg-card/30">
        <div className="text-center space-y-2">
          <Activity className="mx-auto h-8 w-8 text-muted-foreground animate-pulse" />
          <p className="text-sm font-medium text-muted-foreground">
            Gráficos dinâmicos em breve...
          </p>
        </div>
      </div>
    </div>
  )
}
