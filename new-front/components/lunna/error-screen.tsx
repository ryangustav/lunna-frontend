"use client"

import { ArrowLeft, Home, LifeBuoy, RotateCcw, Terminal } from "lucide-react"
import { SUPPORT_URL } from "@/lib/site"

export type ErrorKind = "404" | "500" | "403" | "401" | "429" | "503"
type Lang = "pt" | "en"

const TEXT: Record<ErrorKind, Record<Lang, { title: string; message: string }>> = {
  "404": {
    pt: { title: "Ops! Página não encontrada.", message: "Parece que a Lunna se perdeu nas estrelas." },
    en: { title: "Oops! Page not found.", message: "Looks like Lunna got lost among the stars." },
  },
  "500": {
    pt: { title: "Algo deu errado.", message: "Uma estrela caiu no meio do caminho. Tente de novo em instantes." },
    en: { title: "Something went wrong.", message: "A star fell along the way. Please try again in a moment." },
  },
  "403": {
    pt: { title: "Acesso negado.", message: "Essa parte do céu é só para quem tem permissão." },
    en: { title: "Access denied.", message: "This part of the sky is only for those with permission." },
  },
  "401": {
    pt: { title: "Você precisa entrar.", message: "Entre com a sua conta do Discord para continuar." },
    en: { title: "You need to log in.", message: "Log in with your Discord account to continue." },
  },
  "429": {
    pt: { title: "Calma aí!", message: "Muitas tentativas em pouco tempo. Espere um pouquinho e tente de novo." },
    en: { title: "Hold on!", message: "Too many attempts in a short time. Wait a moment and try again." },
  },
  "503": {
    pt: { title: "A Lunna está em manutenção.", message: "Estou arrumando umas estrelas por aqui. Volto logo, prometo!" },
    en: { title: "Lunna is under maintenance.", message: "I'm fixing a few stars up here. I'll be back soon, promise!" },
  },
}

const L = (lang: Lang, pt: string, en: string) => (lang === "en" ? en : pt)

/**
 * Error screen with Lunna's artwork. 404 uses the art with the cracked "404"; every other error
 * uses the art without it and shows its code in text. Always dark, like the artwork.
 */
export function ErrorScreen({
  kind = "404",
  lang = "pt",
  onRetry,
  digest,
}: {
  kind?: ErrorKind
  lang?: Lang
  onRetry?: () => void
  digest?: string
}) {
  const text = TEXT[kind][lang]
  const home = lang === "en" ? "/en" : "/"
  const commands = lang === "en" ? "/en/commands" : "/commands"
  const btn = "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold transition-colors"

  return (
    <section
      className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12 text-white"
      style={{ background: "radial-gradient(ellipse at 50% 35%, #2a1450 0%, #160b2a 45%, #0c0816 100%)" }}
    >
      {/* soft stars behind the art */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60"
        style={{ backgroundImage: "radial-gradient(1px 1px at 20% 30%, #c4b5fd 50%, transparent 51%), radial-gradient(1px 1px at 80% 20%, #ddd6fe 50%, transparent 51%), radial-gradient(1.5px 1.5px at 65% 75%, #a78bfa 50%, transparent 51%), radial-gradient(1px 1px at 35% 85%, #c4b5fd 50%, transparent 51%), radial-gradient(1.5px 1.5px at 10% 65%, #ddd6fe 50%, transparent 51%), radial-gradient(1px 1px at 90% 55%, #c4b5fd 50%, transparent 51%)" }} />

      <div className="relative flex w-full max-w-[560px] flex-col items-center text-center">
        <div className="relative w-full">
          {kind !== "404" && (
            <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#a78bfa]/40 bg-[#1b0f33]/90 px-5 py-1.5 text-[28px] font-black tracking-[4px] text-[#e9e2ff] shadow-[0_0_30px_rgba(167,139,250,0.35)]">
              {kind}
            </span>
          )}
          <img
            src={kind === "404" ? "/errors/lunna-404.webp" : "/errors/lunna-error.webp"}
            alt={L(lang, "Lunna triste, com a mão na cabeça, em frente a uma lua rachada", "Sad Lunna holding her head in front of a cracked moon")}
            width={kind === "404" ? 1024 : 800}
            height={kind === "404" ? 845 : 720}
            className="mx-auto h-auto w-full max-w-[460px] select-none"
            style={{
              // fades the art's edges into the page
              WebkitMaskImage: "radial-gradient(closest-side at 50% 50%, #000 86%, transparent 100%)",
              maskImage: "radial-gradient(closest-side at 50% 50%, #000 86%, transparent 100%)",
            }}
            draggable={false}
          />
        </div>

        <h1 className="mt-2 text-balance text-[28px] font-bold leading-tight sm:text-[32px]">{text.title}</h1>
        <p className="mt-2 max-w-[440px] text-[16px] text-[#c9bfe6]">{text.message}</p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <button onClick={onRetry} className={`${btn} bg-[#7c3aed] text-white hover:bg-[#6d28d9]`}>
              <RotateCcw className="h-4 w-4" /> {L(lang, "Tentar de novo", "Try again")}
            </button>
          )}
          <a href={home} className={`${btn} ${onRetry ? "border border-white/15 bg-white/5 hover:bg-white/10" : "bg-[#7c3aed] hover:bg-[#6d28d9]"}`}>
            <Home className="h-4 w-4" /> {L(lang, "Voltar ao início", "Back to home")}
          </a>
          {kind === "404" && (
            <a href={commands} className={`${btn} border border-white/15 bg-white/5 hover:bg-white/10`}>
              <Terminal className="h-4 w-4" /> {L(lang, "Ver comandos", "See commands")}
            </a>
          )}
          {kind !== "404" && !onRetry && (
            <button onClick={() => history.back()} className={`${btn} border border-white/15 bg-white/5 hover:bg-white/10`}>
              <ArrowLeft className="h-4 w-4" /> {L(lang, "Voltar", "Go back")}
            </button>
          )}
          <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className={`${btn} text-[#c9bfe6] hover:text-white`}>
            <LifeBuoy className="h-4 w-4" /> {L(lang, "Suporte", "Support")}
          </a>
        </div>

        {digest && <p className="mt-6 font-mono text-[11px] text-[#8a7fb0]">{L(lang, "Código do erro", "Error code")}: {digest}</p>}
      </div>
    </section>
  )
}

/** The site language from the URL, for screens rendered outside the [locale] layout. */
export const langFromPath = (path?: string | null): Lang => (path && /^\/en(\/|$)/.test(path) ? "en" : "pt")
