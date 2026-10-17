// Server Premium plans shown on the site. Only list benefits that are actually implemented
// (lunna-backend/src/infrastructure/services/guild-premium.ts and Lunna_Bot/src/util/guild_premium.js).

export type GuildPlanKey = "free" | "basico" | "completo"

export interface GuildPlan {
  key: GuildPlanKey
  name: string
  price: number
  days: number | null
  description: string
  benefits: string[]
}

export const GUILD_PLANS: GuildPlan[] = [
  {
    key: "free",
    name: "Grátis",
    price: 0,
    days: null,
    description: "Tudo o que você precisa para começar.",
    benefits: [
      "Até 3 contadores de membros",
      "Moderação, boas-vindas e logs completos",
      "Daily normal para os membros",
    ],
  },
  {
    key: "basico",
    name: "Premium Básico",
    price: 9.9,
    days: 30,
    description: "Mais contadores e a IA treinada com as regras do seu servidor.",
    benefits: [
      "Até 10 contadores de membros",
      "Temas exclusivos para os contadores",
      "Cérebro da Lunna: a IA responde com o FAQ do servidor",
      "Daily 1,5x para os membros do servidor",
    ],
  },
  {
    key: "completo",
    name: "Premium Completo",
    price: 19.9,
    days: 30,
    description: "Sem limites para comunidades grandes.",
    benefits: [
      "Contadores de membros ilimitados",
      "Temas exclusivos para os contadores",
      "Cérebro da Lunna: a IA responde com o FAQ do servidor",
      "Daily 2x para os membros do servidor",
    ],
  },
]

export const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export function guildPlan(key: string | null | undefined): GuildPlan | undefined {
  return GUILD_PLANS.find((p) => p.key === key)
}
