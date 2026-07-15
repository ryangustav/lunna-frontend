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
        }

        if (channelsRes.success) {
          // Filter text channels (type 0)
          setChannels(channelsRes.data.filter((c: Channel) => c.type === 0))
        }

      } catch (err: any) {
        console.error("Failed to load settings data for Lunna Brain:", err)
        setError(err.message || "Não foi possível carregar as configurações do cérebro.")
        toast({
          title: "Erro ao carregar dados",
          description: err.message || "Por favor, tente recarregar a página.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [guildId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
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
        <div className="h-48 w-full rounded-3xl bg-muted/20 border border-border/50" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-destructive/20 bg-destructive/5 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive animate-bounce" />
        <h3 className="text-xl font-bold text-foreground">Falha de Conexão</h3>
        <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="flex items-center text-3xl font-black tracking-tight text-foreground gap-2">
            <Brain className="h-9 w-9 text-violet-500 animate-pulse" />
            Cérebro da Lunna
          </h1>
          <p className="mt-2 text-muted-foreground text-sm max-w-xl font-medium">
            Customize o banco de dados e regras do chatbot de Inteligência Artificial para este servidor, além de configurar canais para eventos no chat.
          </p>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto h-12 rounded-xl font-bold shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Card 1: AI FAQ / Knowledge Context */}
        <div className="rounded-[2.5rem] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group hover:border-violet-500/30 transition-colors duration-300">
          <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-violet-500/5 blur-2xl group-hover:bg-violet-500/10 transition-all" />
          
          <div className="space-y-1">
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 text-sm font-bold">1</span>
              Regras e FAQ do Servidor (Base de Conhecimento)
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Escreva as regras, FAQ ou informações gerais do servidor. Quando os usuários mencionarem a Lunna, ela lerá essas informações para responder com contexto e precisão sobre o servidor!
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Instruções para o Cérebro AI (Máx. 2000 caract.)</label>
              <span className="text-[10px] bg-secondary px-2.5 py-0.5 rounded-full text-muted-foreground font-bold">Inteligência Artificial Ativa</span>
            </div>
            
            <textarea
              value={aiFaq}
              onChange={(e) => setAiFaq(e.target.value.substring(0, 2000))}
              rows={8}
              placeholder="Exemplo:\n- Este é o Servidor Oficial de RPG Lunna.\n- Para registrar sua conta use o comando /registrar.\n- Administradores atuais: @João e @Maria.\n- Regras principais: Proibido spam e links de outros bots."
              className="w-full rounded-2xl border border-border bg-secondary/20 px-4 py-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-violet-500/50 resize-none font-mono"
            />
            
            <div className="rounded-2xl bg-secondary/30 border border-border/40 p-4 flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground">Como usar no Discord?</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Basta marcar a Lunna ou responder às mensagens dela. Ela usará as regras que você salvou acima para instruir as respostas dela aos usuários automaticamente!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Chat Events Spawn Channel */}
        <div className="rounded-[2.5rem] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group hover:border-violet-500/30 transition-colors duration-300">
          <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-violet-500/5 blur-2xl group-hover:bg-violet-500/10 transition-all" />
          
          <div className="space-y-1">
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 text-sm font-bold">2</span>
              Canais de Eventos de Chat (Boss & Baús)
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Escolha o canal onde o bot irá spawnar batalhas de Boss interativas e Baús de Tesouro aleatórios periodicamente para movimentar e engajar os membros do chat!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Canal de Spawns Ativos</label>
              <select
                value={chatEventChannel}
                onChange={(e) => setChatEventChannel(e.target.value)}
                className="w-full h-12 rounded-xl border border-border bg-secondary/20 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-violet-500/50"
              >
                <option value="" className="bg-card text-muted-foreground">Desativado (Não spawnar eventos)</option>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id} className="bg-card text-foreground">
                    #{ch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl bg-secondary/30 border border-border/40 p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground">Eventos Disponíveis</p>
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
