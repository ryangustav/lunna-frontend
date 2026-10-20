"use client"

import React from "react"
import { Shield, Database, Eye, Lock, ArrowLeft, Coins, UserCheck, Clock, Scale, Bell, HelpCircle, MessageSquare, Share2, Baby } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "@/src/i18n/routing"
import { Navbar } from "@/components/lunna/navbar"
import { useLocale } from "next-intl"

/*
 * Keep this page true to the code. If a feature starts storing or sharing something new,
 * update the matching section (data, message content, operators, retention).
 */
type Row = { label: string; value: string }
type T = {
  title: string; lastUpdated: string; back: string; summary: string
  collect: { title: string; intro: string; groups: { name: string; items: string[] }[] }
  messages: { title: string; intro: string; items: Row[]; never: string }
  use: { title: string; items: string[] }
  sharing: { title: string; intro: string; items: Row[]; footer: string }
  retention: { title: string; items: Row[] }
  rights: { title: string; intro: string; items: string[]; how: string }
  security: { title: string; paragraphs: string[] }
  children: { title: string; content: string }
  virtualCurrency: { title: string; paragraphs: string[] }
  liability: { title: string; paragraphs: string[] }
  disclaimer: { title: string; content: string }
  acknowledgement: { title: string; content: string }
  updates: { title: string; content: string }
  contact: { title: string; content: string; discord: string }
}

