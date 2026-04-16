"use client"

import { Shield, AlertTriangle, Ban, DollarSign, Info, Award, UserX, Users, FileWarning, MessageCircle, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "@/src/i18n/routing"
import { Navbar } from "@/components/lunna/navbar"
import { useLocale } from "next-intl"

const translations: Record<string, any> = {
  en: {
    title: "Community Guidelines",
    lastUpdated: "Last updated: March 18, 2025",
    introduction: "These Community Guidelines outline the acceptable conduct standards when using Lunna services. All users are required to adhere to these guidelines to maintain a safe, respectful, and productive environment for our community. Violation of these guidelines may result in temporary or permanent suspension from Lunna services.",
    sections: {
      discordCompliance: {
        title: "Discord Platform Compliance",
        items: [
          "Users must comply with Discord's Terms of Service and Community Guidelines at all times.",
          "Violations of Discord's policies while using Lunna services will not be tolerated."
        ]
      },
      contentRestrictions: {
        title: "Content Restrictions",
        items: [
          "Use of NSFW (Not Safe For Work) content in any Lunna functions, commands, or services is strictly prohibited.",
          "Exchange of Lunna coins for products or services of an inappropriate nature is not permitted."
        ]
      },
      systemIntegrity: {
        title: "System Integrity",
        items: [
          "Attempting to circumvent restrictions, limitations, or security measures implemented by Lunna is prohibited.",
          "Creating multiple accounts to obtain daily rewards or engaging in similar behavior to gain unfair advantages is not permitted.",
          "Any attempts to attack, disrupt, or compromise Lunna services will result in immediate and permanent suspension."
        ]
      },
      commercialActivities: {
        title: "Commercial Activities",
        intro: "The following commercial activities are strictly prohibited:",
        items: [
          "The sale, rental, or exchange of virtual currency (\"Lunna coins\") for real currency or items of monetary value.",
          "Advertising, soliciting, or engaging in transactions involving Lunna virtual goods for real-world value items including, but not limited to: Discord Nitro subscriptions, account credentials, gift cards, real currency, in-game currencies, software scripts, or any other items with real monetary value.",
          "Users who become aware of such prohibited commercial activities are required to report them to Lunna staff."
        ]
      },
      enforcementEvasion: {
        title: "Enforcement Evasion",
        items: [
          "Attempts to evade enforcement actions, including creating new accounts after being banned, will result in permanent suspension without possibility of appeal.",
          "Assisting or concealing users who are attempting to evade enforcement actions is prohibited and may result in suspension of your account."
        ]
      },
      intellectualProperty: {
        title: "Intellectual Property",
        items: [
          "While drawing inspiration from Lunna is acceptable, direct plagiarism or duplication of Lunna's features, design, or content is prohibited."
        ]
      },
      refundPolicy: {
        title: "Refund Policy",
        items: [
          "Users must contact Lunna support before initiating any refund processes through payment providers.",
          "Unauthorized chargebacks or payment disputes may result in account suspension."
        ]
      },
      prizeDisclaimers: {
        title: "Prize and Reward Disclaimers",
        items: [
          "Lunna's administration is not responsible for prizes, rewards, or giveaways offered by third parties using Lunna services.",
          "Users are advised to exercise caution and sound judgment regarding offers that seem suspicious.",
          "Despite this disclaimer, Lunna administration reserves the right to intervene in cases of widespread fraudulent activity."
        ]
      },
      impersonation: {
        title: "Impersonation and Misinformation",
        items: [
          "Impersonating Lunna or any member of the Lunna staff is strictly prohibited.",
          "Spreading false information about Lunna, its services, or staff is forbidden.",
          "Using Lunna's name, likeness, or artwork in a manner that suggests official affiliation is not permitted."
        ]
      },
      respectfulConduct: {
        title: "Respectful Conduct",
        items: [
          "Offensive, abusive, or sexualized language or behavior directed at Lunna or its representation is prohibited.",
          "Gratuitous criticism disguised as feedback that contains abusive language will not be tolerated.",
          "Public displays of such behavior, when reported, will result in enforcement actions."
        ]
      },
      userInteractions: {
        title: "User Interactions",
        items: [
          "Attempts to deceive, threaten, or harm other Lunna users within the community are prohibited."
        ]
      },
      appealsProcess: {
        title: "Appeals Process",
        items: [
          "Inquiries regarding enforcement actions must be submitted through the official ban appeal form.",
          "Contacting Lunna staff members regarding enforcement actions through unofficial channels is prohibited and may extend suspension periods.",
          "Harassment of Lunna staff regarding enforcement actions against other users may result in your account being suspended."
        ]
      },
      accountResponsibility: {
        title: "Account Responsibility",
        items: [
          "Users are solely responsible for all activities that occur under their account credentials.",
          "Lunna administration is not responsible for accounts that have been shared, sold, compromised, or accessed by unauthorized parties.",
          "Users who allow others to access their accounts remain liable for any violations committed through their account."
        ]
      },
      acknowledgment: {
        title: "Acknowledgment",
        content: "By using Lunna services, you acknowledge that you have read, understood, and agree to abide by these Community Guidelines."
      },
      modifications: {
        title: "Modifications",
        content: "Lunna reserves the right to modify these guidelines at any time. Continued use of Lunna services following any modifications constitutes acceptance of the updated guidelines."
      },
      contactUs: {
        title: "Contact Us",
        intro: "For questions regarding these guidelines, please contact us through:",
        discord: "Our Discord Support Server"
      }
    }
  },
  pt: {
    title: "Diretrizes da Comunidade",
    lastUpdated: "Última atualização: 18 de março de 2025",
    introduction: "Estas Diretrizes da Comunidade definem os padrões de conduta aceitáveis ao usar os serviços da Lunna. Todos os usuários devem seguir estas diretrizes para manter um ambiente seguro, respeitoso e produtivo para nossa comunidade. A violação destas diretrizes pode resultar em suspensão temporária ou permanente dos serviços da Lunna.",
    sections: {
      discordCompliance: {
        title: "Conformidade com a Plataforma Discord",
        items: [
          "Os usuários devem cumprir os Termos de Serviço e Diretrizes da Comunidade do Discord em todos os momentos.",
          "Violações das políticas do Discord durante o uso dos serviços da Lunna não serão toleradas."
        ]
      },
      contentRestrictions: {
        title: "Restrições de Conteúdo",
        items: [
          "O uso de conteúdo NSFW (Não Seguro Para o Trabalho) em quaisquer funções, comandos ou serviços da Lunna é estritamente proibido.",
          "A troca de moedas Lunna por produtos ou serviços de natureza inadequada não é permitida."
        ]
      },
      systemIntegrity: {
        title: "Integridade do Sistema",
        items: [
          "Tentar contornar restrições, limitações ou medidas de segurança implementadas pelo Lunna é proibido.",
          "Criar múltiplas contas para obter recompensas diárias ou envolver-se em comportamento similar para obter vantagens injustas não é permitido.",
          "Quaisquer tentativas de atacar, interromper ou comprometer os serviços da Lunna resultarão em suspensão imediata e permanente."
        ]
      },
      commercialActivities: {
        title: "Atividades Comerciais",
        intro: "As seguintes atividades comerciais são estritamente proibidas:",
        items: [
          "A venda, aluguel ou troca de moeda virtual (\"moedas Lunna\") por moeda real ou itens de valor monetário.",
          "Anunciar, solicitar ou participar de transações envolvendo bens virtuais da Lunna por itens de valor real, incluindo, mas não se limitando a: assinaturas Discord Nitro, credenciais de conta, cartões-presente, moeda real, moedas de jogos, scripts de software ou quaisquer outros itens com valor monetário real.",
          "Usuários que tomarem conhecimento de tais atividades comerciais proibidas devem reportá-las à equipe da Lunna."
        ]
      },
      enforcementEvasion: {
        title: "Evasão de Punições",
        items: [
          "Tentativas de evadir ações de punição, incluindo a criação de novas contas após ser banido, resultarão em suspensão permanente sem possibilidade de recurso.",
          "Auxiliar ou ocultar usuários que estão tentando evadir ações de punição é proibido e pode resultar na suspensão da sua conta."
        ]
      },
      intellectualProperty: {
        title: "Propriedade Intelectual",
        items: [
          "Embora seja aceitável inspirar-se no Lunna, o plágio direto ou duplicação dos recursos, design ou conteúdo da Lunna é proibido."
        ]
      },
      refundPolicy: {
        title: "Política de Reembolso",
        items: [
          "Os usuários devem entrar em contato com o suporte da Lunna antes de iniciar quaisquer processos de reembolso através de provedores de pagamento.",
          "Estornos não autorizados ou disputas de pagamento podem resultar na suspensão da conta."
        ]
      },
      prizeDisclaimers: {
        title: "Isenções de Prêmios e Recompensas",
        items: [
          "A administração da Lunna não é responsável por prêmios, recompensas ou sorteios oferecidos por terceiros usando os serviços da Lunna.",
          "Os usuários são aconselhados a exercer cautela e bom senso em relação a ofertas que pareçam suspeitas.",
          "Apesar desta isenção, a administração da Lunna reserva-se o direito de intervir em casos de atividade fraudulenta generalizada."
        ]
      },
      impersonation: {
        title: "Personificação e Desinformação",
        items: [
          "Personificar a Lunna ou qualquer membro da equipe da Lunna é estritamente proibido.",
          "Espalhar informações falsas sobre a Lunna, seus serviços ou equipe é proibido.",
          "Usar o nome, aparência ou arte da Lunna de maneira que sugira afiliação oficial não é permitido."
        ]
      },
      respectfulConduct: {
        title: "Conduta Respeitosa",
        items: [
          "Linguagem ou comportamento ofensivo, abusivo ou sexualizado direcionado ao Lunna ou sua representação é proibido.",
          "Críticas gratuitas disfarçadas de feedback que contenham linguagem abusiva não serão toleradas.",
          "Demonstrações públicas de tal comportamento, quando reportadas, resultarão em ações punitivas."
        ]
      },
      userInteractions: {
        title: "Interações entre Usuários",
        items: [
          "Tentativas de enganar, ameaçar ou prejudicar outros usuários da Lunna dentro da comunidade são proibidas."
        ]
      },
      appealsProcess: {
        title: "Processo de Recursos",
        items: [
          "Consultas sobre ações punitivas devem ser enviadas através do formulário oficial de recurso contra banimento.",
          "Contatar membros da equipe da Lunna sobre ações punitivas por canais não oficiais é proibido e pode estender os períodos de suspensão.",
          "Assédio à equipe da Lunna sobre ações punitivas contra outros usuários pode resultar na suspensão da sua conta."
        ]
      },
      accountResponsibility: {
        title: "Responsabilidade da Conta",
        items: [
          "Os usuários são os únicos responsáveis por todas as atividades que ocorrem sob suas credenciais de conta.",
          "A administração da Lunna não é responsável por contas que foram compartilhadas, vendidas, comprometidas ou acessadas por partes não autorizadas.",
          "Usuários que permitem que outros acessem suas contas permanecem responsáveis por quaisquer violações cometidas através de sua conta."
        ]
      },
      acknowledgment: {
        title: "Reconhecimento",
        content: "Ao usar os serviços da Lunna, você reconhece que leu, entendeu e concorda em cumprir estas Diretrizes da Comunidade."
      },
      modifications: {
        title: "Modificações",
        content: "A Lunna reserva-se o direito de modificar estas diretrizes a qualquer momento. O uso contínuo dos serviços da Lunna após quaisquer modificações constitui aceitação das diretrizes atualizadas."
      },
      contactUs: {
        title: "Contate-nos",
        intro: "Para perguntas sobre estas diretrizes, entre em contato conosco através de:",
        discord: "Nosso Servidor de Suporte no Discord"
      }
    }
  }
};

export default function GuidelinesPage() {
  const locale = useLocale()
  const t = translations[locale] || translations.en

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-[1200px] px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-20 flex flex-col items-center text-center">
            <Link href="/" className="group mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {locale === 'pt' ? 'Voltar ao início' : 'Back to Home'}
            </Link>

            <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/5 px-4 py-1.5 text-primary">
              <Shield className="mr-2 h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Guidelines</span>
            </Badge>

            <h1 className="mb-4 text-4xl font-black tracking-tighter sm:text-6xl md:text-7xl">
              {t.title}
            </h1>
            <p className="text-lg font-medium text-muted-foreground">
              {t.lastUpdated}
            </p>
          </div>

          <p className="mb-12 text-center text-lg leading-relaxed text-muted-foreground max-w-3xl mx-auto">
            {t.introduction}
          </p>

          {/* Content Sections */}
          <div className="space-y-12">
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="space-y-16 p-8 md:p-12">
                
                {/* Discord Compliance */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <AlertTriangle className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.sections.discordCompliance.title}</h2>
                  </div>
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {t.sections.discordCompliance.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Content Restrictions */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <Ban className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.sections.contentRestrictions.title}</h2>
                  </div>
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {t.sections.contentRestrictions.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* System Integrity */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.sections.systemIntegrity.title}</h2>
                  </div>
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {t.sections.systemIntegrity.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Commercial Activities */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.sections.commercialActivities.title}</h2>
                  </div>
                  <p className="text-muted-foreground font-medium">{t.sections.commercialActivities.intro}</p>
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {t.sections.commercialActivities.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 min-w-[6px] rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Enforcement Evasion */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <UserX className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.sections.enforcementEvasion.title}</h2>
                  </div>
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {t.sections.enforcementEvasion.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Intellectual Property */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <FileWarning className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.sections.intellectualProperty.title}</h2>
                  </div>
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-1">
                    {t.sections.intellectualProperty.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Refund Policy */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.sections.refundPolicy.title}</h2>
                  </div>
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {t.sections.refundPolicy.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Prize Disclaimers */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.sections.prizeDisclaimers.title}</h2>
                  </div>
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-1">
                    {t.sections.prizeDisclaimers.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Impersonation */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <UserX className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.sections.impersonation.title}</h2>
                  </div>
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-1">
                    {t.sections.impersonation.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Respectful Conduct */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.sections.respectfulConduct.title}</h2>
                  </div>
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-1">
                    {t.sections.respectfulConduct.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 min-w-[6px] rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* User Interactions */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <MessageCircle className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.sections.userInteractions.title}</h2>
                  </div>
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-1">
                    {t.sections.userInteractions.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Appeals Process */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <Info className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.sections.appealsProcess.title}</h2>
                  </div>
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-1">
                    {t.sections.appealsProcess.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 min-w-[6px] rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Account Responsibility */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.sections.accountResponsibility.title}</h2>
                  </div>
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-1">
                    {t.sections.accountResponsibility.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 min-w-[6px] rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Acknowledgment & Modifications */}
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                  <section className="space-y-6">
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                      <Info className="h-6 w-6 text-primary" />
                      {t.sections.acknowledgment.title}
                    </h2>
                    <p className="text-muted-foreground">{t.sections.acknowledgment.content}</p>
                  </section>
                  <section className="space-y-6">
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                      <FileWarning className="h-6 w-6 text-primary" />
                      {t.sections.modifications.title}
                    </h2>
                    <p className="text-muted-foreground">{t.sections.modifications.content}</p>
                  </section>
                </div>

                {/* Contact Section */}
                <section className="rounded-3xl bg-secondary/50 p-8 text-center text-muted-foreground md:p-12">
                  <div className="mb-6 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                      <MessageCircle className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="mb-4 text-2xl font-black text-foreground">{t.sections.contactUs.title}</h3>
                  <p className="mb-8">{t.sections.contactUs.intro}</p>
                  <a href="https://discord.gg/DaUhFcjJfH" target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95">
                    {t.sections.contactUs.discord}
                  </a>
                </section>

              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
