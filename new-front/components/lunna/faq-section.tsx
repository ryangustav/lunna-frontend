import { BOT_ID, INVITE_URL, SITE_URL, SUPPORT_URL, TOPGG_URL } from "@/lib/site"

type QA = { q: string; a: string }

// Questions people search for, answered on the page and as schema.org FAQPage
const FAQ: Record<"pt" | "en", QA[]> = {
  pt: [
    { q: "O que é a Lunna?", a: "A Lunna é um bot de Discord brasileiro, em português e inglês, com RPG (masmorras, PvP, guildas, mercado e jardim), economia com Lunar Coins e daily, minigames, moderação com IA, níveis e XP, tickets, sorteios, cargos por botão, alertas do YouTube, Twitch e RSS, boas-vindas com banner e um dashboard web completo." },
    { q: "Qual é a Lunna oficial?", a: `A Lunna oficial é a do site ${SITE_URL.replace("https://", "")}, com o ID de aplicativo ${BOT_ID}. Ela é adicionada pelo botão deste site e está no top.gg em ${TOPGG_URL.replace("https://", "")}. Bots com o mesmo nome e outro ID não são a Lunna oficial.` },
    { q: "Como adicionar a Lunna ao meu servidor?", a: `Clique em "Adicionar ao Discord" neste site (ou use ${INVITE_URL}), escolha o servidor e confirme. Depois configure tudo pelo dashboard em ${SITE_URL}/dashboard.` },
    { q: "A Lunna é gratuita?", a: "Sim. Todos os recursos principais são gratuitos. O Premium do servidor e o VIP pessoal são opcionais e dão vantagens extras, como mais contadores de membros, o Cérebro da Lunna (IA com o FAQ do servidor) e daily maior." },
    { q: "Quais são os comandos da Lunna?", a: "Entre os principais: /rpg, /dungeon, /pvp, /market, /daily, /pay, /saldo, /work, /rank, /xp, /ticket, /sorteio, /ban, /kick, /mute, /warn e /clear. A lista completa, com a forma de uso, está na página de comandos." },
    { q: "A Lunna tem moderação automática?", a: "Sim: anti-spam, bloqueio de convites e links, filtro de palavras pelo AutoMod do Discord, canal armadilha contra bots de spam, avisos com punições automáticas e logs de mensagens, membros, voz e moderação." },
    { q: "A Lunna funciona em inglês?", a: "Sim. Cada pessoa escolhe o próprio idioma (/linguagem ou o site) e cada servidor escolhe o idioma das mensagens que a Lunna posta, como logs, tickets e boas-vindas." },
    { q: "Onde peço ajuda?", a: `No servidor de suporte oficial: ${SUPPORT_URL}.` },
  ],
  en: [
    { q: "What is Lunna?", a: "Lunna is a Discord bot, in English and Portuguese, with an RPG (dungeons, PvP, guilds, market and garden), an economy with Lunar Coins and daily rewards, minigames, AI moderation, levels and XP, tickets, giveaways, button roles, YouTube, Twitch and RSS alerts, welcome banners and a full web dashboard." },
    { q: "Which Lunna is the official one?", a: `The official Lunna is the one from ${SITE_URL.replace("https://", "")}, with application ID ${BOT_ID}. It is added through this site's button and is listed on top.gg at ${TOPGG_URL.replace("https://", "")}. Bots with the same name and a different ID are not the official Lunna.` },
    { q: "How do I add Lunna to my server?", a: `Click "Add to Discord" on this site (or use ${INVITE_URL}), pick your server and confirm. Then set everything up in the dashboard at ${SITE_URL}/en/dashboard.` },
    { q: "Is Lunna free?", a: "Yes. All the main features are free. Server Premium and personal VIP are optional and add extras, such as more member counters, Lunna's Brain (AI with your server's FAQ) and a bigger daily." },
    { q: "What are Lunna's commands?", a: "The main ones include /rpg, /dungeon, /pvp, /market, /daily, /pay, /balance, /work, /rank, /xp, /ticket, /giveaway, /ban, /kick, /mute, /warn and /clear. The full list, with usage, is on the commands page." },
    { q: "Does Lunna have auto-moderation?", a: "Yes: anti-spam, invite and link blocking, a word filter through Discord's AutoMod, a trap channel against spam bots, warnings with automatic punishments, and message, member, voice and moderation logs." },
    { q: "Does Lunna speak English?", a: "Yes. Each person picks their own language (/language or the website) and each server picks the language of the messages Lunna posts, like logs, tickets and welcomes." },
    { q: "Where can I get help?", a: `In the official support server: ${SUPPORT_URL}.` },
  ],
}

export function FaqSection({ locale }: { locale: string }) {
  const lang = locale === "en" ? "en" : "pt"
  const items = FAQ[lang]
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  }
  return (
    <section id="faq" className="mx-auto mt-16 w-full max-w-[860px]" style={{ paddingInline: "28px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="mb-8 flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[2px] text-primary">FAQ</span>
        <h2 className="text-balance text-[26px] font-bold leading-tight tracking-[-0.5px] text-foreground">
          {lang === "en" ? "Frequently asked questions about Lunna" : "Perguntas frequentes sobre a Lunna"}
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((i) => (
          <details key={i.q} className="group rounded-[14px] border border-border bg-card px-5 py-4">
            <summary className="cursor-pointer list-none text-[15px] font-semibold text-foreground marker:hidden">
              <h3 className="inline">{i.q}</h3>
            </summary>
            <p className="mt-3 text-[14px] leading-[1.7] text-muted-foreground">{i.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
