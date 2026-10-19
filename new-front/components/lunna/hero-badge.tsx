"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useT } from "@/lib/use-t"

export function HeroBadge() {
  const t = useT()
  const [servers, setServers] = useState<number | undefined>(undefined)

  useEffect(() => {
    api.getPublicStats()
      .then((res) => {
        setServers(res?.data?.totalServers || res?.totalServers)
      })
      .catch((err) => {
        console.error("Falha ao buscar badge stats", err)
      })
  }, [])

  const fmtServers = servers 
    ? new Intl.NumberFormat(t("pt-BR", "en-US"), { notation: "compact" }).format(servers)
    : "2.4K+"

  return (
    <div className="flex">
      <span className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[13px] font-semibold text-primary">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        {t(`Online agora em ${fmtServers} servidores`, `Online now in ${fmtServers} servers`)}
      </span>
    </div>
  )
}
