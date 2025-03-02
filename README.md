# Lunna Frontend

![Lunna Logo]([https://cdn.discordapp.com/attachments/1061639923487604778/1214998649459634206/Web_Lunna_Logo.png?ex=66b14e2a&is=669ed92a&hm=fd46c9a4bacc5d1f0a0da8c2c9c11fa8c09a48fdc15c9c767a0a2bed7ba38b60&](https://images-ext-1.discordapp.net/external/NZ_dorUki3G2Zqn1QS9k8JBAntC6roCemFe742AQDOk/https/cdn.discordapp.com/avatars/1222333304028659792/1379470a71f0ccf52e446b6e794e1cae.webp?format=webp))

Interface web para gerenciamento do bot de Discord Lunna, oferecendo recursos como visualização e compra de LunarCoins, acesso a funcionalidades VIP e gerenciamento de conta.

## 📋 Sobre o Projeto

O Lunna Frontend é uma aplicação web desenvolvida com Next.js que serve como interface para usuários do bot Lunna do Discord. Os usuários podem gerenciar seus LunarCoins (moeda virtual), adquirir pacotes VIP, verificar histórico de transações e utilizar recursos premium como geração de imagens e prompts de IA.

## 🚀 Tecnologias Utilizadas

- **Next.js 14** - Framework React com SSR e otimização
- **React** - Biblioteca JavaScript para construção de interfaces
- **Tailwind CSS** - Framework de estilização utilitário
- **Shadcn UI** - Componentes reutilizáveis e acessíveis
- **TypeScript** - Linguagem tipada para desenvolvimento seguro
- **NextAuth.js** - Autenticação e sessões de usuário
- **Axios** - Cliente HTTP para requisições à API
- **Zustand** - Gerenciamento de estado global
- **React Hook Form** - Formulários com validação

## ⚙️ Funcionalidades Principais

- **Autenticação OAuth com Discord**
- **Dashboard de usuário**
  - Visualização de saldo de LunarCoins
  - Status VIP e benefícios ativos
  - Histórico de prompts e imagens geradas
- **Loja Virtual**
  - Compra de pacotes de LunarCoins
  - Assinaturas VIP com diferentes benefícios
  - Redirecionamento para processamento de pagamentos seguro
- **Gerenciamento de Conta**
  - Preferências de idioma
  - Configurações de renovação automática
  - Histórico de transações
- **Recursos Premium**
  - Acesso a modelos avançados de IA
  - Geração de imagens com diferentes estilos
  - Prompts exclusivos para membros VIP

## 🛠️ Configuração e Instalação

### Pré-requisitos
- Node.js 18.x ou superior
- NPM ou Yarn

### Passos para instalação

1. Clone o repositório:
```bash
git clone https://github.com/ryangustav/lunna-frontend.git
cd lunna-frontend
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
```
NEXT_PUBLIC_API_URL=http://localhost:8000 # URL do backend
```

Nota: A maioria das configurações (incluindo chaves de API e segredos) são gerenciadas pelo backend, o frontend apenas consome a API.

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

5. Acesse a aplicação em:
```
http://localhost:3000
```

## 📂 Estrutura do Projeto

```
lunna-frontend/
├── app/                    # App Router do Next.js
│   ├── dashboard/          # Páginas de dashboard
│   ├── store/              # Páginas da loja
│   ├── auth/               # Autenticação
│   └── layout.tsx          # Layout principal
├── components/             # Componentes React
│   ├── ui/                 # Componentes básicos da UI
│   ├── forms/              # Componentes de formulário
│   ├── dashboard/          # Componentes do dashboard
│   └── store/              # Componentes da loja
├── lib/                    # Utilitários e configurações
│   ├── api.ts              # Cliente Axios
│   └── utils/              # Funções auxiliares
├── hooks/                  # Hooks personalizados
├── store/                  # Estados Zustand
├── types/                  # Definições de tipos TypeScript
├── styles/                 # Estilos globais
└── public/                 # Arquivos estáticos
```

## 🔐 Autenticação

A autenticação é gerenciada pelo backend através da integração com OAuth do Discord. O frontend:
- Redireciona o usuário para o fluxo de autenticação
- Armazena e gerencia o token recebido do backend
- Usa o token para autenticar requisições à API
- Implementa rotas protegidas para usuários autenticados

## 💰 Integração com Pagamentos

O processamento de pagamentos é totalmente gerenciado pelo backend:

1. O usuário seleciona um produto (pacote VIP ou LunarCoins) na interface
2. O frontend envia a solicitação para o backend
3. O backend cria a sessão de pagamento e retorna o URL
4. O frontend redireciona o usuário para a página de pagamento
5. Após a conclusão, o usuário é redirecionado de volta com os benefícios já processados pelo backend

## 🌐 Implantação

### Vercel (Recomendado)
```bash
npm run build
# Deploy automático ao conectar ao GitHub
```

### Docker
```bash
# Construir a imagem
docker build -t lunna-frontend .

# Executar o container
docker run -p 3000:3000 lunna-frontend
```

## 📱 Responsividade

A interface foi desenvolvida seguindo o princípio de Mobile First, garantindo uma experiência otimizada em:
- Dispositivos móveis
- Tablets
- Desktops
- Telas largas

## 🌍 Internacionalização

Suporte para múltiplos idiomas:
- Português (Brasil)
- Inglês
- Espanhol

## 👥 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob os termos da licença [MIT](LICENSE).

## 📧 Contato

Para suporte ou dúvidas sobre o projeto:
- Discord: [Servidor Oficial da Lunna](https://discord.gg/lunna)
- GitHub: [ryangustav](https://github.com/ryangustav)

---

Desenvolvido com ❤️ pela equipe Lunna
