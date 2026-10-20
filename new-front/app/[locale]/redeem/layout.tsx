import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

// Search metadata for this page (the page itself is a client component)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const en = locale === "en"
  return pageMetadata({
    locale,
    path: "/redeem",
    title: en ? "Redeem a code — Lunna" : "Resgatar código — Lunna",
    description: en ? "Redeem Lunna promo codes to get Lunar Coins and VIP." : "Resgate códigos promocionais da Lunna para ganhar Lunar Coins e VIP.",
    keywords: ["código Lunna", "Lunna code"],
  })
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
