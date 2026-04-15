"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Navbar } from "@/components/lunna/navbar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Terminal, Loader2 } from "lucide-react"

type Command = {
  name: string
  description: string
  usage: string
  category: string
}

export default function CommandsPage() {
  const t = useTranslations("CommandsPage")
  const [commands, setCommands] = useState<Command[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadCommands() {
      try {
        setLoading(true)
        const response = await fetch("/api/commands", { cache: "no-store" })
        if (!response.ok) throw new Error("Falha ao carregar comandos")
        const payload = await response.json()
        if (active) setCommands(Array.isArray(payload?.commands) ? payload.commands : [])
      } catch {
        if (active) setError(t("error"))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadCommands()
    return () => {
      active = false
    }
  }, [t])

  const grouped = useMemo(() => {
    const map = new Map<string, Command[]>()
    for (const command of commands) {
      if (!map.has(command.category)) map.set(command.category, [])
      map.get(command.category)?.push(command)
    }
    return Array.from(map.entries())
  }, [commands])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-[1200px] px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-10">
          <header className="space-y-4 text-center">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 px-4 py-1.5 text-primary">
              <Terminal className="mr-2 h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t("badge")}</span>
            </Badge>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{t("title")}</h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">{t("subtitle")}</p>
          </header>

          {loading && (
            <Card className="border-border bg-card">
              <CardContent className="flex items-center justify-center gap-3 p-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t("loading")}</span>
              </CardContent>
            </Card>
          )}

          {!loading && error && (
            <Card className="border-red-400/30 bg-red-500/5">
              <CardContent className="p-6 text-center text-sm font-semibold text-red-700">{error}</CardContent>
            </Card>
          )}

          {!loading && !error && grouped.length === 0 && (
            <Card className="border-border bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">{t("empty")}</CardContent>
            </Card>
          )}

          {!loading &&
            !error &&
            grouped.map(([category, items]) => (
              <section key={category} className="space-y-4">
                <h2 className="text-xl font-black tracking-tight">{category}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((cmd) => (
                    <Card key={cmd.name} className="border-border bg-card/70">
                      <CardContent className="space-y-3 p-6">
                        <div className="flex items-center justify-between gap-2">
                          <code className="rounded-md bg-secondary px-2 py-1 text-sm font-bold text-primary">{cmd.name}</code>
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                            {cmd.category}
                          </Badge>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">{cmd.description}</p>
                        <div className="rounded-lg border border-border bg-secondary/50 p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{t("usage")}</p>
                          <code className="mt-1 block text-sm text-foreground">{cmd.usage}</code>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
        </div>
      </main>
    </div>
  )
}
