"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

function FloatingPill({
  dotColor,
  text,
  className,
  animationClass,
}: {
  dotColor: string
  text: string
  className?: string
  animationClass: string
}) {
  return (
    <div
      className={`absolute flex items-center gap-2 rounded-full border border-border/70 bg-card/95 px-3 py-2 text-[12px] font-semibold text-foreground shadow-sm backdrop-blur ${animationClass} ${className}`}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      {text}
    </div>
  )
}

export function HeroStats() {
  const [stats, setStats] = useState<{
    onlineMembers?: number
    totalServers?: number
    totalCoins?: number
  }>({})

  useEffect(() => {
    // Tenta buscar da API
    api.getPublicStats()
      .then((data) => {
        // Adapt to actual API response structure when ready
        setStats(data.data || data)
      })
      .catch((err) => {
        console.log("Falha ao buscar stats globais, usando fallback")
      })
  }, [])

  // Formata números (ex: 1200000 -> 1.200.000)
  const formatNumber = (num?: number, fallback: string = "...") => 
    num ? new Intl.NumberFormat("pt-BR").format(num) : fallback

  return (
    <>
      <FloatingPill
        dotColor="#4ade80"
        text={`${formatNumber(stats.onlineMembers, "47")} membros online`}
        animationClass="animate-float"
        className="-left-8 top-8"
      />

      <FloatingPill
        dotColor="#a78bfa"
        text={stats.totalServers ? `${formatNumber(stats.totalServers)} servidores` : "Masmorra desbloqueada"}
        animationClass="animate-float-delayed"
        className="-left-10 top-1/2 -translate-y-1/2"
      />

      <FloatingPill
        dotColor="#f9a8d4"
        text={`${formatNumber(stats.totalCoins, "1.200")} moedas ganhas`}
        animationClass="animate-float-slow"
        className="-right-8 bottom-10"
      />
    </>
  )
}