const translations: Record<string, T> = {
  pt: {
    title: "Política de Privacidade",
    lastUpdated: "Última atualização: 18 de outubro de 2026",
    back: "Voltar ao início",
    summary: "A Lunna é um bot de Discord e um site (lunnabot.fun) mantidos por Ryan Gustavo (Onlykgzin). Coletamos só o necessário para o bot funcionar: seus dados públicos do Discord, o seu progresso nos jogos e na economia, e o que os admins configuram nos servidores. A Lunna não lê as conversas dos servidores: ela só recebe o texto das mensagens que a mencionam ou respondem a ela. Não vendemos dados, não usamos mensagens para treinar IA, e você pode pedir para ver ou apagar os seus dados a qualquer momento.",
    collect: {
      title: "Dados que coletamos",
      intro: "Separados por origem, para ficar claro o que é guardado e por quê:",
      groups: [
        { name: "Conta do Discord", items: ["ID, nome de usuário e avatar", "Lista de servidores (só quando você entra no site, para mostrar onde você é admin)", "E-mail (só quando você entra no site, pelo login do Discord), para identificar a conta, pagamentos e suporte"] },
        { name: "Uso da Lunna", items: ["Moedas, inventário, cosméticos, níveis/XP, RPG, sequências e conquistas", "Histórico de transações e movimentações de moedas", "Configurações de idioma e de notificações (por exemplo, se você desativou alertas automáticos)"] },
        { name: "Segurança e antifraude", items: ["Endereço IP, só ao resgatar o daily no site, para impedir o uso de várias contas", "Sinalizações e banimentos aplicados pela equipe da Lunna, com o motivo"] },
        { name: "Pagamentos", items: ["ID da transação, plano, valor e status (os dados do cartão ou do Pix ficam com o processador de pagamento, nunca conosco)"] },
        { name: "Servidores (definido pelos admins)", items: ["Configurações do dashboard: canais, cargos, mensagens de boas-vindas, níveis, tickets, painéis de cargos, filtros e automações", "Registros de moderação (avisos e punições) e tickets (quem abriu, motivo e status — não o texto da conversa)", "Pedidos feitos à Lunna IA pelos admins e o que ela executou"] },
      ],
    },
    messages: {
      title: "Conteúdo de mensagens",
      intro: "Como a Lunna trata o texto das mensagens do Discord:",
      items: [
        { label: "Conversas dos servidores", value: "A Lunna não lê as conversas. O Discord só envia a ela o texto das mensagens que a mencionam, que respondem a ela ou que são enviadas na DM com ela." },
        { label: "Mensagens para a IA", value: "Quando você menciona a Lunna, o texto (e imagens ou arquivos de texto anexados) é enviado ao Anthropic (Claude) para gerar a resposta. As últimas 3 trocas ficam na memória por até 15 minutos para manter o contexto e não são gravadas em banco de dados." },
        { label: "Lunna IA (admins)", value: "O texto do pedido do admin e os passos executados ficam no histórico de pedidos do servidor, visível no dashboard para os admins daquele servidor." },
        { label: "Logs de mensagens apagadas e editadas", value: "Só em servidores cujos admins ativaram os logs, e só nas versões da Lunna com permissão de conteúdo de mensagens (como a Lunna Canary). O texto das mensagens recentes fica apenas na memória, por no máximo 24 horas e até 200 mensagens por canal, para que, se uma mensagem for apagada ou editada, o texto apareça no canal de log daquele servidor. Esse texto não é gravado em banco de dados e some ao fim do prazo, quando o log é desativado ou quando a Lunna sai do servidor." },
      ],
      never: "Nunca vendemos mensagens, nunca as usamos para treinar modelos de IA e nunca as mostramos fora do servidor onde foram enviadas.",
    },
    use: {
      title: "Para que usamos",
      items: ["Fazer os comandos, jogos, a economia e o dashboard funcionarem", "Processar compras de VIP, moedas e Premium", "Impedir fraude, abuso e uso de várias contas", "Responder pedidos de suporte", "Avisar sobre mudanças importantes, manutenções e incidentes de segurança", "Melhorar o bot com estatísticas de uso agregadas (sem ler conversas)"],
    },
    sharing: {
      title: "Com quem compartilhamos",
      intro: "Usamos alguns serviços para operar a Lunna. Eles recebem só o necessário para a sua parte do trabalho:",
      items: [
        { label: "Discord", value: "plataforma onde o bot funciona e login do site" },
        { label: "Anthropic (Claude)", value: "texto e anexos das mensagens enviadas à IA, para gerar respostas" },
        { label: "Prodia", value: "o texto do pedido de geração de imagem (/imagine)" },
        { label: "Stripe e Mercado Pago", value: "dados necessários para processar pagamentos" },
        { label: "MongoDB Atlas e Discloud", value: "banco de dados e hospedagem do bot e do site" },
      ],
      footer: "Não vendemos nem alugamos dados pessoais. Podemos compartilhar informações se a lei exigir (por exemplo, ordem judicial).",
    },
    retention: {
      title: "Por quanto tempo guardamos",
      items: [
        { label: "Conta, economia e progresso", value: "enquanto você usar a Lunna, ou até pedir a exclusão" },
        { label: "Movimentações de moedas", value: "180 dias (são apagadas automaticamente)" },
        { label: "Texto de mensagens (logs)", value: "até 24 horas, só na memória" },
        { label: "Conversa com a IA", value: "até 15 minutos, só na memória" },
        { label: "Endereços IP (antifraude)", value: "enquanto a conta existir, ou até pedir a exclusão" },
        { label: "Pagamentos", value: "pelo prazo exigido pela legislação fiscal" },
        { label: "Configurações e histórico de servidores", value: "enquanto a Lunna estiver no servidor, ou até os admins apagarem" },
      ],
    },
    rights: {
      title: "Seus direitos (LGPD)",
      intro: "Pela Lei Geral de Proteção de Dados (art. 18), você pode pedir a qualquer momento:",
      items: ["Confirmação de que tratamos seus dados e acesso a eles", "Correção de dados incompletos ou errados", "Exclusão, anonimização ou bloqueio de dados", "Portabilidade dos seus dados", "Informação sobre com quem compartilhamos", "Revogação do consentimento e desativação de alertas automáticos"],
      how: "Para exercer qualquer direito, fale com a equipe no servidor de suporte. Respondemos em até 15 dias. Alertas automáticos por mensagem direta podem ser desativados com o botão que vem na própria mensagem.",
    },
    security: {
      title: "Segurança",
      paragraphs: [
        "O acesso aos dados é restrito à equipe responsável pela Lunna. O painel de administração exige login recente, registra cada consulta e cada ação, e nunca exibe IPs, e-mails ou tokens.",
        "Se acontecer um incidente de segurança que possa afetar você, avisaremos pelo site e pelo bot com o que aconteceu, quais dados foram envolvidos, os riscos e as medidas tomadas, como prevê a LGPD (art. 48).",
      ],
    },
    children: {
      title: "Idade mínima",
      content: "A Lunna segue a idade mínima exigida pelo Discord para ter uma conta. Se você é responsável por um menor e acredita que ele nos forneceu dados indevidamente, fale com a gente para removermos.",
    },
    virtualCurrency: {
      title: "Moeda virtual e itens virtuais",
      paragraphs: [
        "O Serviço pode oferecer a oportunidade de adquirir moeda virtual (\"Moeda Virtual\") ou itens virtuais (\"Itens Virtuais\"), o que pode exigir o pagamento de uma taxa em moeda corrente (\"dinheiro real\"). Todas as compras de Moeda Virtual são finais e não reembolsáveis, não trocáveis e intransferíveis, exceto a critério exclusivo da Empresa ou do provedor da plataforma. A compra, venda ou troca de Moeda Virtual fora do Serviço é estritamente proibida. Qualquer violação desta disposição pode resultar no encerramento da sua Conta e/ou em medidas legais.",
        "A Empresa se reserva o direito de, a seu exclusivo critério, modificar, gerenciar, regular ou remover Moeda Virtual e/ou Itens Virtuais a qualquer momento. Preços e disponibilidade de Itens Virtuais estão sujeitos a alteração sem aviso prévio. A Empresa não será responsável perante você ou terceiros pelo exercício desses direitos.",
        "Você recebe uma licença limitada, pessoal, intransferível e não sublicenciável para usar Itens Virtuais e Moeda Virtual exclusivamente no Serviço, desde que tenham sido ganhos, comprados ou obtidos de forma autorizada pela Empresa. Você reconhece que não possui direitos de propriedade, título ou interesse sobre quaisquer Itens Virtuais ou Moeda Virtual disponibilizados pelo Serviço.",
        "Em caso de estorno (chargeback), a Empresa se reserva o direito de emitir um aviso sobre a violação ou de suspender ou encerrar imediatamente todas as Contas associadas ao seu uso do Serviço. Além disso, a Empresa pode, a seu critério, suspender ou encerrar outras contas vinculadas a você em diferentes serviços.",
      ],
    },
    liability: {
      title: "Limitação de responsabilidade",
      paragraphs: [
        "Na extensão máxima permitida por lei, em nenhuma circunstância a Empresa será responsável perante você ou terceiros por danos consequenciais, incidentais, especiais, punitivos ou outros danos indiretos, incluindo, entre outros, lucros cessantes ou perda de dados, decorrentes do uso do Serviço ou de materiais acessados ou baixados por meio dele.",
        "A responsabilidade total da Empresa perante você não excederá o maior valor entre: (a) o total pago por você à Empresa nos três (3) meses anteriores à data da primeira reclamação, ou (b) US$ 100.",
        "As limitações acima não excluem responsabilidades nem alteram direitos que não possam ser excluídos pela legislação aplicável, incluindo o Código de Defesa do Consumidor e a LGPD.",
        "A Empresa não é responsável por conteúdo enviado por usuários nem por conduta difamatória, ofensiva ou ilegal de terceiros.",
      ],
    },
    disclaimer: {
      title: "Isenção de garantia",
      content: "Os Serviços são fornecidos \"no estado em que se encontram\", sem garantias de qualquer tipo, expressas ou implícitas. Embora nos esforcemos para oferecer uma boa experiência, não garantimos que os Serviços estarão sempre seguros, livres de erros ou sem interrupções.",
    },
    acknowledgement: {
      title: "Concordância",
      content: "Ao usar qualquer um dos nossos serviços, você declara que leu esta política, a entendeu e concorda com ela.",
    },
    updates: {
      title: "Atualizações desta política",
      content: "Podemos atualizar esta política. Mudanças importantes serão avisadas pelo site e pelo bot, e a data no topo desta página sempre mostra a versão atual.",
    },
    contact: {
      title: "Fale conosco",
      content: "Dúvidas, pedidos de acesso ou exclusão de dados: fale com a equipe no nosso servidor de suporte.",
      discord: "Servidor de suporte",
    },
  },
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: October 18, 2026",
    back: "Back to Home",
    summary: "Lunna is a Discord bot and a website (lunnabot.fun) run by Ryan Gustavo (Onlykgzin). We only collect what the bot needs to work: your public Discord data, your progress in games and the economy, and what admins configure in their servers. Lunna does not read server conversations: it only receives the text of messages that mention it or reply to it. We don't sell data, we don't use messages to train AI, and you can ask to see or delete your data at any time.",
    collect: {
      title: "Information we collect",
      intro: "Grouped by source, so it's clear what is stored and why:",
      groups: [
        { name: "Discord account", items: ["ID, username and avatar", "Server list (only when you log in to the website, to show where you are an admin)", "Email (only when you log in to the website, through Discord login), to identify the account, payments and support"] },
        { name: "Using Lunna", items: ["Coins, inventory, cosmetics, levels/XP, RPG, streaks and achievements", "Transaction and coin movement history", "Language and notification settings (for example, if you turned off automatic alerts)"] },
        { name: "Security and anti-fraud", items: ["IP address, only when claiming the daily reward on the website, to prevent multiple accounts", "Flags and bans applied by the Lunna team, with the reason"] },
        { name: "Payments", items: ["Transaction ID, plan, amount and status (card or Pix details stay with the payment processor, never with us)"] },
        { name: "Servers (set by admins)", items: ["Dashboard settings: channels, roles, welcome messages, levels, tickets, role panels, filters and automations", "Moderation records (warnings and punishments) and tickets (who opened, reason and status — not the conversation text)", "Requests made to Lunna AI by admins and what it executed"] },
      ],
    },
    messages: {
      title: "Message content",
      intro: "How Lunna handles the text of Discord messages:",
      items: [
        { label: "Server conversations", value: "Lunna does not read conversations. Discord only sends it the text of messages that mention it, reply to it or are sent in a DM with it." },
        { label: "Messages to the AI", value: "When you mention Lunna, the text (and attached images or text files) is sent to Anthropic (Claude) to generate the answer. The last 3 exchanges stay in memory for up to 15 minutes to keep context and are not written to a database." },
        { label: "Lunna AI (admins)", value: "The admin's request text and the executed steps are kept in the server's request history, visible in the dashboard to that server's admins." },
        { label: "Deleted and edited message logs", value: "Only in servers whose admins turned the logs on, and only in Lunna versions with the message content permission (such as Lunna Canary). The text of recent messages is kept in memory only, for at most 24 hours and up to 200 messages per channel, so that if a message is deleted or edited its text can be shown in that server's log channel. This text is never written to a database and is gone at the end of that window, when the log is turned off or when Lunna leaves the server." },
      ],
      never: "We never sell messages, never use them to train AI models and never show them outside the server where they were sent.",
    },
    use: {
      title: "How we use it",
      items: ["Running commands, games, the economy and the dashboard", "Processing VIP, coin and Premium purchases", "Preventing fraud, abuse and multiple accounts", "Answering support requests", "Notifying about important changes, maintenance and security incidents", "Improving the bot with aggregated usage statistics (without reading conversations)"],
    },
    sharing: {
      title: "Who we share it with",
      intro: "We use a few services to run Lunna. They only receive what their part of the work needs:",
      items: [
        { label: "Discord", value: "the platform the bot runs on, and the website login" },
        { label: "Anthropic (Claude)", value: "text and attachments of messages sent to the AI, to generate answers" },
        { label: "Prodia", value: "the text of image generation requests (/imagine)" },
        { label: "Stripe and Mercado Pago", value: "the data needed to process payments" },
        { label: "MongoDB Atlas and Discloud", value: "database and hosting for the bot and website" },
      ],
      footer: "We don't sell or rent personal data. We may share information when required by law (for example, a court order).",
    },
    retention: {
      title: "How long we keep it",
      items: [
        { label: "Account, economy and progress", value: "while you use Lunna, or until you ask for deletion" },
        { label: "Coin movements", value: "180 days (deleted automatically)" },
        { label: "Message text (logs)", value: "up to 24 hours, in memory only" },
        { label: "AI conversation", value: "up to 15 minutes, in memory only" },
        { label: "IP addresses (anti-fraud)", value: "while the account exists, or until you ask for deletion" },
        { label: "Payments", value: "for the period required by tax law" },
        { label: "Server settings and history", value: "while Lunna is in the server, or until its admins delete them" },
      ],
    },
    rights: {
      title: "Your rights",
      intro: "Under Brazil's data protection law (LGPD, art. 18) and similar laws, you can ask at any time for:",
      items: ["Confirmation that we process your data, and access to it", "Correction of incomplete or wrong data", "Deletion, anonymization or blocking of data", "Portability of your data", "Information about who we share it with", "Withdrawal of consent and turning off automatic alerts"],
      how: "To exercise any right, contact the team on the support server. We answer within 15 days. Automatic direct-message alerts can be turned off with the button in the message itself.",
    },
    security: {
      title: "Security",
      paragraphs: [
        "Access to data is restricted to the team responsible for Lunna. The admin panel requires a recent login, records every lookup and action, and never displays IPs, emails or tokens.",
        "If a security incident that may affect you happens, we will announce it on the website and in the bot with what happened, which data was involved, the risks and the measures taken, as required by LGPD (art. 48).",
      ],
    },
    children: {
      title: "Minimum age",
      content: "Lunna follows the minimum age Discord requires to have an account. If you are responsible for a minor and believe they gave us data improperly, contact us so we can remove it.",
    },
    virtualCurrency: {
      title: "Virtual Currency and Virtual Goods",
      paragraphs: [
        "The Service may offer the opportunity to acquire virtual currency (\"Virtual Currency\") or virtual goods (\"Virtual Goods\"), which may require payment of a fee using legal tender (\"real money\"). All purchases of Virtual Currency are final and non-refundable, non-exchangeable, and non-transferable, except at the sole discretion of the Company or the platform provider. The purchase, sale, or exchange of Virtual Currency outside the Service is strictly prohibited. Any violation of this provision may result in the termination of your Account and/or legal action.",
        "The Company reserves the right, at its sole discretion, to modify, manage, regulate, or remove Virtual Currency and/or Virtual Goods at any time. Prices and availability of Virtual Goods are subject to change without prior notice. The Company shall not be liable to you or any third party for the exercise of these rights.",
        "You are granted a limited, personal, non-transferable, and non-sublicensable license to use Virtual Goods and Virtual Currency solely within the Service, provided that they have been earned, purchased, or otherwise obtained in a manner authorized by the Company. You acknowledge that you have no ownership rights, title, or interest in any Virtual Goods or Virtual Currency made available through the Service.",
        "In the event of a chargeback, the Company reserves the right to issue a warning regarding the violation or to immediately suspend or terminate any and all Accounts associated with your use of the Service. Additionally, the Company may, at its discretion, suspend or terminate other accounts linked to you across different services.",
      ],
    },
    liability: {
      title: "Limitation of Liability",
      paragraphs: [
        "To the maximum extent permitted by law, under no circumstances shall the Company be liable to you or any third party for any consequential, incidental, special, punitive, or other indirect damages, including but not limited to lost profits or lost data, arising from your use of the Service or any materials accessed through or downloaded from the Service.",
        "The Company's total liability to you shall not exceed the greater of: (a) the total amount you have paid to the Company in the three (3) months immediately preceding the date on which you first assert a claim, or (b) $100.",
        "These limitations do not exclude liability or alter rights that cannot be lawfully excluded under applicable law, including consumer protection and data protection laws.",
        "The Company shall not be responsible for user-generated content or for any defamatory, offensive, or illegal conduct of any third party.",
      ],
    },
    disclaimer: {
      title: "Disclaimer of Warranty",
      content: "The Services are provided \"as is\" without any warranties of any kind, either express or implied. While we strive to provide a good experience, we cannot and do not warrant that the Services will always be secure, error-free, or uninterrupted.",
    },
    acknowledgement: {
      title: "Acknowledgement",
      content: "By using any of our services you confirm that you have read this policy, understand it and agree to it.",
    },
    updates: {
      title: "Updates to This Policy",
      content: "We may update this policy. Important changes will be announced on the website and in the bot, and the date at the top of this page always shows the current version.",
    },
    contact: {
      title: "Contact Us",
      content: "Questions, data access or deletion requests: talk to the team on our support server.",
      discord: "Support server",
    },
  },
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-secondary [&_svg]:h-6 [&_svg]:w-6 [&_svg]:text-primary">{icon}</div>
        <h2 className="text-2xl font-black tracking-tight">{title}</h2>
      </div>
      {children}
      <div className="h-px bg-border/50 pt-8" />
    </section>
  )
}

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground">
        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
        {item}
      </li>
    ))}
  </ul>
)

