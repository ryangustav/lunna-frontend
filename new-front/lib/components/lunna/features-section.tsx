"use client"

const features = [
  {
    icon: "⚔️",
    iconBg: "#ede9fe",
    title: "RPG",
    description: "Sistema de missões, masmorras, batalhas e progressão de personagem para sua comunidade.",
  },
  {
    icon: "💰",
    iconBg: "#fef9c3",
    title: "Economia",
    description: "Moedas, loja, inventário e recompensas diárias que mantêm seus membros engajados.",
  },
  {
    icon: "🛡️",
    iconBg: "#ecfdf5",
    title: "Moderação",
    description: "Automod inteligente, logs de auditoria, banimentos e silenciamentos automatizados.",
  },
  {
    icon: "🧠",
    iconBg: "#eff6ff",
    title: "IA",
    description: "Respostas automáticas, análise de comportamento e sugestões personalizadas com IA.",
  },
  {
    icon: "🎨",
    iconBg: "#fdf2f8",
    title: "Dashboard",
    description: "Painel web completo para configurar tudo sem precisar usar comandos.",
  },
]

export function FeaturesSection() {
  return (
    <section
      className="mx-auto mt-[52px] w-full max-w-[860px]"
      style={{ paddingInline: "28px" }}
    >
      {/* Eyebrow + heading */}
      <div className="mb-10 flex flex-col gap-3">
        <span
          className="text-[11px] font-bold uppercase tracking-[2px] text-[#7c3aed]"
        >
          Recursos
        </span>
        <h2
          className="text-balance text-[26px] font-bold leading-tight tracking-[-0.5px] text-[#16161a]"
        >
          Tudo que sua comunidade precisa
        </h2>
        <p className="text-[15px] leading-[1.7] text-[#5a5a72]" style={{ maxWidth: "480px" }}>
          Ferramentas poderosas reunidas em um único bot, pensadas para criar experiências memoráveis no Discord.
        </p>
      </div>

      {/* Cards grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-[14px] bg-white p-[22px_18px] transition-all duration-200 hover:-translate-y-0.5"
            style={{
              border: "0.5px solid rgba(22,22,26,0.08)",
              paddingTop: "22px",
              paddingBottom: "22px",
              paddingLeft: "18px",
              paddingRight: "18px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.border = "0.5px solid #c4b5fd"
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.border = "0.5px solid rgba(22,22,26,0.08)"
            }}
          >
            <div
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] text-xl"
              style={{ backgroundColor: feature.iconBg }}
            >
              {feature.icon}
            </div>
            <h3 className="mb-1.5 text-[14px] font-semibold text-[#16161a]">
              {feature.title}
            </h3>
            <p className="text-[13px] leading-[1.6] text-[#5a5a72]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
