const stats = [
  { value: "2.4K+", label: "Servidores" },
  { value: "180K+", label: "Usuários" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Suporte" },
]

export function StatsBar() {
  return (
    <div
      className="mx-auto mt-10 w-full max-w-[860px]"
      style={{ paddingInline: "28px" }}
    >
      <div
        className="grid grid-cols-2 overflow-hidden rounded-[14px] bg-white md:grid-cols-4"
        style={{ border: "0.5px solid rgba(22,22,26,0.08)" }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center gap-1 py-5"
            style={{
              borderRight:
                i < stats.length - 1 ? "0.5px solid rgba(22,22,26,0.08)" : undefined,
            }}
          >
            <span className="text-[22px] font-bold leading-none text-[#16161a]">
              {stat.value}
            </span>
            <span className="text-[11px] font-medium text-[#9898b0]">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
