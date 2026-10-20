import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

// Search metadata for this page (the page itself is a client component)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const en = locale === "en"
  return pageMetadata({
    locale,
    path: "/dashboard",
    title: en ? "Dashboard — Lunna" : "Dashboard — Lunna",
    description: en ? "Set up Lunna in your server." : "Configure a Lunna no seu servidor.",
    index: false,
  })
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
