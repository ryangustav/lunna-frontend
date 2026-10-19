"use client"

import Image from "next/image"
import { Link } from "@/src/i18n/routing"
import { HeroStats } from "./hero-stats"
import { HeroBadge } from "./hero-badge"
import { useT } from "@/lib/use-t"

export function Hero() {
  const t = useT()
  return (
    <section
      className="mx-auto w-full max-w-[860px] pt-14"
      style={{ paddingInline: "28px" }}
    >
      <div className="flex flex-col items-center gap-12 md:flex-row md:items-start">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-6">
          <HeroBadge />

          {/* Title */}
          <h1
            className="text-balance text-[42px] font-bold leading-tight tracking-[-1px] text-foreground"
          >
            {t("O coração que seu servidor", "The heart your server")}{" "}
            <em className="not-italic text-[#7c3aed]">{t("precisava.", "needed.")}</em>
          </h1>

          {/* Description */}
          <p
            className="text-[15px] leading-[1.7] text-muted-foreground"
            style={{ maxWidth: "440px" }}
          >
            {t("Lunna transforma seu servidor do Discord com RPG imersivo, economia dinâmica, moderação inteligente com IA e um dashboard completo para gerenciar tudo com facilidade.", "Lunna transforms your Discord server with an immersive RPG, a lively economy, smart AI moderation and a full dashboard to manage it all with ease.")}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://discord.com/oauth2/authorize?client_id=1222333304028659792&permissions=8&scope=bot%20applications.commands"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#7c3aed] px-6 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              {t("Adicionar ao Discord", "Add to Discord")}
            </a>
            <Link
              href="/commands"
              className="rounded-full border border-border bg-card px-6 py-3 text-[14px] font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              {t("Ver comandos", "See commands")}
            </Link>
          </div>
        </div>

        {/* Right column — banner + floating pills */}
        <div className="relative flex shrink-0 justify-center">
          <div
            className="relative overflow-hidden border border-border/70 bg-card"
            style={{
              width: "320px",
              borderRadius: "16px",
            }}
          >
            <Image
              src="/lunna-banner.jpg"
              alt={t("Banner da Lunna", "Lunna banner")}
              width={320}
              height={420}
              className="block h-auto w-full object-cover"
              priority
            />
          </div>

          <HeroStats />
        </div>
      </div>
    </section>
  )
}
