"use client"

import React, { use, useEffect, useState } from "react"
import { Check } from "lucide-react"
import { useRouter } from "@/src/i18n/routing"
import { api } from "@/lib/api"
import { GUILD_PLANS, formatBRL, guildPlan } from "@/lib/guild-premium"
import { PageHeader, PrimaryButton, SecondaryButton, Pill, LoadingState } from "@/components/dashboard/primitives"

const RANK: Record<string, number> = { free: 0, basico: 1, completo: 2 }

export default function GuildPremiumPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState<string>("free")
  const [expiresAt, setExpiresAt] = useState<number>(0)

  useEffect(() => {
    api
      .getGuildSettings(guildId)
      .then((res) => {
        setCurrent(res?.premium_type || "free")
        setExpiresAt(res?.premium_expires_at || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [guildId])

  if (loading) return <LoadingState />

  const currentPlan = guildPlan(current) || guildPlan("free")!
  const expiry = expiresAt ? new Date(expiresAt * 1000).toLocaleDateString("pt-BR") : null

  return (
    <div>
      <PageHeader
        eyebrow="Premium"
        title="Planos para o servidor"
        description="Pagamento único por 30 dias, sem renovação automática. Ao renovar o mesmo plano, os dias se somam."
      />

      {current !== "free" && (
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-[14px] border border-border bg-card px-5 py-4 text-[14px]">
          <Pill tone="accent">{currentPlan.name}</Pill>
          <span className="text-muted-foreground">ativo{expiry ? ` até ${expiry}` : ""}.</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {GUILD_PLANS.map((plan) => {
          const isCurrent = plan.key === current
          const isLower = RANK[plan.key] < RANK[current]
          const highlighted = plan.key === "completo"
          return (
            <div
              key={plan.key}
              className={`flex flex-col rounded-[14px] border bg-card p-6 ${highlighted ? "border-[#7c3aed]/60" : "border-border"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[15px] font-semibold text-foreground">{plan.name}</h2>
                {isCurrent && <Pill tone="success">Atual</Pill>}
              </div>
              <p className="mt-1 text-[13px] leading-[1.6] text-muted-foreground">{plan.description}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-[26px] font-bold tracking-[-0.5px] text-foreground">
                  {plan.price ? formatBRL(plan.price) : "Grátis"}
                </span>
                {plan.days && <span className="text-[13px] text-muted-foreground">/ {plan.days} dias</span>}
              </div>

              <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                {plan.benefits.map((b) => (
                  <li key={b} className="flex gap-2 text-[13px] leading-[1.5] text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#7c3aed]" />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {plan.key === "free" ? (
                  <SecondaryButton disabled className="w-full">
                    {isCurrent ? "Plano atual" : "Incluído"}
                  </SecondaryButton>
                ) : isLower ? (
                  <SecondaryButton disabled className="w-full">
                    Plano superior ativo
                  </SecondaryButton>
                ) : (
                  <PrimaryButton
                    className="w-full"
                    onClick={() => router.push(`/checkout?type=GUILD_VIP&id=${plan.key}&guild=${guildId}`)}
                  >
                    {isCurrent ? "Renovar por 30 dias" : `Assinar ${plan.name}`}
                  </PrimaryButton>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-6 text-[12px] leading-[1.6] text-muted-foreground">
        O multiplicador de daily vale para quem é membro de um servidor premium. Ao trocar do Básico para o Completo, os dias restantes
        do Básico são convertidos proporcionalmente ao preço. Compras de bens virtuais seguem a nossa{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">Política de Privacidade</a>.
      </p>
    </div>
  )
}
