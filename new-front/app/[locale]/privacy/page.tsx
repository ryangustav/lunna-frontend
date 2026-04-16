"use client"

import { Shield, Database, Eye, Lock, ArrowLeft, Coins, UserCheck, Clock, Scale, Bell, HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "@/src/i18n/routing"
import { Navbar } from "@/components/lunna/navbar"
import { useLocale } from "next-intl"

const translations: Record<string, any> = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: February 17, 2025",
    resume: "Resume: You take responsibility for any image/video/audio/media sent to me, trying to abuse bugs/use bots/cheats is prohibited and you may lose access to all my features (and other services), we will collect information such as your ID, username, email, IP, avatar, servers, messages, media and other things (but we will not distribute such information to third parties), you will not defame/harm the image of Lunna, Onlykgzin, you may be suspended from using Lunna or any other service for any reason, that you will not be able to recover data if it is lost, and that you agree to everything that is in the terms of use.",
    informationCollect: {
      title: "Information We Collect",
      intro: "We collect the following information when you use Lunna:",
      items: [
        "Discord User ID and Username",
        "Email",
        "IP",
        "Servers",
        "Avatar",
        "Messages & Media",
        "Transaction Information (for premium features)"
      ]
    },
    howWeUse: {
      title: "How We Use Your Information",
      intro: "We use the collected information for:",
      items: [
        "Providing and maintaining our services",
        "Processing transactions",
        "Responding to user inquiries and support requests",
        "Improving our services and user experience",
        "Sending important updates and notifications"
      ]
    },
    virtualCurrency: {
      title: "Virtual Currency and Virtual Goods",
      paragraphs: [
        "The Service may offer the opportunity to acquire virtual currency (\"Virtual Currency\") or virtual goods (\"Virtual Goods\"), which may require payment of a fee using legal tender (\"real money\"). All purchases of Virtual Currency are final and non-refundable, non-exchangeable, and non-transferable, except at the sole discretion of the Company or the platform provider. The purchase, sale, or exchange of Virtual Currency outside the Service is strictly prohibited. Any violation of this provision may result in the termination of your Account and/or legal action.",
        "The Company reserves the right, at its sole discretion, to modify, manage, regulate, or remove Virtual Currency and/or Virtual Goods at any time. Prices and availability of Virtual Goods are subject to change without prior notice. The Company shall not be liable to you or any third party for the exercise of these rights.",
        "You are granted a limited, personal, non-transferable, and non-sublicensable license to use Virtual Goods and Virtual Currency solely within the Service, provided that they have been earned, purchased, or otherwise obtained in a manner authorized by the Company. You acknowledge that you have no ownership rights, title, or interest in any Virtual Goods or Virtual Currency made available through the Service.",
        "In the event of a chargeback, the Company reserves the right to issue a warning regarding the violation or to immediately suspend or terminate any and all Accounts associated with your use of the Service. Additionally, the Company may, at its discretion, suspend or terminate other accounts linked to you across different services."
      ]
    },
    dataProtection: {
      title: "Data Protection",
      content: "All data can only be accessed by Ryan (Onlykgzin), which agreed to not share/sell/distribute any of the stored data with third parties."
    },
    userRights: {
      title: "Your Rights",
      intro: "You have the right to:",
      items: [
        "Access your personal data",
        "Request correction of your personal data",
        "Request deletion of your personal data",
        "Opt-out of non-essential data collection",
        "Withdraw consent for data processing"
      ]
    },
    dataRetention: {
      title: "Data Retention",
      content: "We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy and to comply with legal obligations."
    },
    limitationLiability: {
      title: "Limitation of Liability",
      paragraphs: [
        "To the maximum extent permitted by law, under no circumstances shall the Company be liable to you or any third party for any consequential, incidental, special, punitive, or other indirect damages, including but not limited to lost profits or lost data, arising from your use of the Service or any materials accessed through or downloaded from the Service. This applies regardless of whether such claims are based on warranty, contract, tort, or any other legal theory, and whether or not the Company has been advised of the possibility of such damages.",
        "The Company's total liability to you shall not exceed the greater of: (a) the total amount you have paid to the Company under these Terms in the three (3) months immediately preceding the date on which you first assert a claim, or (b) $100.",
        "The limitations and disclaimers set forth in these Terms do not seek to exclude liability or alter rights that cannot be lawfully excluded under applicable law. Certain jurisdictions do not permit the exclusion of implied warranties or the limitation of liability for incidental or consequential damages. In such jurisdictions, the Company's liability shall be limited to the maximum extent permitted by law.",
        "You expressly acknowledge that the Company shall not be responsible for user-generated content, including, but not limited to, Your Content, or for any defamatory, offensive, or illegal conduct of any third party. The risk of harm or damage arising from such content or conduct shall rest entirely with you."
      ]
    },
    disclaimer: {
      title: "Disclaimer of Warranty",
      content: "The Services and the Service Materials are provided \"as is\" without any warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. Furthermore, while the Company endeavors to provide a positive user experience, we cannot and do not warrant that the Services will always be secure, error-free, or that the Services will function without delays, disruptions, or imperfections. The foregoing disclaimers shall apply to the fullest extent permitted by applicable law."
    },
    acknowledgement: {
      title: "Acknowledgement",
      content: "Usage of any of our services affirms that the Licensee has read this Agreement, understands it, and agrees to be bound by its contents."
    },
    updates: {
      title: "Updates to This Policy",
      content: "We may update this Privacy Policy from time to time. We will notify users of any material changes through our Discord bot or website."
    },
    contact: {
      title: "Contact Us",
      content: "If you have any questions about this Privacy Policy, please contact us through:",
      discord: "Our Discord Support Server"
    }
  },
  pt: {
    title: "Política de Privacidade",
    lastUpdated: "Última atualização: 17 de fevereiro de 2025",
    resume: "Resumo: Você se responsabiliza por qualquer imagem/vídeo/áudio/mídia enviada para mim, tentar abusar de bugs/usar bots/trapaças é proibido e você pode perder o acesso a todos os meus recursos (e outros serviços), coletaremos informações como seu ID, nome de usuário, email, IP, avatar, servidores, mensagens, mídia e outras coisas (mas não distribuiremos essas informações a terceiros), você não difamará/prejudicará a imagem da Lunna, Onlykgzin, você pode ser suspenso do uso da Lunna ou qualquer outro serviço por qualquer motivo, que você não poderá recuperar dados se forem perdidos, e que você concorda com tudo que está nos termos de uso.",
    informationCollect: {
      title: "Informações que Coletamos",
      intro: "Coletamos as seguintes informações quando você usa a Lunna:",
      items: [
        "ID e Nome de Usuário do Discord",
        "Email",
        "IP",
        "Servidores",
        "Avatar",
        "Mensagens e Mídia",
        "Informações de Transação (para recursos premium)"
      ]
    },
    howWeUse: {
      title: "Como Usamos Suas Informações",
      intro: "Usamos as informações coletadas para:",
      items: [
        "Fornecer e manter nossos serviços",
        "Processar transações",
        "Responder a consultas e solicitações de suporte",
        "Melhorar nossos serviços e experiência do usuário",
        "Enviar atualizações e notificações importantes"
      ]
    },
    virtualCurrency: {
      title: "Moeda Virtual e Bens Virtuais",
      paragraphs: [
        "O Serviço pode oferecer a oportunidade de adquirir moeda virtual (\"Moeda Virtual\") ou bens virtuais (\"Bens Virtuais\"), que podem exigir o pagamento de uma taxa usando moeda legal (\"dinheiro real\"). Todas as compras de Moeda Virtual são finais e não reembolsáveis, não trocáveis e não transferíveis, exceto a critério exclusivo da Empresa ou do provedor da plataforma. A compra, venda ou troca de Moeda Virtual fora do Serviço é estritamente proibida. Qualquer violação desta disposição pode resultar na rescisão de sua Conta e/ou ação legal.",
        "A Empresa reserva-se o direito, a seu exclusivo critério, de modificar, gerenciar, regular ou remover Moeda Virtual e/ou Bens Virtuais a qualquer momento. Preços e disponibilidade de Bens Virtuais estão sujeitos a alterações sem aviso prévio. A Empresa não será responsável perante você ou terceiros pelo exercício desses direitos.",
        "Você recebe uma licença limitada, pessoal, intransferível e não sublicenciável para usar Bens Virtuais e Moeda Virtual exclusivamente dentro do Serviço, desde que tenham sido ganhos, comprados ou obtidos de outra forma autorizada pela Empresa. Você reconhece que não tem direitos de propriedade, título ou interesse em quaisquer Bens Virtuais ou Moeda Virtual disponibilizados através do Serviço.",
        "Em caso de estorno, a Empresa reserva-se o direito de emitir um aviso sobre a violação ou suspender ou encerrar imediatamente todas as Contas associadas ao seu uso do Serviço. Além disso, a Empresa pode, a seu critério, suspender ou encerrar outras contas vinculadas a você em diferentes serviços."
      ]
    },
    dataProtection: {
      title: "Proteção de Dados",
      content: "Todos os dados só podem ser acessados por Ryan (Onlykgzin), que concordou em não compartilhar/vender/distribuir quaisquer dos dados armazenados com terceiros."
    },
    userRights: {
      title: "Seus Direitos",
      intro: "Você tem o direito de:",
      items: [
        "Acessar seus dados pessoais",
        "Solicitar correção de seus dados pessoais",
        "Solicitar exclusão de seus dados pessoais",
        "Optar por não participar da coleta de dados não essenciais",
        "Retirar o consentimento para processamento de dados"
      ]
    },
    dataRetention: {
      title: "Retenção de Dados",
      content: "Retemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos nesta Política de Privacidade e para cumprir com obrigações legais."
    },
    limitationLiability: {
      title: "Limitação de Responsabilidade",
      paragraphs: [
        "Na máxima extensão permitida por lei, em nenhuma circunstância a Empresa será responsável perante você ou qualquer terceiro por quaisquer danos consequenciais, incidentais, especiais, punitivos ou outros danos indiretos, incluindo, mas não se limitando a lucros perdidos ou dados perdidos, decorrentes do seu uso do Serviço ou quaisquer materiais acessados através ou baixados do Serviço. Isso se aplica independentemente de tais reivindicações serem baseadas em garantia, contrato, ato ilícito ou qualquer outra teoria legal, e se a Empresa foi ou não avisada da possibilidade de tais danos.",
        "A responsabilidade total da Empresa perante você não excederá o maior de: (a) o valor total que você pagou à Empresa sob estes Termos nos três (3) meses imediatamente anteriores à data em que você apresenta uma reivindicação pela primeira vez, ou (b) $100.",
        "As limitações e isenções estabelecidas nestes Termos não buscam excluir responsabilidade ou alterar direitos que não podem ser legalmente excluídos de acordo com a lei aplicável. Certas jurisdições não permitem a exclusão de garantias implícitas ou a limitação de responsabilidade por danos incidentais ou consequenciais. Em tais jurisdições, a responsabilidade da Empresa será limitada à extensão máxima permitida por lei.",
        "Você reconhece expressamente que a Empresa não será responsável pelo conteúdo gerado pelo usuário, incluindo, mas não se limitando a, Seu Conteúdo, ou por qualquer conduta difamatória, ofensiva ou ilegal de qualquer terceiro. O risco de dano ou prejuízo decorrente de tal conteúdo ou conduta recairá inteiramente sobre você."
      ]
    },
    disclaimer: {
      title: "Isenção de Garantia",
      content: "Os Serviços e os Materiais do Serviço são fornecidos \"como estão\" sem quaisquer garantias de qualquer tipo, expressas ou implícitas, incluindo, mas não se limitando a garantias implícitas de comercialização, adequação a um propósito específico, título e não violação. Além disso, embora a Empresa se esforce para proporcionar uma experiência positiva ao usuário, não podemos e não garantimos que os Serviços serão sempre seguros, livres de erros ou que os Serviços funcionarão sem atrasos, interrupções ou imperfeições. As isenções anteriores se aplicarão na extensão máxima permitida pela lei aplicável."
    },
    acknowledgement: {
      title: "Reconhecimento",
      content: "O uso de qualquer um de nossos serviços confirma que o Licenciado leu este Acordo, o compreende e concorda em estar vinculado ao seu conteúdo."
    },
    updates: {
      title: "Atualizações desta Política",
      content: "Podemos atualizar esta Política de Privacidade de tempos em tempos. Notificaremos os usuários sobre quaisquer alterações materiais através do nosso bot do Discord ou site."
    },
    contact: {
      title: "Contate-nos",
      content: "Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco através de:",
      discord: "Nosso Servidor de Suporte no Discord"
    }
  }
};

