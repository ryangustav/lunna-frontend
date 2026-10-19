"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Plus, Search, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link } from "@/src/i18n/routing"
import { Navbar } from "@/components/lunna/navbar"
import { api } from "@/lib/api"
import { useT } from "@/lib/use-t"

interface Guild {
  id: string
  name: string
  icon: string | null
  isBotIn: boolean
}

const INVITE_URL = "https://discord.com/oauth2/authorize?client_id=1222333304028659792&permissions=8&scope=bot%20applications.commands"

export default function DashboardPage() {
  const t = useTranslations("Dashboard")
  const L = useT()
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        setLoading(true)
        const result = await api.getGuilds()
        if (result.success) {
          setGuilds(result.data)
        }
      } catch (err) {
        console.error("Dashboard error:", err)
        setError(t("noServers"))
      } finally {
        setLoading(false)
      }
    }
    fetchGuilds()
  }, [t])

  const filtered = guilds
    .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    // servers with the bot first, so the ones you can configure are on top
    .sort((a, b) => Number(b.isBotIn) - Number(a.isBotIn))

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-[860px] px-7 pt-14 pb-20">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#7c3aed]">Dashboard</span>
            <h1 className="text-[26px] font-bold leading-tight tracking-[-0.5px]">{t("title")}</h1>
            <p className="text-[14px] leading-[1.7] text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="relative w-full shrink-0 sm:w-[260px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={L("Buscar servidor", "Search server")}
              style={{ paddingLeft: "2.5rem" }}
              className="h-10 w-full rounded-full border border-border bg-card pr-4 text-[13px] outline-none transition-colors focus:border-[#7c3aed]/60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-[14px] border border-border bg-card p-5 text-[14px] text-muted-foreground">{error}</div>
        )}

        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0">
                <div className="h-10 w-10 animate-pulse rounded-full bg-secondary" />
                <div className="h-4 w-48 animate-pulse rounded bg-secondary" />
              </div>
            ))
          ) : (
            <>
              {filtered.map((guild) => {
                const row = (
                  <>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={guild.icon || ""} alt={guild.name} className="object-cover" />
                      <AvatarFallback className="bg-secondary text-[14px] font-semibold">{guild.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 truncate text-[14px] font-medium text-foreground">{guild.name}</span>
                    {guild.isBotIn ? (
                      <span className="flex items-center gap-1 text-[13px] font-medium text-muted-foreground group-hover:text-foreground">
                        {t("manage")}
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="rounded-full border border-border px-3 py-1 text-[12px] font-semibold text-foreground group-hover:bg-secondary">
                        {t("guest")}
                      </span>
                    )}
                  </>
                )
                const cls = "group flex items-center gap-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-secondary/50"
                return guild.isBotIn ? (
                  <Link key={guild.id} href={`/dashboard/${guild.id}` as any} className={cls}>
                    {row}
                  </Link>
                ) : (
                  <a key={guild.id} href={`${INVITE_URL}&guild_id=${guild.id}&disable_guild_select=true`} target="_blank" rel="noopener noreferrer" className={cls}>
                    {row}
                  </a>
                )
              })}

              {!filtered.length && !error && (
                <p className="px-5 py-8 text-center text-[13px] text-muted-foreground">{L("Nenhum servidor encontrado.", "No servers found.")}</p>
              )}
            </>
          )}
        </div>

        <a
          href={INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#7c3aed] px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {L("Adicionar a outro servidor", "Add to another server")}
        </a>
      </main>
    </div>
  )
}
