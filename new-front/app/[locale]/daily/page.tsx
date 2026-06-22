"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
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
    username?: string;
    avatar?: string;
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
        const [statusResult, userResult] = await Promise.all([
          api.getDailyStatus(),
          api.getCurrentUser()
        ]);
        
        if (statusResult.success && userResult.success) {
          setUserData({
            ...statusResult.data,
            username: userResult.data.username,
            avatar: userResult.data.avatar
          });
          setVisualCoinsStart(statusResult.data.coins);
          setVisualCoinsEnd(statusResult.data.coins);
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
              reward: result.data.reward, // Actual random reward returned by backend
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
        <Card className="w-full max-w-lg border-purple-500/20 bg-card/60 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(124,58,237,0.3)] relative overflow-hidden rounded-3xl hover:border-purple-500/30 transition-all duration-500">
          {/* Cover Banner with Lunna Character */}
          <div className="relative w-full h-48 overflow-hidden bg-[#0f0714]">
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7c3aed]/40 rounded-full blur-2xl z-0 animate-pulse" />
            <Image
              src="/lunna-banner.jpg"
              alt="Lunna Character"
              fill
              className="object-cover object-center transform scale-102 hover:scale-108 transition-transform duration-[4000ms] opacity-80"
              priority
            />
            {/* Glass decoration overlay */}
            <div className="absolute top-4 left-4 z-20">
              <Badge className="bg-[#7c3aed] text-white border-none px-3 py-1 font-bold shadow-lg shadow-purple-500/20">
                Daily Reward
              </Badge>
            </div>
          </div>

          {loading ? (
            <div className="p-8 space-y-6 pt-10">
              <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          ) : !isAuthenticated ? (
            /* Logged Out / Unauthorized state */
            <>
              <CardHeader className="text-center pt-8 pb-6 relative z-20">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/5">
                  <Lock className="h-8 w-8 text-purple-400" />
                </div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight italic text-foreground">
                  {t("loginToClaim")}
                </CardTitle>
                <CardDescription className="text-sm font-medium px-4 text-muted-foreground/80">
                  Faça login com sua conta do Discord para vincular seu perfil e resgatar recompensas.
                </CardDescription>
              </CardHeader>
              <CardFooter className="pb-10 pt-4 px-8">
                <Button asChild className="w-full h-14 rounded-2xl font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-lg shadow-purple-500/20 transition-transform hover:scale-[1.02]">
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
              <CardHeader className="flex flex-col items-center pt-0 pb-4 relative z-20">
                {/* Overlapping User Avatar */}
                <div className="relative mb-3 mt-[-48px]">
                  <div className="absolute inset-0 bg-[#7c3aed]/40 rounded-full blur-xl" />
                  <Avatar className="h-24 w-24 border-4 border-background transition-transform hover:scale-105 duration-300 shadow-xl">
                    <AvatarImage src={userData?.avatar || ""} alt={userData?.username || "Discord User"} className="object-cover" />
                    <AvatarFallback className="bg-purple-950 text-purple-200 text-xl font-black uppercase">
                      {(userData?.username || "L").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-400/90">{userData?.username}</span>
                  </div>
                  <CardTitle className="text-md font-bold text-muted-foreground">{t("currentBalance")}</CardTitle>
                  
                  {/* Glowing Animated Balance */}
                  <div className="flex items-center justify-center gap-2 text-3xl font-black text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]">
                    <Coins className="h-8 w-8 text-yellow-500" />
                    <span>{animatedCoins.toLocaleString()}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-8 py-4 space-y-6">
                {errorMsg && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-bold animate-shake">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {success ? (
                  /* Claim Success State */
                  <div className="text-center p-6 bg-purple-950/20 border border-purple-500/30 rounded-2xl space-y-4 animate-scale-up shadow-inner">
                    <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/10">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-extrabold text-lg text-purple-300">{t("successClaimed")}</p>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("rewardText", { amount: userData?.reward || 1000 })}
                      </p>
                    </div>
                  </div>
                ) : userData?.collected ? (
                  /* Cooldown state (Already Collected) */
                  <div className="text-center p-6 bg-secondary/20 border border-border rounded-2xl space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-lg text-foreground/90">{t("alreadyClaimed")}</p>
                      <p className="text-sm font-medium text-muted-foreground/80">
                        {t("cooldownMessage")}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Claim Available State */
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 shadow-inner">
                      <Gift className="h-5 w-5 text-purple-400 animate-bounce" />
                      <span className="font-extrabold text-sm text-purple-200">
                        {userData?.isVip ? "Sua recompensa diária VIP está pronta!" : "Sua recompensa diária está pronta!"}
                      </span>
                    </div>

                    {/* Captcha Widget */}
                    <div className="rounded-2xl overflow-hidden border border-purple-500/10 bg-purple-950/5 p-2 shadow-inner">
                      <HCaptcha
                        onVerify={(token) => setCaptchaToken(token)}
                        onExpire={() => setCaptchaToken(null)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pb-8 pt-2 px-8 flex flex-col gap-4 w-full">
                {userData?.collected || success ? (
                  <Button disabled className="w-full h-14 rounded-2xl font-bold bg-secondary/50 text-muted-foreground border border-border">
                    {t("alreadyClaimed")}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleClaim}
                      disabled={!captchaToken || isPending}
                      className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-purple-500/20 transition-transform hover:scale-[1.02] bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:bg-secondary disabled:text-muted-foreground"
                    >
                      {isPending ? t("claiming") : t("claim")}
                    </Button>
                    <p className="text-center text-[11px] font-medium text-muted-foreground/80 leading-relaxed px-4">
                      {t.rich("agreementText", {
                        guidelines: (chunks) => (
                          <Link href="/guidelines" className="text-purple-400 hover:text-purple-300 font-bold underline transition-colors">
                            {chunks}
                          </Link>
                        ),
                        privacy: (chunks) => (
                          <Link href="/privacy" className="text-purple-400 hover:text-purple-300 font-bold underline transition-colors">
                            {chunks}
                          </Link>
                        )
                      })}
                    </p>
                  </>
                )}
              </CardFooter>
            </>
          )}
        </Card>

        {/* Info footer links */}
        <div className="mt-8 flex gap-4 text-xs font-bold text-purple-400">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> VIP rewards have daily bonuses
          </span>
        </div>
      </main>
    </div>
  );
}
