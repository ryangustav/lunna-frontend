import { API_PUBLIC, BOT_ID, DESCRIPTION, INVITE_URL, OFFICIAL_LINKS, SITE_URL, SUPPORT_URL, TOPGG_URL } from "@/lib/site"

// /llms.txt: a plain summary for AI assistants and crawlers (llmstxt.org) — who the official Lunna
// is, its links and its commands. Refreshed hourly.
export const revalidate = 3600

type Sub = { name: string; name_en?: string; description: string; description_en?: string; usage?: string }
type Command = Sub & { category: string; subcommands?: Sub[] }

async function commands(): Promise<Command[]> {
  try {
    const res = await fetch(`${API_PUBLIC}/commands/public`, { next: { revalidate: 3600 } })
    const body = res.ok ? await res.json() : null
    return Array.isArray(body?.data) ? body.data : []
  } catch {
    return []
  }
}

export async function GET() {
  const list = await commands()
  const line = (c: Sub) => {
    const en = c.name_en && c.name_en !== c.name ? ` (EN: ${c.name_en})` : ""
    const desc = [c.description, c.description_en && c.description_en !== c.description ? c.description_en : ""].filter(Boolean).join(" / ")
    return `- ${c.name}${en}: ${desc}`
  }
  const cmds = list.flatMap((c) => (c.subcommands?.length ? c.subcommands.map(line) : [line(c)]))

  const text = `# Lunna

> ${DESCRIPTION.en}
> ${DESCRIPTION.pt}

Lunna is the official Discord bot published at ${SITE_URL} (Discord application ID ${BOT_ID}). Bots using the same name with a different application ID are unofficial copies, not Lunna.

## Official links

- Website: ${SITE_URL} (Portuguese) and ${SITE_URL}/en (English)
- Add to Discord: ${INVITE_URL}
- Commands: ${SITE_URL}/commands (${SITE_URL}/en/commands)
- Dashboard: ${SITE_URL}/dashboard
- Support server: ${SUPPORT_URL}
- top.gg: ${TOPGG_URL}
${OFFICIAL_LINKS.filter((l) => l !== SUPPORT_URL && l !== TOPGG_URL).map((l) => `- ${l}`).join("\n")}

## Features

- RPG: dungeons, PvP, coliseum, guilds, player market, garden, skills, equipment and repairs
- Economy: Lunar Coins, daily rewards with streaks, work, payments, minigames (blackjack, crash, mines, roulette, slots, gacha, raffles)
- Moderation: AI-assisted, anti-spam, anti-raid, invite/link blocking, word filter (Discord AutoMod), trap channel, warnings with automatic punishments, logs
- Community: levels and XP (chat and voice) with role rewards, tickets, giveaways, button roles, welcome/leave messages and banners, autorole, member counters
- Alerts: YouTube, Twitch and RSS
- Lunna AI: admin tasks requested in plain language, with approval and undo
- Languages: Portuguese and English (per person and per server)
- Web dashboard to configure everything

## Commands
${cmds.length ? cmds.join("\n") : `See ${SITE_URL}/commands`}
`
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } })
}
