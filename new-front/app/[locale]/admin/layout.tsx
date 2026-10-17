"use client"

import React, { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Link } from "@/src/i18n/routing"
import { Navbar } from "@/components/lunna/navbar"
import { LayoutDashboard, Megaphone, Siren, ToggleRight, ScrollText, ShieldCheck, Lock, UserSearch } from "lucide-react"
import { api, isUnauthorized } from "@/lib/api"
import { LoadingState } from "@/components/dashboard/primitives"

const ITEMS = [
  { name: "Visão geral", href: "/admin", icon: <LayoutDashboard /> },
  { name: "Usuários", href: "/admin/usuarios", icon: <UserSearch /> },
  { name: "Campanhas", href: "/admin/campanhas", icon: <Megaphone /> },
  { name: "Avisos", href: "/admin/avisos", icon: <Siren /> },
  { name: "Interruptores", href: "/admin/interruptores", icon: <ToggleRight /> },
  { name: "Registro de ações", href: "/admin/registro", icon: <ScrollText /> },
]

/**
 * Admin area. This check only decides what to render: every /admin API call is authorised
 * again by the backend (ADMIN_USER_IDS), so hiding the page is not the security boundary.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [state, setState] = useState<"loading" | "admin" | "denied" | "logged-out">("loading")

  useEffect(() => {
    api.getAdminMe()
      .then((r) => setState(r?.data?.isAdmin ? "admin" : "denied"))
      .catch((err) => setState(isUnauthorized(err) ? "logged-out" : "denied"))
  }, [])

  const isActive = (href: string) => (href === "/admin" ? /\/admin\/?$/.test(pathname) : pathname.includes(href))

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      {state === "loading" && <div className="mx-auto w-full max-w-[860px] px-4 py-10"><LoadingState /></div>}
      {(state === "denied" || state === "logged-out") && (
        <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col items-center justify-center gap-3 px-4 py-20 text-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-[22px] font-bold text-foreground">Área restrita</h1>
          <p className="text-[14px] text-muted-foreground">
            {state === "logged-out" ? "Sua sessão expirou ou você não está conectado. Entre de novo com o Discord — o painel exige um login das últimas 12 horas." : "Esta área é só para a equipe da Lunna."}
          </p>
          <Link href="/" className="mt-2 text-[14px] font-medium text-[#a78bfa] hover:underline">Voltar para o início</Link>
        </div>
      )}
      {state === "admin" && (
        <div className="mx-auto flex w-full max-w-[1180px] flex-1">
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col overflow-y-auto border-r border-border py-8 pr-4 pl-6 md:flex">
            <div className="mb-8 flex items-center gap-2 px-3 text-[13px] font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-[#7c3aed]" /> Administração
            </div>
            <nav className="flex flex-col gap-1">
              {ITEMS.map((item) => (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors [&_svg]:h-4 [&_svg]:w-4 ${
                    isActive(item.href) ? "bg-secondary text-foreground [&_svg]:text-[#7c3aed]" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}>
                  {item.icon}<span className="flex-1">{item.name}</span>
                </Link>
              ))}
            </nav>
          </aside>
          <main className="min-w-0 flex-1 px-4 py-8 sm:px-7 md:px-10 md:py-10">
            <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden">
              {ITEMS.map((item) => (
                <Link key={item.href} href={item.href}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-medium ${
                    isActive(item.href) ? "border-[#7c3aed] bg-[#7c3aed] text-white" : "border-border bg-card text-muted-foreground"
                  }`}>
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="mx-auto w-full max-w-[860px]">{children}</div>
          </main>
        </div>
      )}
    </div>
  )
}
