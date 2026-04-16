"use client"

import React, { use } from "react"
import { usePathname } from "next/navigation"
import { Link } from "@/src/i18n/routing"
import { ShieldAlert, Settings, LayoutDashboard, ChevronLeft } from "lucide-react"

export default function GuildDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ guildId: string }>
}) {
  const pathname = usePathname()
  const { guildId } = use(params)

  const links = [
    {
      name: "Visão Geral",
      href: `/dashboard/${guildId}`,
      icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
    },
    {
      name: "Moderação e Anti-Raid",
      href: `/dashboard/${guildId}/moderation`,
      icon: <ShieldAlert className="mr-3 h-5 w-5" />,
    },
    {
      name: "Preferências Locais",
      href: `/dashboard/${guildId}/settings`,
      icon: <Settings className="mr-3 h-5 w-5" />,
    },
  ]

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar Desktop */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 flex-col overflow-y-auto border-r border-border bg-card/30 backdrop-blur-3xl md:flex">
        <div className="flex flex-col gap-8 p-6">
          <Link
            href="/dashboard"
            className="group flex w-max items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Voltar aos Servidores
          </Link>

          <div className="flex flex-col space-y-2">
            {links.map((link) => {
              const isActive = pathname === link.href

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex w-full items-center rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_10px_30px_-10px] shadow-primary/40"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-12 relative">
        {/* Glow de fundo da main area */}
        <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

        <div className="mx-auto w-full max-w-5xl rounded-[2.5rem] border border-border bg-card/20 p-8 md:p-12 shadow-2xl backdrop-blur-sm">
          {children}
        </div>
      </main>
    </div>
  )
}
