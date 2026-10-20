import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

// Search metadata for this page (the page itself is a client component)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const en = locale === "en"
  return pageMetadata({
    locale,
    path: "/vip",
    title: en ? "Lunna VIP — premium bot perks" : "VIP da Lunna — benefícios premium do bot",
    description: en ? "Lunna VIP plans: more coins on daily, exclusive cosmetics and perks in the Discord bot's RPG and economy." : "Planos VIP da Lunna: mais moedas no daily, cosméticos exclusivos e vantagens no RPG e na economia do bot de Discord.",
    keywords: ["Lunna VIP", "VIP bot Discord"],
  })
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
