"use client"

import React, { use, useEffect, useState } from "react"
import { Save, AlertTriangle, Brain, Sparkles, MessageSquare, Shield, HelpCircle } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface Channel {
  id: string
  name: string
  type: number
}

export default function LunnaBrainPage({
  params,
}: {
  params: Promise<{ guildId: string }>
}) {
  const { guildId } = use(params)
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [channels, setChannels] = useState<Channel[]>([])

  const [aiFaq, setAiFaq] = useState<string>("")
  const [chatEventChannel, setChatEventChannel] = useState<string>("")
  const [isPremium, setIsPremium] = useState<boolean>(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [settingsRes, channelsRes] = await Promise.all([
          api.getGuildSettings(guildId),
          api.getGuildChannels(guildId)
        ])

        if (settingsRes) {
          setAiFaq(settingsRes.ai_faq || "")
          setChatEventChannel(settingsRes.chat_event_channel || "")
          setIsPremium(settingsRes.premium_type ? settingsRes.premium_type !== "free" : false)
        }

        if (channelsRes?.success) {
          setChannels(channelsRes.data.filter((c: Channel) => c.type === 0))
        }

      } catch (err: any) {
        console.error("Failed to load settings data for Lunna Brain:", err)
        setError(err.message || "Não foi possível carregar as configurações do cérebro.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [guildId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPremium) {
      toast({
        title: "Recurso Premium",
        description: "O Cérebro da Lunna é um recurso exclusivo para Servidores Premium.",
        variant: "destructive"
      })
      return
    }

    setSaving(true)

    try {
      const payload = {
        ai_faq: aiFaq,
        chat_event_channel: chatEventChannel || null
      }

      await api.updateGuildSettings(guildId, payload)

      toast({
        title: "Sincronizado!",
        description: "Cérebro da Lunna atualizado com sucesso.",
      })
    } catch (err: any) {
      console.error("Failed to save Lunna Brain settings:", err)
      toast({
        title: "Erro ao salvar",
        description: err.message || "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-64 rounded bg-muted/60" />
          <div className="h-4 w-96 rounded bg-muted/40" />
        </div>
        <div className="h-48 w-full rounded-[14px] bg-muted/20 border border-border/50" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-[14px] border border-destructive/20 bg-destructive/5 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h3 className="text-[15px] font-bold text-foreground">Falha de Conexão</h3>
        <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="animate-in fade-in space-y-8 duration-300">
      

      {!isPremium && (
        <div className="rounded-[14px] border border-yellow-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-[14px] bg-yellow-500/20 text-yellow-400">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
                Recurso Exclusivo Premium
                <span className="text-xs bg-yellow-500/20 text-yellow-400 font-semibold px-2.5 py-0.5 rounded-full border border-yellow-500/30">VIP SERVER</span>
              </h3>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                O Cérebro da Lunna (Base de Conhecimento e IA customizada) é um recurso exclusivo para Servidores Premium.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => window.location.href = `/dashboard/${guildId}/premium`}
            className="w-full md:w-auto h-10 rounded-full font-bold shrink-0 rounded-full bg-[#7c3aed] px-5 text-[13px] font-semibold text-white hover:bg-[#7c3aed]/90"
          >
            Obter Premium para Servidor
          </Button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="flex items-center gap-3 text-[26px] font-bold leading-tight tracking-[-0.5px] text-foreground">
            Cérebro da Lunna
          </h1>
          <p className="mt-2 text-muted-foreground text-sm max-w-xl font-medium">
            Customize o banco de dados e regras do chatbot de Inteligência Artificial para este servidor, além de configurar canais para eventos no chat.
          </p>
        </div>

        <Button
          type="submit"
          disabled={saving || !isPremium}
          className="w-full sm:w-auto h-10 rounded-full font-bold transition-all disabled:opacity-50 rounded-full bg-[#7c3aed] px-5 text-[13px] font-semibold text-white hover:bg-[#7c3aed]/90"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Card 1: AI FAQ / Knowledge Context */}
        <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group hover:border-violet-500/30 transition-colors duration-300">
          
          <div className="space-y-1">
            <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-violet-500/10 text-violet-400 text-sm font-semibold">1</span>
              Regras e FAQ do Servidor (Base de Conhecimento)
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Escreva as regras, FAQ ou informações gerais do servidor. Quando os usuários mencionarem a Lunna, ela lerá essas informações para responder com contexto e precisão sobre o servidor!
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-[2px] text-muted-foreground">Instruções para o Cérebro AI (Máx. 2000 caract.)</label>
              <span className="text-[10px] bg-secondary px-2.5 py-0.5 rounded-full text-muted-foreground font-semibold">Inteligência Artificial Ativa</span>
            </div>
            
            <textarea
              value={aiFaq}
              onChange={(e) => setAiFaq(e.target.value.substring(0, 2000))}
              rows={8}
              placeholder="Exemplo:\n- Este é o Servidor Oficial de RPG Lunna.\n- Para registrar sua conta use o comando /registrar.\n- Administradores atuais: @João e @Maria.\n- Regras principais: Proibido spam e links de outros bots."
              className="w-full rounded-[14px] border border-border bg-secondary/20 px-4 py-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-violet-500/50 resize-none font-mono"
            />
            
            <div className="rounded-[14px] bg-secondary/30 border border-border/40 p-4 flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">Como usar no Discord?</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Basta marcar a Lunna ou responder às mensagens dela. Ela usará as regras que você salvou acima para instruir as respostas dela aos usuários automaticamente!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Chat Events Spawn Channel */}
        <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group hover:border-violet-500/30 transition-colors duration-300">
          
          <div className="space-y-1">
            <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-violet-500/10 text-violet-400 text-sm font-semibold">2</span>
              Canais de Eventos de Chat (Boss & Baús)
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Escolha o canal onde o bot irá spawnar batalhas de Boss interativas e Baús de Tesouro aleatórios periodicamente para movimentar e engajar os membros do chat!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[2px] text-muted-foreground">Canal de Spawns Ativos</label>
              <select
                value={chatEventChannel}
                onChange={(e) => setChatEventChannel(e.target.value)}
                className="w-full h-12 rounded-[10px] border border-border bg-secondary/20 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-violet-500/50"
              >
                <option value="" className="bg-card text-muted-foreground">Desativado (Não spawnar eventos)</option>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id} className="bg-card text-foreground">
                    #{ch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-[14px] bg-secondary/30 border border-border/40 p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">Eventos Disponíveis</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Batalhas de chefe com cliques para bater no Boss e ganhar moedas, e Baús com cliques rápidos para coletar recompensas misteriosas.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </form>
  )
}
