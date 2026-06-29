"use client"

import React, { use, useEffect, useState } from "react"
import { Crown, Check, AlertTriangle, ArrowRight, ShieldAlert, Sparkles, Coins, Flame } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Link } from "@/src/i18n/routing"

export default function ServerPremiumPage({
  params,
}: {
  params: Promise<{ guildId: string }>
}) {
  const { guildId } = use(params)
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [premiumType, setPremiumType] = useState<string>("free")

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const res = await api.getGuildSettings(guildId)
        if (res) {
          setPremiumType(res.premium_type || "free")
        }
      } catch (err: any) {
        console.error("Failed to load settings:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [guildId])

  const plans = [
    {
      key: "free",
      name: "Grátis",
      desc: "Benefícios essenciais para começar no seu reino.",
      price: "R$ 0",
      period: "para sempre",
      badge: "Iniciante",
      color: "from-slate-600 to-slate-500",
      shadow: "shadow-slate-500/10",
      buttonText: "Plano Atual",
      features: [
        "Até 3 contadores de membros ativos",
        "Multiplicador de Daily: 1.0x",
        "Sistemas de Moderação Padrão",
        "Dashboard Web Básico",
      ],
    },
    {
      key: "basico",
      name: "Premium Básico",
      desc: "Destaque seu servidor com recursos adicionais excelentes.",
      price: "R$ 9,90",
      period: "mês",
      badge: "Popular",
      color: "from-violet-600 to-indigo-600",
      shadow: "shadow-violet-500/20",
      buttonText: "Atualizar para Básico",
      features: [
        "Até 10 contadores de membros ativos",
        "Multiplicador de Daily: 1.5x para membros",
        "Personalizações do Contador de Membros",
        "Badge de Servidor Premium",
        "Logs de Eventos estendidos",
      ],
    },
    {
      key: "completo",
      name: "Premium Completo",
      desc: "O nível máximo de poder e customização absoluta.",
      price: "R$ 19,90",
      period: "mês",
      badge: "Poder Máximo",
      color: "from-fuchsia-600 to-pink-600",
      shadow: "shadow-fuchsia-500/20",
      buttonText: "Atualizar para Completo",
      features: [
        "Contadores de membros ILIMITADOS",
        "Multiplicador de Daily: 2.0x para membros",
        "Todos os temas e layouts desbloqueados",
        "Suporte Prioritário VIP",
        "Customização completa de Banners",
        "Acesso antecipado a novas funções",
      ],
    },
  ]

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-64 rounded bg-muted/60" />
          <div className="h-4 w-96 rounded bg-muted/40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-muted/20 border border-border/50" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-12 duration-700">
      {/* Title Header */}
      <div className="space-y-4">
        <h1 className="flex items-center text-3xl font-black tracking-tight text-foreground gap-3">
          <Crown className="h-8 w-8 text-amber-500 animate-pulse" />
          Premium para Servidores
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Eleve a experiência da sua comunidade. Membros dos servidores premium recebem multiplicadores de recompensas diárias exclusivas e suporte a contadores estendidos.
        </p>
      </div>

      {/* Plans Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrent = premiumType === plan.key
          return (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-[2rem] border p-8 transition-all duration-500 hover:scale-[1.03] bg-card ${
                isCurrent 
                  ? `border-primary shadow-2xl ${plan.shadow}` 
                  : "border-border/60 hover:border-border"
              }`}
            >
              {/* Badge */}
              <div className="absolute top-5 right-5">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-gradient-to-r ${plan.color} text-white`}>
                  {plan.badge}
                </span>
              </div>

              {/* Header */}
              <div className="space-y-2 mb-6">
                <h3 className="text-2xl font-black text-foreground">{plan.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed min-h-[32px]">{plan.desc}</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-foreground">{plan.price}</span>
                <span className="text-xs text-muted-foreground">/ {plan.period}</span>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs font-semibold text-foreground/80">
                    <div className="mt-0.5 rounded-full bg-emerald-500/10 p-0.5 text-emerald-400">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              {isCurrent ? (
                <Button
                  disabled
                  className="w-full h-12 rounded-xl font-bold bg-emerald-500 text-white cursor-default"
                >
                  Plano Atual Ativo
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full h-12 rounded-xl font-bold bg-secondary text-foreground hover:bg-violet-600 hover:text-white transition-all"
                >
                  <Link href="/vip">
                    {plan.buttonText}
                  </Link>
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {/* Comparison Details Table */}
      <div className="rounded-[2.5rem] border border-border bg-card/40 p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-black text-foreground mb-6">Tabela Comparativa de Recursos</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b border-border/80 text-muted-foreground uppercase tracking-wider">
                <th className="py-4 px-2">Recurso</th>
                <th className="py-4 px-2">Grátis</th>
                <th className="py-4 px-2 text-violet-400">Básico</th>
                <th className="py-4 px-2 text-fuchsia-400">Completo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-foreground/90">
              <tr>
                <td className="py-4 px-2 font-bold text-foreground">Canais do Contador</td>
                <td className="py-4 px-2">Até 3 canais</td>
                <td className="py-4 px-2 text-violet-400">Até 10 canais</td>
                <td className="py-4 px-2 text-fuchsia-400 font-bold">Ilimitados</td>
              </tr>
              <tr>
                <td className="py-4 px-2 font-bold text-foreground">Multiplicador de Recompensa (Daily)</td>
                <td className="py-4 px-2">1.0x (Padrão)</td>
                <td className="py-4 px-2 text-violet-400">1.5x</td>
                <td className="py-4 px-2 text-fuchsia-400 font-bold">2.0x</td>
              </tr>
              <tr>
                <td className="py-4 px-2 font-bold text-foreground">Temas de Contador</td>
                <td className="py-4 px-2">Padrão</td>
                <td className="py-4 px-2 text-violet-400">Padrão + Emojis</td>
                <td className="py-4 px-2 text-fuchsia-400 font-bold">Todos (Desbloqueados)</td>
              </tr>
              <tr>
                <td className="py-4 px-2 font-bold text-foreground">Suporte da Lunna</td>
                <td className="py-4 px-2">Comunidade</td>
                <td className="py-4 px-2 text-violet-400">Prioritário</td>
                <td className="py-4 px-2 text-fuchsia-400 font-bold">Instantâneo / Devs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
