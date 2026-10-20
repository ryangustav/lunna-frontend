import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

// Search metadata for this page (the page itself is a client component)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const en = locale === "en"
  return pageMetadata({
    locale,
    path: "/coins",
    title: en ? "Lunar Coins — Lunna's currency" : "Lunar Coins — moedas da Lunna",
    description: en ? "Lunar Coins packs, Lunna's currency for the Discord bot's RPG, minigames and cosmetics." : "Pacotes de Lunar Coins, a moeda da Lunna para o RPG, minigames e cosméticos do bot de Discord.",
    keywords: ["Lunar Coins", "moedas Lunna"],
  })
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
