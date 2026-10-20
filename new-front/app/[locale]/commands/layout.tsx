import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

// Search metadata for this page (the page itself is a client component)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const en = locale === "en"
  return pageMetadata({
    locale,
    path: "/commands",
    title: en ? "Lunna commands — full list of the bot's commands" : "Comandos da Lunna — lista completa de comandos do bot",
    description: en ? "Every command of Lunna, the Discord bot: RPG (/rpg, /dungeon, /pvp, /market), economy (/daily, /pay, /balance, /work), moderation (/ban, /kick, /mute, /warn, /clear), levels (/rank, /xp), tickets, giveaways and more, with description and usage." : "Todos os comandos da Lunna, o bot de Discord: RPG (/rpg, /dungeon, /pvp, /market), economia (/daily, /pay, /saldo, /work), moderação (/ban, /kick, /mute, /warn, /clear), níveis (/rank, /xp), tickets, sorteios e mais, com descrição e forma de uso.",
    keywords: ["comandos Lunna", "comandos bot Discord", "Lunna commands", "slash commands", "/daily", "/rpg", "/rank", "/ticket", "/sorteio", "/giveaway"],
  })
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