export default function PrivacyPage() {
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
              <span className="text-[10px] font-bold uppercase tracking-widest">Legal</span>
            </Badge>

            <h1 className="mb-4 text-4xl font-black tracking-tighter sm:text-6xl md:text-7xl">
              {t.title}
            </h1>
            <p className="text-lg font-medium text-muted-foreground">
              {t.lastUpdated}
            </p>
          </div>

          <p className="mb-12 text-center text-lg leading-relaxed text-muted-foreground max-w-3xl mx-auto">
            {t.resume}
          </p>

          {/* Content Sections */}
          <div className="space-y-12">
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="space-y-16 p-8 md:p-12">
                
                {/* Information Collect */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <Database className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.informationCollect.title}</h2>
                  </div>
                  <p className="text-muted-foreground font-medium">{t.informationCollect.intro}</p>
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {t.informationCollect.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* How We Use */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.howWeUse.title}</h2>
                  </div>
                  <p className="text-muted-foreground font-medium">{t.howWeUse.intro}</p>
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {t.howWeUse.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Virtual Currency */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <Coins className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.virtualCurrency.title}</h2>
                  </div>
                  <div className="space-y-4">
                    {t.virtualCurrency.paragraphs.map((p: string, i: number) => (
                      <p key={i} className="text-lg leading-relaxed text-muted-foreground">{p}</p>
                    ))}
                  </div>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Data Protection */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.dataProtection.title}</h2>
                  </div>
                  <p className="text-lg leading-relaxed text-muted-foreground">{t.dataProtection.content}</p>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* User Rights */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <UserCheck className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.userRights.title}</h2>
                  </div>
                  <p className="text-muted-foreground font-medium">{t.userRights.intro}</p>
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {t.userRights.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Data Retention */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.dataRetention.title}</h2>
                  </div>
                  <p className="text-lg leading-relaxed text-muted-foreground">{t.dataRetention.content}</p>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Limitation Liability */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <Scale className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.limitationLiability.title}</h2>
                  </div>
                  <div className="space-y-4">
                    {t.limitationLiability.paragraphs.map((p: string, i: number) => (
                      <p key={i} className="text-lg leading-relaxed text-muted-foreground">{p}</p>
                    ))}
                  </div>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Disclaimer */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                      <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{t.disclaimer.title}</h2>
                  </div>
                  <p className="text-lg leading-relaxed text-muted-foreground">{t.disclaimer.content}</p>
                  <div className="h-px bg-border/50 pt-8" />
                </section>

                {/* Acknowledgement & Updates */}
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                  <section className="space-y-6">
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                      <Eye className="h-6 w-6 text-primary" />
                      {t.acknowledgement.title}
                    </h2>
                    <p className="text-muted-foreground">{t.acknowledgement.content}</p>
                  </section>
                  <section className="space-y-6">
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                      <Bell className="h-6 w-6 text-primary" />
                      {t.updates.title}
                    </h2>
                    <p className="text-muted-foreground">{t.updates.content}</p>
                  </section>
                </div>

                {/* Contact Section */}
                <section className="rounded-3xl bg-secondary/50 p-8 text-center text-muted-foreground md:p-12">
                  <div className="mb-6 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                      <HelpCircle className="h-8 w-8 text-primary" />
                    </div>
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
        </div>
      </main>
    </div>
  )
}
