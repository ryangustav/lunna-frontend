import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

// Search metadata for this page (the page itself is a client component)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const en = locale === "en"
  return pageMetadata({
    locale,
    path: "/daily",
    title: en ? "Lunna daily — daily reward" : "Daily da Lunna — recompensa diária",
    description: en ? "Claim Lunna's daily on the website: Lunar Coins every day, with streak and VIP bonuses." : "Resgate o daily da Lunna pelo site: Lunar Coins todos os dias, com bônus de sequência e de VIP.",
    keywords: ["daily Lunna", "recompensa diária Discord"],
  })
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
