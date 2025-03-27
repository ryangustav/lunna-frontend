'use client';

import { useEffect, useState } from 'react';
import { Shield, Lock, Eye, Database, Bell, Clock, UserCheck, HelpCircle, Coins, Scale } from 'lucide-react';
import '@/src/styles/Privacy.css';
import '@/src/styles/globals.css';

interface Translation {
  title: string;
  lastUpdated: string;
  resume: string;
  informationCollect: {
    title: string;
    intro: string;
    items: string[];
  };
  howWeUse: {
    title: string;
    intro: string;
    items: string[];
  };
  virtualCurrency: {
    title: string;
    paragraphs: string[];
  };
  dataProtection: {
    title: string;
    content: string;
  };
  userRights: {
    title: string;
    intro: string;
    items: string[];
  };
  dataRetention: {
    title: string;
    content: string;
  };
  limitationLiability: {
    title: string;
    paragraphs: string[];
  };
  disclaimer: {
    title: string;
    content: string;
  };
  acknowledgement: {
    title: string;
    content: string;
  };
  updates: {
    title: string;
    content: string;
  };
  contact: {
    title: string;
    content: string;
    discord: string;
  };
}

const translations: Record<string, Translation> = {
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

const PrivacyPolicy = () => {
  const [language, setLanguage] = useState<string>("en");
  
  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pt')) {
      setLanguage(savedLanguage);
    }
    
    // Add event listener to detect language changes
    const handleStorageChange = () => {
      const currentLanguage = localStorage.getItem('language');
      if (currentLanguage && (currentLanguage === 'en' || currentLanguage === 'pt')) {
        setLanguage(currentLanguage);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check for language changes every second (alternative method)
    const intervalId = setInterval(() => {
      const currentLanguage = localStorage.getItem('language');
      if (currentLanguage && currentLanguage !== language && 
          (currentLanguage === 'en' || currentLanguage === 'pt')) {
        setLanguage(currentLanguage);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [language]);

  const t = translations[language];

  return (
    <div>
      <div className="privacy-container">
        <div className="privacy-content">
          {/* Header */}
          <div className="privacy-header">
            <Shield className="w-16 h-16 mx-auto" />
            <h1>{t.title}</h1>
            <p>{t.lastUpdated}</p>
          </div>

          {/* Introduction */}
          <section className="privacy-sections">
            <p className="mb-4">
              {t.resume}
            </p>
          </section>

          {/* Policy Sections */}
          <div className="privacy-section">
            {/* Information Collection */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <Database className="w-6 h-6 text-[#7f5af0]" />
                  {t.informationCollect.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <p>{t.informationCollect.intro}</p>
                <ul className="list-disc pl-5 space-y-2">
                  {t.informationCollect.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <Eye className="w-6 h-6 text-[#7f5af0]" />
                  {t.howWeUse.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <p>{t.howWeUse.intro}</p>
                <ul className="list-disc pl-5 space-y-2">
                  {t.howWeUse.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/*Virtual Currency*/}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <Coins className="w-6 h-6 text-[#7f5af0]" />
                  {t.virtualCurrency.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                {t.virtualCurrency.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Data Protection */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <Lock className="w-6 h-6 text-[#7f5af0]" />
                  {t.dataProtection.title}
                </h2>
              </div>
              <div className="pl-6">
                <p className="mb-4">
                  {t.dataProtection.content}
                </p>
              </div>
            </section>

            {/* User Rights */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <UserCheck className="w-6 h-6 text-[#7f5af0]" />
                  {t.userRights.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <p>{t.userRights.intro}</p>
                <ul className="list-disc pl-5 space-y-2">
                  {t.userRights.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <Clock className="w-6 h-6 text-[#7f5af0]" />
                  {t.dataRetention.title}
                </h2>
              </div>
              <div className="pl-6">
                <p className="mb-4">
                  {t.dataRetention.content}
                </p>
              </div>
            </section>

            {/*Limitation of Liability*/}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <Scale className="w-6 h-6 text-[#7f5af0]" />
                  {t.limitationLiability.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                {t.limitationLiability.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Disclaimer of Warranty */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <Bell className="w-6 h-6 text-[#7f5af0]" />
                  {t.disclaimer.title}
                </h2>
              </div>
              <div className="pl-6">
                <p className="mb-4">
                  {t.disclaimer.content}
                </p>
              </div>
            </section>

            {/*Acknowledgement*/}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <Eye className="w-6 h-6 text-[#7f5af0]" />
                  {t.acknowledgement.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <p>{t.acknowledgement.content}</p>
              </div>
            </section>

            {/* Updates to Policy */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <Bell className="w-6 h-6 text-[#7f5af0]" />
                  {t.updates.title}
                </h2>
              </div>
              <div className="pl-6">
                <p className="mb-4">
                  {t.updates.content}
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <HelpCircle className="w-6 h-6 text-[#7f5af0]" />
                  {t.contact.title}
                </h2>
              </div>
              <div className="pl-6">
                <p className="mb-4">
                  {t.contact.content}
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <a className='nav-link' href="https://discord.gg/DaUhFcjJfH" target='_blank' rel="noopener noreferrer">
                      {t.contact.discord}
                    </a>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;