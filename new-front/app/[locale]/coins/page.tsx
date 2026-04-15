"use client"

import { useTranslations } from "next-intl"
import { Coins, Gift, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/src/i18n/routing"
import { Navbar } from "@/components/lunna/navbar"

const POOL_PACKAGES = [
  { amount: "10,000", price: "4.99", bonus: "500" },
  { amount: "50,000", price: "9.99", bonus: "5,000", popular: true },
  { amount: "100,000", price: "17.99", bonus: "10,500" },
  { amount: "250,000", price: "34.99", bonus: "50,000" },
  { amount: "500,000", price: "79.99", bonus: "100,000" },
  { amount: "1,000,000", price: "149.99", bonus: "200,000" },
  { amount: "5,000,000", price: "249.99", bonus: "500,000" },
  { amount: "10,000,000", price: "449.99", bonus: "750,000" },
]

export default function CoinsPage() {
  const t = useTranslations("Coins")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-[1200px] px-6 py-24 lg:px-8">
        {/* Navigation / Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <Link href="/" className="group mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("backHome")}
          </Link>
          
          <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/5 px-4 py-1.5 text-primary">
            <Coins className="mr-2 h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t("badge")}</span>
          </Badge>
          
          <h1 className="mb-6 text-balance text-4xl font-black tracking-tighter text-foreground sm:text-6xl md:text-7xl">
            {t("titleStart")}{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t("titleEnd")}
            </span>
          </h1>
          <p className="max-w-2xl text-lg font-medium text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {POOL_PACKAGES.map((pkg, idx) => (
            <Card 
              key={idx}
              className={`group overflow-hidden border-border transition-all duration-300 hover:border-primary/30 hover:shadow-xl ${
                pkg.popular ? "ring-2 ring-primary ring-offset-4 ring-offset-background" : ""
              }`}
            >
              {pkg.popular && (
                <div className="bg-primary px-3 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                  {t("popular")}
                </div>
              )}

              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary transition-colors group-hover:bg-primary/5">
                  <Coins className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-3xl font-black tracking-tight">{pkg.amount}</CardTitle>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Coins</div>
              </CardHeader>

              <CardContent className="text-center">
                {parseInt(pkg.bonus.replace(",", "")) > 0 && (
                  <div className="mb-4">
                     <Badge variant="secondary" className="bg-primary/10 text-[10px] font-bold text-primary">
                       +{pkg.bonus} {t("bonus")}
                     </Badge>
                  </div>
                )}
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-xs font-bold text-muted-foreground">R$</span>
                  <span className="text-4xl font-black tracking-tight">{pkg.price}</span>
                </div>
              </CardContent>

              <CardFooter className="pt-4">
                <Button className="h-12 w-full rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Gift className="mr-2 h-4 w-4" />
                  {t("purchase")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
