"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export type BrowserSub = { name: string; description: string; usage: string; alt: string[] }
export type BrowserCommand = BrowserSub & { category: string; subcommands: BrowserSub[] }
export type BrowserSection = { key: string; label: string; commands: BrowserCommand[] }

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const anchor = (name: string) => name.replace(/^\//, "").replace(/\s+/g, "-")

/**
 * The command list with a search box and category filter. Every command is rendered on the server
 * (SEO); the search only hides the ones that don't match. It matches PT and EN names, descriptions
 * and subcommands, ignoring accents.
 */
export function CommandsBrowser({ sections, labels }: {
  sections: BrowserSection[]
  labels: { search: string; all: string; usage: string; none: string; results: string } // "{n}" = how many commands match
}) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const q = norm(query.trim())

  const matches = (c: BrowserSub) => !q || norm([c.name, c.description, c.usage, ...c.alt].join(" ")).includes(q)
  const filtered = useMemo(() => sections
    .filter((s) => !category || s.key === category)
    .map((s) => ({
      ...s,
      commands: s.commands
        .map((c) => {
          if (!q || matches(c)) return c
          const subs = c.subcommands.filter(matches)
          return subs.length ? { ...c, subcommands: subs } : null
        })
        .filter(Boolean) as BrowserCommand[],
    }))
    .filter((s) => s.commands.length),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [sections, q, category])
  const count = filtered.reduce((n, s) => n + s.commands.length, 0)

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${active ? "border-[#7c3aed] bg-[#7c3aed] text-white" : "border-border bg-card text-muted-foreground hover:text-foreground"}`

  return (
    <div className="space-y-10">
      <div className="sticky top-16 z-10 -mx-2 space-y-3 bg-background/90 px-2 py-3 backdrop-blur">
        <div className="relative mx-auto max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.search}
            aria-label={labels.search}
            className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-11 text-[14px] text-foreground outline-none transition-colors focus:border-[#7c3aed]/60"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Limpar / Clear"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {sections.length > 1 && (
          <nav className="flex flex-wrap justify-center gap-2">
            <button type="button" className={chip(!category)} onClick={() => setCategory(null)}>{labels.all}</button>
            {sections.map((s) => (
              <button key={s.key} type="button" className={chip(category === s.key)} onClick={() => setCategory(category === s.key ? null : s.key)}>
                {s.label}
              </button>
            ))}
          </nav>
        )}
        {(q || category) && <p className="text-center text-[12px] text-muted-foreground">{labels.results.replace("{n}", String(count))}</p>}
      </div>

      {filtered.length === 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-8 text-center text-muted-foreground">{labels.none}</CardContent>
        </Card>
      )}

      {filtered.map((s) => (
        <section key={s.key} id={`cat-${s.key}`} className="scroll-mt-40 space-y-4">
          <h2 className="text-xl font-black tracking-tight">{s.label}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {s.commands.map((c) => (
              <Card key={c.name} id={anchor(c.name)} className="scroll-mt-40 border-border bg-card/70">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center justify-between gap-2">
                    <h3><code className="rounded-md bg-secondary px-2 py-1 text-sm font-bold text-primary">{c.name}</code></h3>
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">{s.label}</Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                  {c.subcommands.length ? (
                    <ul className="space-y-2 rounded-lg border border-border bg-secondary/50 p-3">
                      {c.subcommands.map((sc) => (
                        <li key={sc.name} id={anchor(sc.name)} className="scroll-mt-40">
                          <code className="text-sm font-semibold text-foreground">{sc.usage}</code>
                          {sc.description && <p className="text-[12px] text-muted-foreground">{sc.description}</p>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="rounded-lg border border-border bg-secondary/50 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{labels.usage}</p>
                      <code className="mt-1 block text-sm text-foreground">{c.usage}</code>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
