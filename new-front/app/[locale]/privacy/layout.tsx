import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

// Search metadata for this page (the page itself is a client component)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const en = locale === "en"
  return pageMetadata({
    locale,
    path: "/privacy",
    title: en ? "Privacy policy — Lunna" : "Política de privacidade — Lunna",
    description: en ? "How Lunna, the Discord bot, handles your data." : "Como a Lunna, o bot de Discord, trata os seus dados.",
  })
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
