"use client"

import { useState, useEffect } from "react"
import { Crown, Check, ArrowLeft, Sparkles, Zap, Star, Diamond, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/src/i18n/routing"
import { Navbar } from "@/components/lunna/navbar"
import { useLocale } from "next-intl"
import { API_URL } from "@/lib/api"

interface Translation {
  shopTitle: string;
  shopDescription: string;
  coinPackageBonus: string;
  purchase: string;
  backHome: string;
  badge: string;
  perMonth: string;
  mostPopular: string;
}

const translations: Record<string, Translation> = {
  en: {
    shopTitle: "Lunna Shop",
    shopDescription: "Enhance your Lunna experience with premium features and Lunar Coins",
    coinPackageBonus: "Bonus Coins",
    purchase: "Get Started",
    backHome: "Back to Home",
    badge: "Premium Experience",
    perMonth: "month",
    mostPopular: "Most Popular"
  },
  pt: {
    shopTitle: "Loja da Lunna",
    shopDescription: "Melhore sua experiência Lunna com recursos premium e Lunar Coins",
    coinPackageBonus: "Bônus Coins",
    purchase: "Comece agora",
    backHome: "Voltar ao início",
    badge: "Experiência Premium",
    perMonth: "mês",
    mostPopular: "Mais Popular"
  }
};

interface VipTier {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  durationDays: number;
}

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

export default function VipPage() {
  const locale = useLocale()
  const t = translations[locale] || translations.en

  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [tiers, setTiers] = useState<VipTier[]>([])

  useEffect(() => {
    fetchUserData()
    fetchTiers()
  }, [])

  const fetchUserData = async () => {
    const token = getToken()
    
    if (!token) {
      console.log("No token found")
      setUser(null)
      return
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
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

  const fetchTiers = async () => {
    try {
      const response = await fetch(`${API_URL}/vip/tiers`, {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        setTiers(result.data)
      } else {
        setError('Received invalid data format from server')
      }
    } catch (err) {
      setError('Failed to load VIP plans')
    }
  }

  const handlePurchase = async (tierId: string) => {
    if (!tierId) {
      setError('Invalid tier selected')
      return
    }
  
    try {
      setLoading(tierId)
      setError(null)
  
      const token = getToken()
      if (!token) {
        throw new Error(locale === 'pt' ? "Por favor faça login com o Discord" : "Please login to your discord account")
      }
  
      const payload = {
        userId: user?.userId,
        tierId: tierId
      }
  
      const response = await fetch(`${API_URL}/vip/purchase`, {
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
    } finally {
      setLoading(null)
    }
  }

  const getIconForTier = (index: number) => {
    switch(index) {
      case 0: return Star
      case 1: return Zap
      case 2: return Crown
      case 3: return Diamond
      default: return Star
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

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {tiers.map((tier, index) => {
            const IconComponent = getIconForTier(index)
            const isFeatured = index === 1
            const formattedPrice = tier.price.toFixed(2).replace(".", ",")

            return (
              <Card 
                key={tier.id}
                className={`relative flex flex-col border-border transition-all duration-300 hover:border-primary/30 hover:shadow-2xl ${
                  isFeatured ? "ring-2 ring-primary ring-offset-4 ring-offset-background" : ""
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary px-4 py-1 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-sm">
                      {t.mostPopular}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pt-10">
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border ${
                    isFeatured 
                      ? "bg-primary/10 border-primary/20 text-primary" 
                      : "bg-secondary border-border text-foreground"
                  }`}>
                    <IconComponent className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight">{tier.name}</CardTitle>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="mb-8 flex items-baseline gap-1.5">
                    <span className="text-xs font-bold text-muted-foreground">R$</span>
                    <span className="text-5xl font-black tracking-tighter">{formattedPrice}</span>
                    <span className="text-sm font-medium text-muted-foreground">/ {t.perMonth}</span>
                  </div>

                  <div className="space-y-4">
                    <ul className="space-y-3">
                      {tier.benefits.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className={`mt-1 h-4 w-4 shrink-0 rounded-full p-0.5 ${
                            isFeatured ? "bg-primary/20" : "bg-primary/10"
                          }`}>
                            <Check className={`h-3 w-3 ${isFeatured ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <span className="text-sm font-medium leading-tight text-foreground/80">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="pt-8">
                  <Button 
                    onClick={() => handlePurchase(tier.id)}
                    disabled={loading === tier.id}
                    variant={isFeatured ? "default" : "outline"} 
                    className="h-12 w-full rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {loading === tier.id ? (
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
