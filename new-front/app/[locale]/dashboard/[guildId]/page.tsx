"use client"

import React, { use, useEffect, useState } from "react"
import { Activity, ShieldAlert, Sparkles, Users, Languages, Save, AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export default function GuildOverviewPage({
  params,
}: {
  params: Promise<{ guildId: string }>
}) {
  const { guildId } = use(params)
  const { toast } = useToast()

  // States
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState("en")

  // Fetch settings on load
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await api.getGuildSettings(guildId)
        if (res) {
          setLanguage(res.language || "en")
        }
      } catch (err: any) {
        console.error("Failed to load overview settings:", err)
        setError(err.message || "Erro ao carregar as configurações de visão geral.")
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [guildId])

  // Save handler
  const handleSaveLanguage = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateGuildSettings(guildId, { language })
      toast({
        title: "Configurações salvas!",
        description: "Idioma padrão do bot atualizado com sucesso.",
      })
    } catch (err: any) {
      console.error("Failed to save language settings:", err)
      toast({
        title: "Erro ao salvar",
        description: err.message || "Não foi possível salvar o idioma.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

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

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-64 rounded bg-muted/60" />
          <div className="h-4 w-96 rounded bg-muted/40" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-muted/20 border border-border/50" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-destructive/20 bg-destructive/5 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive animate-bounce" />
        <h3 className="text-xl font-bold text-foreground">Falha ao Carregar</h3>
        <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">
          Tentar Novamente
        </Button>
      </div>
    )
  }

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

      {/* Idioma do Bot Section */}
      <form onSubmit={handleSaveLanguage} className="rounded-[2rem] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              Idioma Padrão do Bot (Default Language)
            </h2>
            <p className="text-sm text-muted-foreground">
              Selecione o idioma utilizado pela Lunna para responder aos comandos e enviar mensagens automáticas neste servidor.
            </p>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto h-11 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Idioma"}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${language === "en" ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"}`}>
            <input
              type="radio"
              name="bot-language"
              value="en"
              checked={language === "en"}
              onChange={(e) => setLanguage(e.target.value)}
              className="accent-primary h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">English 🇺🇸</span>
              <span className="text-xs text-muted-foreground">Default language if not specified.</span>
            </div>
          </label>

          <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${language === "pt" ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"}`}>
            <input
              type="radio"
              name="bot-language"
              value="pt"
              checked={language === "pt"}
              onChange={(e) => setLanguage(e.target.value)}
              className="accent-primary h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">Português (Brasil) 🇧🇷</span>
              <span className="text-xs text-muted-foreground">Idioma em português.</span>
            </div>
          </label>
        </div>
      </form>

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
