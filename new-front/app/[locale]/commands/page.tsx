import { getTranslations, setRequestLocale } from "next-intl/server"
import { Navbar } from "@/components/lunna/navbar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Terminal } from "lucide-react"
import { CommandsBrowser, type BrowserSection } from "@/components/lunna/commands-browser"
import { API_PUBLIC, SITE_URL, pageUrl } from "@/lib/site"

// Rendered on the server (and refreshed hourly) so search engines read every command in the HTML
export const revalidate = 3600

type Sub = { name: string; name_en?: string; description: string; description_en?: string; usage: string; usage_en?: string }
type Command = Sub & { category: string; subcommands?: Sub[] }

const CATEGORY: Record<string, [string, string]> = {
  rpg: ["RPG", "RPG"],
  economy: ["Economia", "Economy"],
  jogos_economy: ["Minigames", "Minigames"],
  levels: ["Níveis e XP", "Levels and XP"],
  moderator: ["Moderação", "Moderation"],
  giveaway: ["Sorteios", "Giveaways"],
  fun: ["Diversão", "Fun"],
  infos: ["Informações", "Info"],
  bot: ["Bot", "Bot"],
  outros: ["Outros", "Other"],
}
const ORDER = Object.keys(CATEGORY)

async function loadCommands(): Promise<Command[] | null> {
  try {
    const res = await fetch(`${API_PUBLIC}/commands/public`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const payload = await res.json()
    return Array.isArray(payload?.data) ? payload.data : null
  } catch {
    return null
  }
}

export default async function CommandsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("CommandsPage")
  const en = locale === "en"
  const commands = await loadCommands()

  // English names/descriptions come from the bot's Discord localizations
  const L = (c: Sub) => ({
    name: (en && c.name_en) || c.name,
    // "「💰」Colete…" → "Colete…" (the bracket emoji is decoration for Discord's picker)
    description: ((en && c.description_en) || c.description || "").replace(/^「[^」]*」\s*/, ""),
    usage: (en && c.usage_en) || c.usage,
  })
  const grouped = new Map<string, Command[]>()
  for (const c of commands || []) {
    const key = CATEGORY[c.category] ? c.category : "outros"
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(c)
  }
  const sections = [...grouped.entries()].sort((a, b) => ORDER.indexOf(a[0]) - ORDER.indexOf(b[0]))
  const label = (key: string) => (CATEGORY[key] || CATEGORY.outros)[en ? 1 : 0]
  const anchor = (name: string) => name.replace(/^\//, "").replace(/\s+/g, "-")
  // what the client search receives: the visible texts in this language, plus the other language's names to match
  const browserSections: BrowserSection[] = sections.map(([key, items]) => ({
    key,
    label: label(key),
    commands: items.map((c) => ({
      ...L(c),
      category: key,
      alt: [c.name, c.name_en || "", c.description, c.description_en || ""],
      subcommands: (c.subcommands || []).map((sc) => ({ ...L(sc), alt: [sc.name, sc.name_en || "", sc.description, sc.description_en || ""] })),
    })),
  }))
  const total = (commands || []).reduce((n, c) => n + Math.max(1, c.subcommands?.length || 0), 0)

  // the list as structured data: each command is a named item with its own URL fragment
  const jsonLd = commands?.length ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: en ? "Lunna commands" : "Comandos da Lunna",
    url: pageUrl(en ? "en" : "pt", "/commands"),
    numberOfItems: commands.length,
    itemListElement: commands.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${pageUrl(en ? "en" : "pt", "/commands")}#${anchor(L(c).name)}`,
      name: L(c).name,
      description: L(c).description,
    })),
    isPartOf: { "@id": `${SITE_URL}/#website` },
  } : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
      <Navbar />

      <main className="mx-auto max-w-[1200px] px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-10">
          <header className="space-y-4 text-center">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 px-4 py-1.5 text-primary">
              <Terminal className="mr-2 h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t("badge")}</span>
            </Badge>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{t("title")}</h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t("subtitle")}{" "}
              {commands?.length ? (en ? `${total} commands and subcommands of the Lunna Discord bot.` : `${total} comandos e subcomandos da Lunna, o bot de Discord.`) : ""}
            </p>
          </header>

          {commands === null && (
            <Card className="border-red-400/30 bg-red-500/5">
              <CardContent className="p-6 text-center text-sm font-semibold text-red-700">{t("error")}</CardContent>
            </Card>
          )}

          {commands !== null && sections.length === 0 && (
            <Card className="border-border bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">{t("empty")}</CardContent>
            </Card>
          )}

          {browserSections.length > 0 && (
            <CommandsBrowser
              sections={browserSections}
              labels={{
                search: en ? "Search commands (e.g. daily, ban, rpg, giveaway)" : "Buscar comandos (ex.: daily, ban, rpg, sorteio)",
                all: en ? "All" : "Todos",
                usage: t("usage"),
                none: en ? "No command matches your search." : "Nenhum comando encontrado para essa busca.",
                results: en ? "{n} command(s) found" : "{n} comando(s) encontrado(s)",
              }}
            />
          )}
        </div>
      </main>
    </div>
  )
}
