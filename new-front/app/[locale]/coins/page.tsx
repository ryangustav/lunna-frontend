"use client"

import { useState, useEffect } from "react"
import { Coins, Gift, ArrowLeft, Sparkles, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/src/i18n/routing"
import { Navbar } from "@/components/lunna/navbar"
import { useLocale } from "next-intl"

interface Translation {
  shopTitle: string;
  shopDescription: string;
  coinPackageBonus: string;
  purchase: string;
  backHome: string;
  badge: string;
}

const translations: Record<string, Translation> = {
  en: {
    shopTitle: "Lunna Shop",
    shopDescription: "Enhance your Lunna experience with premium features and Lunar Coins",
    coinPackageBonus: "Bonus Coins",
    purchase: "Purchase",
    backHome: "Back to Home",
    badge: "Economy Package"
  },
  pt: {
    shopTitle: "Loja da Lunna",
    shopDescription: "Melhore sua experiência Lunna com recursos premium e Lunar Coins",
    coinPackageBonus: "Bônus Coins",
    purchase: "Comprar",
    backHome: "Voltar ao início",
    badge: "Pacote de Economia"
  }
};

const COIN_PACKAGES = [
  { id: '10k', amount: 10000, price: 4.99, bonus: 500, popular: false },
  { id: '50k', amount: 50000, price: 9.99, bonus: 5000, popular: true },
  { id: '100k', amount: 100000, price: 17.99, bonus: 10500, popular: false },
  { id: '250k', amount: 250000, price: 34.99, bonus: 50000, popular: false },
  { id: '500k', amount: 500000, price: 79.99, bonus: 100000, popular: false },
  { id: '1m', amount: 1000000, price: 149.99, bonus: 200000, popular: false },
  { id: '5m', amount: 5000000, price: 249.99, bonus: 500000, popular: false },
  { id: '10m', amount: 10000000, price: 449.99, bonus: 750000, popular: false },
];

interface User {
  userId: string;
  username: string;
  avatar?: string;
}

const getToken = () => {
  if (typeof document === 'undefined') return null;
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
}

export default function LunnarCoinsPage() {
  const locale = useLocale()
  const t = translations[locale] || translations.en

  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const token = getToken()
    
    if (!token) {
      setUser(null)
      return
    }

    try {
      const response = await fetch("https://lunna-api.discloud.app/auth/me", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.data)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.log("Error fetching user data", error)
      setUser(null)
    }
  }

  const handlePurchase = async (packageId: string) => {
    if (!packageId) {
      setError('Invalid package selected')
      return
    }
  
    try {
      setLoading(packageId)
      setError(null)
  
      const token = getToken()
      if (!token) {
        throw new Error(locale === 'pt' ? "Por favor faça login com o Discord primeiro." : "Please login to your discord account first.")
      }
  
      const payload = {
        userId: user?.userId,
        packageId: packageId
      }
  
      const response = await fetch('https://lunna-api.discloud.app/coins/purchase', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
  
      if (!response.ok) {
        let errorText = await response.text()
        if (response.status === 401) errorText = locale === 'pt' ? "Por favor faça login com o Discord" : "Please login to your discord account"
        throw new Error(errorText)
      }
  
      const data = await response.json()
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        throw new Error('Payment URL not provided')
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="mx-auto max-w-[1200px] px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-20 flex flex-col items-center text-center">
            <Link href="/" className="group mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {t.backHome}
            </Link>
            
            <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/5 px-4 py-1.5 text-primary">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t.badge}</span>
            </Badge>
            
            <h1 className="mb-6 max-w-4xl text-balance text-4xl font-black tracking-tighter sm:text-6xl md:text-7xl">
              {t.shopTitle}
            </h1>
            <p className="max-w-2xl text-lg font-medium text-muted-foreground">
              {t.shopDescription}
            </p>

            {error && (
              <div className="mt-8 rounded-xl bg-destructive/10 px-6 py-4 text-sm font-bold text-destructive border border-destructive/20 shadow-sm animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {COIN_PACKAGES.map((pkg) => {
            const isFeatured = pkg.popular
            const formattedPrice = pkg.price.toFixed(2).replace(".", ",")

            return (
              <Card 
                key={pkg.id}
                className={`relative flex flex-col items-center text-center border-border transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl ${
                  isFeatured ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-sm">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pt-8 pb-4 items-center w-full">
                  <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full border shadow-inner ${
                    isFeatured 
                      ? "bg-primary/10 border-primary/20 text-primary" 
                      : "bg-secondary border-border text-foreground"
                  }`}>
                    <Coins className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-black tracking-tight">{pkg.amount.toLocaleString()}</CardTitle>
                  <p className="text-sm font-medium text-muted-foreground">Lunar Coins</p>
                </CardHeader>

                <CardContent className="flex-1 w-full space-y-4">
                  {pkg.bonus > 0 ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                      <Gift className="h-3.5 w-3.5" />
                      +{pkg.bonus.toLocaleString()} {t.coinPackageBonus}
                    </div>
                  ) : (
                    <div className="h-[26px]" /> // Spacer to keep cards aligned
                  )}
                  
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-xs font-bold text-muted-foreground">R$</span>
                    <span className="text-4xl font-black tracking-tighter">{formattedPrice}</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 pb-6 w-full">
                  <Button 
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={loading === pkg.id}
                    variant={isFeatured ? "default" : "secondary"} 
                    className="h-10 w-full rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {loading === pkg.id ? (
                      locale === 'pt' ? 'Processando...' : 'Processing...'
                    ) : (
                      <>
                        <Rocket className="h-4 w-4" />
                        {t.purchase}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
