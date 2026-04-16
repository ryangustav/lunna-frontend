"use client"

import React, { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Server, Settings, PlusCircle, Sparkles } from "lucide-react"
import { Link } from "@/src/i18n/routing"
import { Button } from "@/components/ui/button"

interface Guild {
  id: string
  name: string
  icon: string | null
  isBotIn: boolean
}

export default function DashboardPage() {
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function fetchGuilds() {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]
      
      if (!token) {
        window.location.href = "/" // Redirect if no token
        return
      }

      try {
        const response = await api.getGuilds()
        if (response.success && active) {
          setGuilds(response.data)
          setLoading(false)
        } else {
          throw new Error("Unable to fetch guilds")
        }
      } catch (err) {
        if (active) {
          console.error("Erro ao puxar guilds:", err)
          setError("Não foi possível carregar os servidores. A Lunna pode estar offline.")
          setLoading(false)
        }
      }
    }

    fetchGuilds()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden pb-24 px-6 sm:px-12">
      {/* Elementos de efeito Glassmorphism estilo Lunna Premium */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]" />

      <div className="mx-auto max-w-7xl space-y-16 pt-16">
        {/* Header Hero */}
        <div className="animate-in fade-in slide-in-from-left-8 duration-700 md:text-left text-center space-y-4">
          <div className="inline-flex items-center space-x-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Painel de Comando
            </span>
          </div>
          <h1 className="text-balance text-5xl md:text-6xl font-black leading-none tracking-tight text-foreground">
            Seus Reinos <span className="text-primary group-hover:animate-pulse">Místicos</span>
          </h1>
          <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground mx-auto md:mx-0">
            Selecione um servidor para gerenciar as forças da Lunna e configurar as proteções ancestrais do seu reino.
          </p>
        </div>

        {error && (
          <div className="animate-in fade-in zoom-in flex items-center gap-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-red-500 duration-500">
            <div className="h-3 w-3 animate-ping rounded-full bg-red-500" />
            <span className="text-lg font-semibold">{error}</span>
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((skeleton) => (
              <div
                key={skeleton}
                className="h-[380px] animate-pulse rounded-[3rem] border border-border bg-card/40"
              />
            ))}
          </div>
        ) : (
          /* Guilds Grid */
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {guilds.map((guild, index) => (
              <div
                key={guild.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className="animate-in fade-in slide-in-from-bottom-8 group relative flex min-h-[380px] flex-col items-center justify-between overflow-hidden rounded-[3rem] border border-border/50 bg-card/60 p-10 backdrop-blur-xl transition-all duration-700 hover:-translate-y-3 hover:border-primary/40 hover:shadow-[0_30px_60px_#7c3aed30] fill-mode-both"
              >
                {/* Internal Card Glows */}
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-[60px] transition-all duration-700 group-hover:bg-primary/25" />
                <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-blue-500/10 blur-[60px] transition-all duration-700 group-hover:bg-blue-500/20" />

                <div className="relative flex w-full flex-col items-center space-y-6">
                  {guild.icon ? (
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-primary/40 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100" />
                      <div className="relative rounded-full border-4 border-background bg-gradient-to-tr from-primary to-blue-500 p-1.5 shadow-2xl transition-transform duration-500 group-hover:rotate-6">
                        <img
                          src={guild.icon}
                          alt={guild.name}
                          className="h-28 w-28 rounded-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-background shadow-inner transition-all duration-500 group-hover:border-primary/30">
                      <Server className="h-12 w-12 text-muted-foreground transition-colors duration-500 group-hover:text-primary" />
                    </div>
                  )}

                  <h3 className="line-clamp-2 px-2 text-center text-2xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {guild.name}
                  </h3>
                </div>

                <div className="relative w-full pt-8">
                  {guild.isBotIn ? (
                    <Link
                      href={`/dashboard/${guild.id}`}
                      className="group/btn flex w-full items-center justify-center rounded-[2rem] border border-border bg-card/50 px-8 py-5 text-xs font-black uppercase tracking-widest text-foreground transition-all duration-500 hover:border-transparent hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/40 hover:scale-[1.05]"
                    >
                      <Settings className="mr-3 h-4 w-4" /> Abrir Painel
                    </Link>
                  ) : (
                    <a
                      href={`https://discord.com/oauth2/authorize?client_id=1222333304028659792&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}&disable_guild_select=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center rounded-[2rem] bg-gradient-to-r from-primary to-blue-600 px-8 py-5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all duration-500 hover:brightness-110 hover:shadow-primary/50 active:scale-[0.95]"
                    >
                      <PlusCircle className="mr-3 h-4 w-4" /> Invocar Lunna
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* Configuração Add Novo Reino (Empty state simulado) */}
            <div className="group flex min-h-[380px] cursor-pointer flex-col items-center justify-center space-y-6 rounded-[3rem] border-2 border-dashed border-border/50 bg-card/10 p-10 text-center opacity-60 transition-all duration-700 hover:scale-[1.02] hover:border-primary/40 hover:bg-card/30 hover:opacity-100">
              <PlusCircle className="h-16 w-16 text-muted-foreground transition-all duration-700 group-hover:rotate-90 group-hover:text-primary" />
              <div className="space-y-2">
                <p className="text-xl font-black tracking-tight text-foreground">
                  Novo Reino?
                </p>
                <p className="px-4 text-sm font-medium text-muted-foreground">
                  Não encontrou sua guilda?
                  <br />
                  Tente atualizar sua sessão.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
