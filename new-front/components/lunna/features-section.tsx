"use client"
import { useT, type T } from "@/lib/use-t"

const features = (t: T) => [
  {
    icon: "⚔️",
    iconBg: "#ede9fe",
    title: "RPG",
    description: t("Sistema de missões, masmorras, batalhas e progressão de personagem para sua comunidade.", "Quests, dungeons, battles and character progression for your community."),
  },
  {
    icon: "💰",
    iconBg: "#fef9c3",
    title: t("Economia", "Economy"),
    description: t("Moedas, loja, inventário e recompensas diárias que mantêm seus membros engajados.", "Coins, a shop, an inventory and daily rewards that keep your members engaged."),
  },
  {
    icon: "🛡️",
    iconBg: "#ecfdf5",
    title: t("Moderação", "Moderation"),
    description: t("Automod inteligente, logs de auditoria, banimentos e silenciamentos automatizados.", "Smart automod, audit logs, and automatic bans and timeouts."),
  },
  {
    icon: "🧠",
    iconBg: "#eff6ff",
    title: t("IA", "AI"),
    description: t("Respostas automáticas, análise de comportamento e sugestões personalizadas com IA.", "AI-powered automatic answers, behavior analysis and personalized suggestions."),
  },
  {
    icon: "🎨",
    iconBg: "#fdf2f8",
    title: "Dashboard",
    description: t("Painel web completo para configurar tudo sem precisar usar comandos.", "A full web dashboard to set everything up without commands."),
  },
]

export function FeaturesSection() {
  const t = useT()
  return (
    <section
      id="features"
      className="mx-auto mt-[52px] w-full max-w-[860px]"
      style={{ paddingInline: "28px" }}
    >
      {/* Eyebrow + heading */}
      <div className="mb-10 flex flex-col gap-3">
        <span
          className="text-[11px] font-bold uppercase tracking-[2px] text-primary"
        >
          {t("Recursos", "Features")}
        </span>
        <h2
          className="text-balance text-[26px] font-bold leading-tight tracking-[-0.5px] text-foreground"
        >
          {t("Tudo que sua comunidade precisa", "Everything your community needs")}
        </h2>
        <p className="text-[15px] leading-[1.7] text-muted-foreground" style={{ maxWidth: "480px" }}>
          {t("Ferramentas poderosas reunidas em um único bot, pensadas para criar experiências memoráveis no Discord.", "Powerful tools in a single bot, made to create memorable experiences on Discord.")}
        </p>
      </div>

      {/* Cards grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        {features(t).map((feature) => (
          <div
            key={feature.title}
            className="group rounded-[14px] bg-card p-[22px_18px] transition-all duration-200 hover:-translate-y-0.5"
            style={{
              border: "0.5px solid color-mix(in oklab, var(--border) 90%, transparent)",
              paddingTop: "22px",
              paddingBottom: "22px",
              paddingLeft: "18px",
              paddingRight: "18px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.border = "0.5px solid color-mix(in oklab, var(--primary) 45%, transparent)"
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.border = "0.5px solid color-mix(in oklab, var(--border) 90%, transparent)"
            }}
          >
            <div
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] text-xl"
              style={{ backgroundColor: feature.iconBg }}
            >
              {feature.icon}
            </div>
            <h3 className="mb-1.5 text-[14px] font-semibold text-foreground">
              {feature.title}
            </h3>
            <p className="text-[13px] leading-[1.6] text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
