"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Sparkles, Gift, CheckCircle, HelpCircle, Lock, Coins, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/src/i18n/routing";
import { Navbar } from "@/components/lunna/navbar";
import { api } from "@/lib/api";
import { HCaptcha } from "@/components/lunna/hcaptcha";

// Custom counter hook for ticking up the coins smoothly
function useAnimatedCounter(endValue: number, startValue: number = 0, durationMs: number = 2000) {
  const [count, setCount] = useState(startValue);

  useEffect(() => {
    setCount(startValue);
  }, [startValue]);

  useEffect(() => {
    if (startValue === endValue) return;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      const easeProgress = progress * (2 - progress); // Quadratic ease-out
      const currentVal = Math.floor(easeProgress * (endValue - startValue) + startValue);
      setCount(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [endValue, startValue, durationMs]);

  return count;
}

export default function DailyPage() {
  const t = useTranslations("Daily");
  const [isPending, startTransition] = useTransition();

  // Session state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    coins: number;
    collected: boolean;
    reward: number;
    isVip: boolean;
    vipType: string;
  } | null>(null);

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // For the particle effect
  const [showParticles, setShowParticles] = useState(false);

  // For visual coin counter
  const [visualCoinsStart, setVisualCoinsStart] = useState(0);
  const [visualCoinsEnd, setVisualCoinsEnd] = useState(0);
  const animatedCoins = useAnimatedCounter(visualCoinsEnd, visualCoinsStart, 1500);

  const loginUrl =
    "https://discord.com/oauth2/authorize?client_id=1222333304028659792&response_type=code&redirect_uri=https%3A%2F%2Fapi.lunnabot.fun%2Fv1%2Fauth%2Fdiscord%2Fcallback&scope=guilds+email+identify";

  useEffect(() => {
    async function checkAuthAndStatus() {
      const token =
        typeof window !== "undefined"
          ? document.cookie
              .split("; ")
              .find((row) => row.startsWith("token="))
              ?.split("=")[1] ?? null
          : null;

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        setIsAuthenticated(true);
        const result = await api.getDailyStatus();
        if (result.success) {
          setUserData(result.data);
          setVisualCoinsStart(result.data.coins);
          setVisualCoinsEnd(result.data.coins);
        }
      } catch (err: any) {
        console.error("Daily claim auth check failed:", err);
        // If 401 Unauthorized, clear auth status
        if (err.message?.includes("Unauthorized") || err.message?.includes("Token")) {
          setIsAuthenticated(false);
        } else {
          setErrorMsg(err.message || "Failed to load daily status");
        }
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndStatus();
  }, []);

  const handleClaim = () => {
    if (!captchaToken) {
      setErrorMsg(t("solveCaptcha"));
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      try {
        const result = await api.collectDaily(captchaToken);
        if (result.success) {
          setSuccess(true);
          setShowParticles(true);
          
          // Trigger the animated coin count up
          if (userData) {
            setVisualCoinsStart(userData.coins);
            setVisualCoinsEnd(result.data.newCoins);
            setUserData({
              ...userData,
              collected: true,
              coins: result.data.newCoins,
            });
          }

          // Stop particles after 3s
          setTimeout(() => setShowParticles(false), 3000);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Error claiming daily reward");
        // Reset captcha on failure to force re-solve if needed
        setCaptchaToken(null);
        if (typeof window !== "undefined" && window.hcaptcha) {
          window.hcaptcha.reset();
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
      {/* Decorative gradient glowing spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 mx-auto max-w-[1200px] px-6 py-16 lg:px-8 flex flex-col justify-center items-center w-full z-10">
        
        {/* Navigation & Header */}
        <div className="w-full max-w-lg mb-8 flex flex-col items-start gap-4">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("backHome")}
          </Link>

          <div className="space-y-1">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 px-3 py-1 text-primary">
              <Gift className="mr-2 h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t("badge")}</span>
            </Badge>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic sm:text-5xl">
              {t("titleStart")} <span className="text-primary">{t("titleEnd")}</span>
            </h1>
            <p className="text-muted-foreground font-medium max-w-sm">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Particles display */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => {
              const left = Math.random() * 100;
              const delay = Math.random() * 2;
              const size = Math.random() * 8 + 4;
              return (
                <div
                  key={i}
                  className="absolute bottom-0 bg-yellow-400 rounded-full opacity-70 animate-bounce"
                  style={{
                    left: `${left}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animationDuration: `${Math.random() * 2 + 1}s`,
                    animationDelay: `${delay}s`,
                    transform: `translateY(-${Math.random() * 100}vh)`,
                    transition: "all 3s ease-out",
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Card Component */}
        <Card className="w-full max-w-lg border-border bg-card/60 backdrop-blur-xl shadow-2xl relative overflow-hidden rounded-3xl">
          {/* Subtle line decoration */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {loading ? (
            <div className="p-8 space-y-6">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          ) : !isAuthenticated ? (
            /* Logged Out / Unauthorized state */
            <>
              <CardHeader className="text-center pt-10 pb-6">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center border border-border mb-4">
                  <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight italic">
                  {t("loginToClaim")}
                </CardTitle>
                <CardDescription className="text-sm font-medium px-4">
                  Log in with your Discord account to link your character and redeem daily rewards.
                </CardDescription>
              </CardHeader>
              <CardFooter className="pb-10 pt-4 px-8">
                <Button asChild className="w-full h-14 rounded-2xl font-bold shadow-lg transition-transform hover:scale-[1.02]">
                  <a href={loginUrl} className="flex items-center justify-center gap-2">
                    <Coins className="h-5 w-5" />
                    {t("login")}
                  </a>
                </Button>
              </CardFooter>
            </>
          ) : (
            /* Logged In states */
            <>
              <CardHeader className="flex flex-col items-center pt-8 pb-4">
                <div className="relative mb-3">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                  <Avatar className="h-20 w-20 border-2 border-primary/30">
                    <AvatarImage src="" alt="Discord User" />
                    <AvatarFallback className="bg-secondary text-lg font-black">L</AvatarFallback>
                  </Avatar>
                </div>

                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <CardTitle className="text-xl font-bold">{t("currentBalance")}</CardTitle>
                  </div>
                  {/* Glowing Animated Balance */}
                  <div className="flex items-center justify-center gap-2 text-3xl font-black text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.3)] animate-pulse">
                    <Coins className="h-8 w-8" />
                    <span>{animatedCoins.toLocaleString()}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-8 py-4 space-y-6">
                {errorMsg && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-bold">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {success ? (
                  /* Claim Success State */
                  <div className="text-center p-6 bg-primary/5 border border-primary/20 rounded-2xl space-y-4 animate-fade-in">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-extrabold text-lg text-primary">{t("successClaimed")}</p>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("rewardText", { amount: userData?.reward || 1000 })}
                      </p>
                    </div>
                  </div>
                ) : userData?.collected ? (
                  /* Cooldown state (Already Collected) */
                  <div className="text-center p-6 bg-secondary/30 border border-border rounded-2xl space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-lg">{t("alreadyClaimed")}</p>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("cooldownMessage")}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Claim Available State */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 rounded-2xl bg-secondary/20 border border-border">
                      <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        <span className="font-bold text-sm">Daily Reward Available</span>
                      </div>
                      <div className="font-black text-primary text-lg">
                        +{userData?.reward}
                      </div>
                    </div>

                    {/* Captcha Widget */}
                    <div className="rounded-2xl overflow-hidden border border-border bg-secondary/10 p-2">
                      <HCaptcha
                        onVerify={(token) => setCaptchaToken(token)}
                        onExpire={() => setCaptchaToken(null)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pb-8 pt-2 px-8">
                {userData?.collected || success ? (
                  <Button disabled className="w-full h-14 rounded-2xl font-bold bg-secondary text-muted-foreground border border-border">
                    {t("alreadyClaimed")}
                  </Button>
                ) : (
                  <Button
                    onClick={handleClaim}
                    disabled={!captchaToken || isPending}
                    className="w-full h-14 rounded-2xl font-bold shadow-lg transition-transform hover:scale-[1.02] bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isPending ? t("claiming") : t("claim")}
                  </Button>
                )}
              </CardFooter>
            </>
          )}
        </Card>

        {/* Info footer links */}
        <div className="mt-8 flex gap-4 text-xs font-bold text-muted-foreground">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> VIP rewards have daily bonuses
          </span>
        </div>
      </main>
    </div>
  );
}
