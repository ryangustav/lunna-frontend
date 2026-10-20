import type { MetadataRoute } from "next"
import { pageUrl } from "@/lib/site"

// Public pages, in Portuguese (/path) and English (/en/path), each pointing at its other language
const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/commands", priority: 0.9, changeFrequency: "weekly" },
  { path: "/vip", priority: 0.7, changeFrequency: "monthly" },
  { path: "/coins", priority: 0.6, changeFrequency: "monthly" },
  { path: "/daily", priority: 0.6, changeFrequency: "monthly" },
  { path: "/redeem", priority: 0.4, changeFrequency: "monthly" },
  { path: "/guidelines", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return PAGES.flatMap((p) =>
    (["pt", "en"] as const).map((locale) => ({
      url: pageUrl(locale, p.path),
      lastModified: now,
      changeFrequency: p.changeFrequency,
      priority: locale === "pt" ? p.priority : Math.max(0.1, p.priority - 0.1),
      alternates: { languages: { "pt-BR": pageUrl("pt", p.path), en: pageUrl("en", p.path) } },
    })),
  )
}
