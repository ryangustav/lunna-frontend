"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export function HeroBadge() {
  const [servers, setServers] = useState<number | undefined>(undefined)

  useEffect(() => {
    api.getPublicStats()
      .then((res) => {
        setServers(res?.data?.servers)
      })
      .catch((err) => {
        console.error("Falha ao buscar badge stats", err)
      })
  }, [])

  const fmtServers = servers 
    ? new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(servers) + "+"
    : "2.4K+"

  return (
    <div className="flex">
      <span className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[13px] font-semibold text-primary">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        Online agora em {fmtServers} servidores
      </span>
    </div>
  )
}
