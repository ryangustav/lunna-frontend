import { setRequestLocale } from "next-intl/server"
import { Navbar } from "@/components/lunna/navbar"
import { Hero } from "@/components/lunna/hero"
import { StatsBar } from "@/components/lunna/stats-bar"
import { FeaturesSection } from "@/components/lunna/features-section"
import { DashboardSection } from "@/components/lunna/dashboard-section"
import { CtaSection } from "@/components/lunna/cta-section"

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <FeaturesSection />
        <DashboardSection />
        <CtaSection />
      </main>
    </div>
  )
}
