import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

type RawCommand = {
  name?: string
  command?: string
  description?: string
  usage?: string
  howToUse?: string
  category?: string
}

type Command = {
  name: string
  description: string
  usage: string
  category: string
}

const fallbackCommands: Command[] = [
  {
    name: "/daily",
    description: "Coleta sua recompensa diária de moedas.",
    usage: "/daily",
    category: "Economia",
  },
  {
    name: "/profile",
    description: "Mostra seu perfil, nível e estatísticas.",
    usage: "/profile [@usuário]",
    category: "RPG",
  },
  {
    name: "/shop",
    description: "Abre a loja de itens e utilidades.",
    usage: "/shop [categoria]",
    category: "Economia",
  },
  {
    name: "/mod mute",
    description: "Silencia um usuário com motivo e duração.",
    usage: "/mod mute @usuário 10m spam",
    category: "Moderação",
  },
]

const getCommands = unstable_cache(
  async (): Promise<Command[]> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.lunnabot.fun/v1"
    const endpoints = ["/commands/public", "/commands", "/bot/commands", "/public/commands"]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(5000),
          next: { revalidate: 300 },
        })

        if (!response.ok) continue

        const payload = await response.json()
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.commands)
              ? payload.commands
              : []

        const normalized = (list as RawCommand[])
          .map((item) => ({
            name: item.name || item.command || "",
            description: item.description || "Sem descrição",
            usage: item.usage || item.howToUse || item.command || "",
            category: item.category || "Geral",
          }))
          .filter((item) => item.name.length > 0)

        if (normalized.length > 0) return normalized
      } catch {
        // Try next endpoint; fallback returned below.
      }
    }

    return fallbackCommands
  },
  ["public-commands-v1"],
  { revalidate: 300 }
)

export async function GET() {
  const commands = await getCommands()

  return NextResponse.json(
    {
      ok: true,
      source: "cached",
      count: commands.length,
      commands,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  )
}