const Rows = ({ items }: { items: Row[] }) => (
  <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border">
    {items.map((r, i) => (
      <div key={i} className="grid gap-1 bg-secondary/20 p-4 sm:grid-cols-[220px_1fr] sm:gap-4">
        <dt className="text-sm font-bold text-foreground">{r.label}</dt>
        <dd className="text-sm leading-relaxed text-muted-foreground">{r.value}</dd>
      </div>
    ))}
  </dl>
)

export default function PrivacyPage() {
  const locale = useLocale()
  const t = translations[locale] || translations.en

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-[1200px] px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 flex flex-col items-center text-center">
            <Link href="/" className="group mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {t.back}
            </Link>
            <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/5 px-4 py-1.5 text-primary">
              <Shield className="mr-2 h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Legal</span>
            </Badge>
            <h1 className="mb-4 text-4xl font-black tracking-tighter sm:text-6xl md:text-7xl">{t.title}</h1>
            <p className="text-lg font-medium text-muted-foreground">{t.lastUpdated}</p>
          </div>

          <p className="mx-auto mb-12 max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center text-lg leading-relaxed text-foreground/90">{t.summary}</p>

          <Card className="border-border bg-card shadow-sm">
            <CardContent className="space-y-16 p-8 md:p-12">
              <Section icon={<Database />} title={t.collect.title}>
                <p className="font-medium text-muted-foreground">{t.collect.intro}</p>
                <div className="space-y-6">
                  {t.collect.groups.map((g) => (
                    <div key={g.name} className="space-y-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80">{g.name}</h3>
                      <Bullets items={g.items} />
                    </div>
                  ))}
                </div>
              </Section>

              <Section icon={<MessageSquare />} title={t.messages.title}>
                <p className="font-medium text-muted-foreground">{t.messages.intro}</p>
                <Rows items={t.messages.items} />
                <p className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm font-semibold text-foreground">{t.messages.never}</p>
              </Section>

              <Section icon={<Eye />} title={t.use.title}>
                <Bullets items={t.use.items} />
              </Section>

              <Section icon={<Share2 />} title={t.sharing.title}>
                <p className="font-medium text-muted-foreground">{t.sharing.intro}</p>
                <Rows items={t.sharing.items} />
                <p className="text-sm text-muted-foreground">{t.sharing.footer}</p>
              </Section>

              <Section icon={<Clock />} title={t.retention.title}>
                <Rows items={t.retention.items} />
              </Section>

              <Section icon={<UserCheck />} title={t.rights.title}>
                <p className="font-medium text-muted-foreground">{t.rights.intro}</p>
                <Bullets items={t.rights.items} />
                <p className="text-sm leading-relaxed text-muted-foreground">{t.rights.how}</p>
              </Section>

              <Section icon={<Lock />} title={t.security.title}>
                {t.security.paragraphs.map((p, i) => <p key={i} className="text-lg leading-relaxed text-muted-foreground">{p}</p>)}
              </Section>

              <Section icon={<Baby />} title={t.children.title}>
                <p className="text-lg leading-relaxed text-muted-foreground">{t.children.content}</p>
              </Section>

              <Section icon={<Coins />} title={t.virtualCurrency.title}>
                <div className="space-y-4">{t.virtualCurrency.paragraphs.map((p, i) => <p key={i} className="text-lg leading-relaxed text-muted-foreground">{p}</p>)}</div>
              </Section>

              <Section icon={<Scale />} title={t.liability.title}>
                <div className="space-y-4">{t.liability.paragraphs.map((p, i) => <p key={i} className="text-lg leading-relaxed text-muted-foreground">{p}</p>)}</div>
              </Section>

              <Section icon={<Bell />} title={t.disclaimer.title}>
                <p className="text-lg leading-relaxed text-muted-foreground">{t.disclaimer.content}</p>
              </Section>

              <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                <section className="space-y-6">
                  <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight"><Eye className="h-6 w-6 text-primary" />{t.acknowledgement.title}</h2>
                  <p className="text-muted-foreground">{t.acknowledgement.content}</p>
                </section>
                <section className="space-y-6">
                  <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight"><Bell className="h-6 w-6 text-primary" />{t.updates.title}</h2>
                  <p className="text-muted-foreground">{t.updates.content}</p>
                </section>
              </div>

              <section className="rounded-3xl bg-secondary/50 p-8 text-center text-muted-foreground md:p-12">
                <div className="mb-6 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20"><HelpCircle className="h-8 w-8 text-primary" /></div>
                </div>
                <h3 className="mb-4 text-2xl font-black text-foreground">{t.contact.title}</h3>
                <p className="mb-8">{t.contact.content}</p>
                <a href="https://discord.gg/DaUhFcjJfH" target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95">
                  {t.contact.discord}
                </a>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
