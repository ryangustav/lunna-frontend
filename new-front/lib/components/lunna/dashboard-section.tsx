import Image from "next/image"

const sidebarItems = [
  { label: "Visão geral", active: true },
  { label: "Membros" },
  { label: "Missões" },
  { label: "Economia" },
  { label: "Moderação" },
  { label: "Configurações" },
]

const metrics = [
  { value: "1.2K", label: "Membros" },
  { value: "247", label: "Missões" },
  { value: "98%", label: "Atividade" },
]

const progressBars = [
  { day: "Seg", pct: 82, color: "#7c3aed" },
  { day: "Ter", pct: 67, color: "#7c3aed" },
  { day: "Qua", pct: 91, color: "#7c3aed" },
  { day: "Qui", pct: 75, color: "#7c3aed" },
  { day: "Sex", pct: 58, color: "#6ee7b7" },
]

export function DashboardSection() {
  return (
    <section
      className="mx-auto mt-[52px] w-full max-w-[860px]"
      style={{ paddingInline: "28px" }}
    >
      {/* Eyebrow + heading */}
      <div className="mb-8 flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#7c3aed]">
          Dashboard
        </span>
        <h2 className="text-balance text-[26px] font-bold leading-tight tracking-[-0.5px] text-[#16161a]">
          Controle total na palma da mão
        </h2>
        <p className="text-[15px] leading-[1.7] text-[#5a5a72]" style={{ maxWidth: "480px" }}>
          Configure cada detalhe do bot através do nosso painel web intuitivo, sem necessidade de comandos.
        </p>
      </div>

      {/* Browser mockup */}
      <div
        className="overflow-hidden rounded-[14px]"
        style={{ border: "0.5px solid rgba(22,22,26,0.1)" }}
      >
        {/* Browser bar */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{
            backgroundColor: "#f7f7fa",
            borderBottom: "0.5px solid rgba(22,22,26,0.08)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            <span className="h-2 w-2 rounded-full bg-green-400" />
          </div>
          <div
            className="flex items-center rounded-full px-3 py-1 text-[12px] font-medium text-[#9898b0]"
            style={{ backgroundColor: "rgba(22,22,26,0.06)" }}
          >
            dashboard.lunna.bot
          </div>
        </div>

        {/* Content */}
        <div className="flex" style={{ minHeight: "300px" }}>
          {/* Sidebar */}
          <aside
            className="flex shrink-0 flex-col gap-0.5 p-3"
            style={{
              width: "160px",
              backgroundColor: "#f0f0f2",
              borderRight: "0.5px solid rgba(22,22,26,0.08)",
            }}
          >
            {/* Server item */}
            <div
              className="mb-3 flex items-center gap-2 rounded-[8px] p-2"
              style={{ backgroundColor: "#ede9fe" }}
            >
              <div
                className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full"
                style={{ border: "1px solid #c4b5fd" }}
              >
                <Image
                  src="/lunna-banner.jpg"
                  alt="Servidor"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <span className="truncate text-[11px] font-semibold text-[#7c3aed]">
                Meu Servidor
              </span>
            </div>

            {/* Menu items */}
            {sidebarItems.map((item) => (
              <div
                key={item.label}
                className="flex cursor-pointer items-center gap-2 rounded-[6px] px-2 py-1.5"
                style={{
                  backgroundColor: item.active ? "#ffffff" : "transparent",
                }}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.active ? "#7c3aed" : "#9898b0" }}
                />
                <span
                  className="text-[12px] font-medium"
                  style={{ color: item.active ? "#16161a" : "#5a5a72" }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </aside>

          {/* Main area */}
          <main className="flex-1 bg-white p-5">
            <h3 className="mb-4 text-[13px] font-semibold text-[#16161a]">Visão geral</h3>

            {/* Metrics grid */}
            <div className="mb-5 grid grid-cols-3 gap-2">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex flex-col gap-0.5 rounded-[8px] p-3"
                  style={{ backgroundColor: "#f0f0f2" }}
                >
                  <span className="text-[16px] font-bold text-[#16161a]">{m.value}</span>
                  <span className="text-[11px] font-medium text-[#9898b0]">{m.label}</span>
                </div>
              ))}
            </div>

            {/* Progress bars */}
            <div className="flex flex-col gap-3">
              {progressBars.map((bar) => (
                <div key={bar.day} className="flex items-center gap-3">
                  <span className="w-7 shrink-0 text-[11px] font-medium text-[#9898b0]">
                    {bar.day}
                  </span>
                  <div
                    className="relative h-1.5 flex-1 overflow-hidden rounded-full"
                    style={{ backgroundColor: "#f0f0f2" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${bar.pct}%`, backgroundColor: bar.color }}
                    />
                  </div>
                  <span className="w-8 text-right text-[11px] font-medium text-[#9898b0]">
                    {bar.pct}%
                  </span>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </section>
  )
}
