"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"

export function DashboardSection() {
  const t = useTranslations("Dashboard")

  const sidebarItems = [
    { label: t("overview"), active: true },
    { label: t("members") },
    { label: t("quests") },
    { label: t("economy") },
    { label: t("moderation") },
    { label: t("settings") },
  ]

  const metrics = [
    { value: "1.2K", label: t("members") },
    { value: "247", label: t("quests") },
    { value: "98%", label: t("activity") },
  ]

  const progressBars = [
    { day: "Seg", pct: 82, color: "var(--primary)" },
    { day: "Ter", pct: 67, color: "var(--primary)" },
    { day: "Qua", pct: 91, color: "var(--primary)" },
    { day: "Qui", pct: 75, color: "var(--primary)" },
    { day: "Sex", pct: 58, color: "var(--muted-foreground)" },
  ]

  return (
    <section id="dashboard" className="py-24 bg-secondary/20">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        {/* Eyebrow + heading */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block text-[11px] font-bold uppercase tracking-[2px] text-primary">
            {t("title")}
          </span>
          <h2 className="mb-6 text-balance text-3xl font-black tracking-tighter text-foreground sm:text-5xl">
            {t("sectionTitle")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg font-medium text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* Browser mockup */}
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
          {/* Browser bar */}
          <div className="flex items-center gap-3 border-b border-border bg-secondary/50 px-6 py-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-foreground/10" />
              <span className="h-2 w-2 rounded-full bg-foreground/10" />
              <span className="h-2 w-2 rounded-full bg-foreground/10" />
            </div>
            <div className="flex items-center rounded-full bg-background px-4 py-1 text-[11px] font-medium text-muted-foreground ring-1 ring-border">
              dashboard.lunna.bot
            </div>
          </div>

          {/* Content */}
          <div className="flex h-[400px] bg-card">
            {/* Sidebar */}
            <aside className="hidden w-[200px] flex-col gap-1 border-r border-border bg-secondary/20 p-4 md:flex">
              {/* Server selector mockup */}
              <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-border bg-card p-2 shadow-sm">
                <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/10">
                  <Image src="/lunna-banner.jpg" alt="Server" fill className="object-cover object-top" />
                </div>
                <span className="truncate text-xs font-bold text-foreground">
                  {t("myServer")}
                </span>
              </div>

              {/* Menu items */}
              {sidebarItems.map((item) => (
                <div
                  key={item.label}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 transition-colors ${
                    item.active ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <div className={`h-1.5 w-1.5 rounded-full ${item.active ? "bg-primary" : "bg-transparent"}`} />
                  <span className="text-xs font-bold">{item.label}</span>
                </div>
              ))}
            </aside>

            {/* Main area */}
            <main className="flex-1 p-8">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                  {t("overview")}
                </h3>
                <div className="h-8 w-24 rounded-lg bg-secondary" />
              </div>

              {/* Metrics grid */}
              <div className="mb-8 grid grid-cols-3 gap-4">
                {metrics.map((m) => (
                  <div key={m.label} className="flex flex-col gap-1 rounded-2xl border border-border bg-secondary/10 p-4 transition-colors hover:border-primary/20">
                    <span className="text-2xl font-black tracking-tight text-foreground">{m.value}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{m.label}</span>
                  </div>
                ))}
              </div>

              {/* Activity Chart Mockup */}
              <div className="flex h-32 items-end justify-between gap-4 px-2">
                {progressBars.map((bar) => (
                  <div key={bar.day} className="flex flex-1 flex-col items-center gap-3">
                    <div className="relative w-full overflow-hidden rounded-full bg-secondary" style={{ height: "100px" }}>
                      <div
                        className="absolute bottom-0 w-full transition-all duration-1000"
                        style={{ height: `${bar.pct}%`, backgroundColor: bar.color }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">{bar.day}</span>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    </section>
  )
}
