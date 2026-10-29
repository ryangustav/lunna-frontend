import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

// Search metadata for this page (the page itself is a client component)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const en = locale === "en"
  return pageMetadata({
    locale,
    path: "/alquimia",
    title: en ? "Alchemy lab — Lunna" : "Laboratório de alquimia — Lunna",
    description: en
      ? "Decorate your alchemy cellar: buy cauldrons and furniture and place them anywhere. Furniture gives bonuses to your potions in /alquimia."
      : "Decore seu porão de alquimia: compre caldeirões e móveis e coloque onde quiser. Os móveis dão bônus às suas poções no /alquimia.",
    keywords: ["alquimia Lunna", "RPG Discord", "poções Discord"],
  })
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
