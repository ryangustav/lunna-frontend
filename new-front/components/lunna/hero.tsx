import Image from "next/image"

function FloatingPill({
  dotColor,
  text,
  className,
  animationClass,
}: {
  dotColor: string
  text: string
  className?: string
  animationClass: string
}) {
  return (
    <div
      className={`absolute flex items-center gap-2 rounded-full border border-border/70 bg-card/95 px-3 py-2 text-[12px] font-semibold text-foreground shadow-sm backdrop-blur ${animationClass} ${className}`}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      {text}
    </div>
  )
}

export function Hero() {
  return (
    <section
      className="mx-auto w-full max-w-[860px] pt-14"
      style={{ paddingInline: "28px" }}
    >
      <div className="flex flex-col items-center gap-12 md:flex-row md:items-start">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Badge */}
          <div className="flex">
            <span
              className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[13px] font-semibold text-primary"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Online agora em 2.400+ servidores
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-balance text-[42px] font-bold leading-tight tracking-[-1px] text-foreground"
          >
            O coração que seu servidor{" "}
            <em className="not-italic text-[#7c3aed]">precisava.</em>
          </h1>

          {/* Description */}
          <p
            className="text-[15px] leading-[1.7] text-muted-foreground"
            style={{ maxWidth: "440px" }}
          >
            Lunna transforma seu servidor do Discord com RPG imersivo, economia dinâmica, moderação inteligente com IA e um dashboard completo para gerenciar tudo com facilidade.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#"
              className="rounded-full bg-[#7c3aed] px-6 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Adicionar ao Discord
            </a>
            <a
              href="/commands"
              className="rounded-full border border-border bg-card px-6 py-3 text-[14px] font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Ver comandos
            </a>
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
              alt="Banner da Lunna"
              width={320}
              height={420}
              className="block h-auto w-full object-cover"
              priority
            />
          </div>

          {/* Floating pill — top left */}
          <FloatingPill
            dotColor="#4ade80"
            text="47 membros online"
            animationClass="animate-float"
            className="-left-8 top-8"
          />

          {/* Floating pill — center left */}
          <FloatingPill
            dotColor="#a78bfa"
            text="Masmorra desbloqueada"
            animationClass="animate-float-delayed"
            className="-left-10 top-1/2 -translate-y-1/2"
          />

          {/* Floating pill — bottom right */}
          <FloatingPill
            dotColor="#f9a8d4"
            text="1.200 moedas ganhas"
            animationClass="animate-float-slow"
            className="-right-8 bottom-10"
          />
        </div>
      </div>
    </section>
  )
}
