"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export function StatsBar() {
  const [statsData, setStatsData] = useState<{
    servers?: number
    users?: number
    uptime?: number
  }>({})

  useEffect(() => {
    api.getPublicStats()
      .then((res) => {
        setStatsData(res?.data || res)
      })
      .catch((err) => {
        console.error("Falha ao buscar stats bar", err)
      })
  }, [])

  const fmt = (num?: number, suffix = "") => 
    num ? new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(num) + suffix : "..."

  const stats = [
    { value: statsData.servers ? fmt(statsData.servers, "+") : "2.4K+", label: "Servidores" },
    { value: statsData.users ? fmt(statsData.users, "+") : "180K+", label: "Usuários" },
    { value: statsData.uptime ? `${statsData.uptime}%` : "99.9%", label: "Uptime" },
    { value: "24/7", label: "Suporte" },
  ]

  return (
    <div
      className="mx-auto mt-10 w-full max-w-[860px]"
      style={{ paddingInline: "28px" }}
    >
      <div
        className="grid grid-cols-2 overflow-hidden rounded-[14px] bg-card md:grid-cols-4"
        style={{ border: "0.5px solid color-mix(in oklab, var(--border) 90%, transparent)" }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center gap-1 py-5"
            style={{
              borderRight:
                i < stats.length - 1 ? "0.5px solid color-mix(in oklab, var(--border) 90%, transparent)" : undefined,
            }}
          >
            <span className="text-[22px] font-bold leading-none text-foreground">
              {stat.value}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
