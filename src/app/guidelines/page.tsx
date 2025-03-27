'use client';

import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Ban, DollarSign, Info, Award, UserX, Users, FileWarning, MessageCircle } from 'lucide-react';
import '@/src/styles/Privacy.css'; 
import '@/src/styles/globals.css';

interface Translation {
  title: string;
  lastUpdated: string;
  introduction: string;
  sections: {
    discordCompliance: {
      title: string;
      items: string[];
    };
    contentRestrictions: {
      title: string;
      items: string[];
    };
    systemIntegrity: {
      title: string;
      items: string[];
    };
    commercialActivities: {
      title: string;
      intro: string;
      items: string[];
    };
    enforcementEvasion: {
      title: string;
      items: string[];
    };
    intellectualProperty: {
      title: string;
      items: string[];
    };
    refundPolicy: {
      title: string;
      items: string[];
    };
    prizeDisclaimers: {
      title: string;
      items: string[];
    };
    impersonation: {
      title: string;
      items: string[];
    };
    respectfulConduct: {
      title: string;
      items: string[];
    };
    userInteractions: {
      title: string;
      items: string[];
    };
    appealsProcess: {
      title: string;
      items: string[];
    };
    accountResponsibility: {
      title: string;
      items: string[];
    };
    acknowledgment: {
      title: string;
      content: string;
    };
    modifications: {
      title: string;
      content: string;
    };
    contactUs: {
      title: string;
      intro: string;
      discord: string;
    };
  };
}

const translations: Record<string, Translation> = {
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
        content: "a Lunna reserva-se o direito de modificar estas diretrizes a qualquer momento. O uso contínuo dos serviços da Lunna após quaisquer modificações constitui aceitação das diretrizes atualizadas."
      },
      contactUs: {
        title: "Contate-nos",
        intro: "Para perguntas sobre estas diretrizes, entre em contato conosco através de:",
        discord: "Nosso Servidor de Suporte no Discord"
      }
    }
  }
};

const CommunityGuidelines = () => {
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
              {t.introduction}
            </p>
          </section>

          {/* Guidelines Sections */}
          <div className="privacy-section">
            {/* Discord Platform Compliance */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-[#7f5af0]" />
                  {t.sections.discordCompliance.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <ul className="list-disc pl-5 space-y-2">
                  {t.sections.discordCompliance.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Content Restrictions */}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <Ban className="w-6 h-6 text-[#7f5af0]" />
                  {t.sections.contentRestrictions.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <ul className="list-disc pl-5 space-y-2">
                  {t.sections.contentRestrictions.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* System Integrity */}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <Shield className="w-6 h-6 text-[#7f5af0]" />
                  {t.sections.systemIntegrity.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <ul className="list-disc pl-5 space-y-2">
                  {t.sections.systemIntegrity.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Commercial Activities */}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-[#7f5af0]" />
                  {t.sections.commercialActivities.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <p>{t.sections.commercialActivities.intro}</p>
                <ul className="list-disc pl-5 space-y-2">
                  {t.sections.commercialActivities.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Enforcement Evasion */}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <UserX className="w-6 h-6 text-[#7f5af0]" />
                  {t.sections.enforcementEvasion.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <ul className="list-disc pl-5 space-y-2">
                  {t.sections.enforcementEvasion.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <FileWarning className="w-6 h-6 text-[#7f5af0]" />
                  {t.sections.intellectualProperty.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <ul className="list-disc pl-5 space-y-2">
                  {t.sections.intellectualProperty.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Refund Policy */}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-[#7f5af0]" />
                  {t.sections.refundPolicy.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <ul className="list-disc pl-5 space-y-2">
                  {t.sections.refundPolicy.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Prize and Reward Disclaimers */}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <Award className="w-6 h-6 text-[#7f5af0]" />
                  {t.sections.prizeDisclaimers.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <ul className="list-disc pl-5 space-y-2">
                  {t.sections.prizeDisclaimers.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Impersonation and Misinformation */}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <UserX className="w-6 h-6 text-[#7f5af0]" />
                  {t.sections.impersonation.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <ul className="list-disc pl-5 space-y-2">
                  {t.sections.impersonation.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Respectful Conduct */}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <Users className="w-6 h-6 text-[#7f5af0]" />
                  {t.sections.respectfulConduct.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <ul className="list-disc pl-5 space-y-2">
                  {t.sections.respectfulConduct.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* User Interactions */}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-[#7f5af0]" />
                  {t.sections.userInteractions.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <ul className="list-disc pl-5 space-y-2">
                  {t.sections.userInteractions.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Appeals Process */}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <Info className="w-6 h-6 text-[#7f5af0]" />
                  {t.sections.appealsProcess.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <ul className="list-disc pl-5 space-y-2">
                  {t.sections.appealsProcess.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Account Responsibility */}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <Shield className="w-6 h-6 text-[#7f5af0]" />
                  {t.sections.accountResponsibility.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <ul className="list-disc pl-5 space-y-2">
                  {t.sections.accountResponsibility.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <Info className="w-6 h-6 text-[#7f5af0]" />
                  {t.sections.acknowledgment.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <p>{t.sections.acknowledgment.content}</p>
              </div>
            </section>

            {/* Modifications */}
            <section className="privacy-section">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <FileWarning className="w-6 h-6 text-[#7f5af0]" />
                  {t.sections.modifications.title}
                </h2>
              </div>
              <div className="pl-6 space-y-4">
                <p>{t.sections.modifications.content}</p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-[#7f5af0]" />
                  {t.sections.contactUs.title}
                </h2>
              </div>
              <div className="pl-6">
                <p className="mb-4">
                  {t.sections.contactUs.intro}
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><a className='nav-link' href="https://discord.gg/DaUhFcjJfH" target='_blank' rel="noreferrer">{t.sections.contactUs.discord}</a></li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityGuidelines;