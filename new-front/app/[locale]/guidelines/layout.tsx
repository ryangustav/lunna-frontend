import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

// Search metadata for this page (the page itself is a client component)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const en = locale === "en"
  return pageMetadata({
    locale,
    path: "/guidelines",
    title: en ? "Community guidelines — Lunna" : "Diretrizes da comunidade — Lunna",
    description: en ? "The rules for using Lunna, the Discord bot." : "As regras de uso da Lunna, o bot de Discord.",
  })
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
