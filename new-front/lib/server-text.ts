// Texts that reach the site already written in Portuguese: API error/success messages and the
// statuses the bot saves for the dashboard (publish errors of panels, alerts, tickets).
// serverText(text, "en") returns the English version; unknown text passes through unchanged.
// Patterns: "{}" in the Portuguese side captures a value, "{1}", "{2}"… place it in the English side.

const PATTERNS: [string, string][] = [
  // session / generic
  ["Você não está conectado. Entre com sua conta do Discord para continuar.", "You're not logged in. Log in with your Discord account to continue."],
  ["Você não tem permissão para fazer isso.", "You don't have permission to do that."],
  ["Falha na requisição", "Request failed"],
  ["Erro interno do servidor", "Internal server error"],
  ["Muitas requisições. Espere um minuto.", "Too many requests. Wait a minute."],
  ["Demasiadas requisições. Por favor, tente novamente em {}.", "Too many requests. Please try again in {1}."],
  ["Dados inválidos.", "Invalid data."],
  ["Idioma inválido.", "Invalid language."],
  ["Canal inválido.", "Invalid channel."],
  ["Token inválido.", "Invalid token."],

  // dashboard settings
  ["O Cérebro da Lunna é um recurso exclusivo para Servidores Premium. Ative um plano Premium para seu servidor para utilizar!", "Lunna's Brain is only for Premium servers. Get a Premium plan for your server to use it!"],
  ["Seu servidor está no plano {} e permite no máximo {} contadores de membros ativos. Faça upgrade para adicionar mais!", "Your server is on the {1} plan, which allows up to {2} active member counters. Upgrade to add more!"],
  ["A Lunna não tem permissão para ver ou enviar mensagens nesse canal. Verifique as permissões dela (Ver canal e Enviar mensagens).", "Lunna can't see or send messages in that channel. Check her permissions (View Channel and Send Messages)."],
  ["O canal escolhido não existe mais.", "The chosen channel no longer exists."],
  ["Não foi possível enviar o aviso no canal armadilha. Tente salvar de novo.", "Couldn't post the notice in the trap channel. Try saving again."],
  ["Não foi possível falar com o Discord para enviar o aviso. Tente salvar de novo.", "Couldn't reach Discord to post the notice. Try saving again."],
  ["O backend está sem o token do bot; o aviso não pôde ser enviado.", "The backend has no bot token, so the notice couldn't be posted."],

  // welcome page: background upload and test message
  ["O envio de imagens está indisponível no momento.", "Image uploads are unavailable right now."],
  ["Nenhuma imagem enviada.", "No image was uploaded."],
  ["A imagem passa de 5 MB. Envie um arquivo menor.", "The image is over 5 MB. Upload a smaller file."],
  ["Formato não suportado. Envie PNG, JPG, WebP ou GIF.", "Unsupported format. Upload a PNG, JPG, WebP or GIF."],
  ["Não foi possível ler a imagem. Envie um arquivo PNG, JPG, WebP ou GIF válido.", "Couldn't read the image. Upload a valid PNG, JPG, WebP or GIF."],
  ["Aguarde alguns segundos antes de testar de novo.", "Wait a few seconds before testing again."],
  ["Teste não encontrado.", "Test not found."],
  ["Você precisa estar no servidor para receber a mensagem de teste.", "You need to be in the server to get the test message."],
  ["Escolha um canal de envio antes de testar.", "Pick a channel before testing."],
  ["A Lunna não tem permissão para ver ou enviar mensagens nesse canal (Ver canal e Enviar mensagens).", "Lunna can't see or send messages in that channel (View Channel and Send Messages)."],
  ["A Lunna não tem permissão para enviar arquivos nesse canal, então o banner não pode ser enviado (Anexar arquivos).", "Lunna can't send files in that channel, so the banner can't be posted (Attach Files)."],
  ["Não há nada para enviar: a mensagem está vazia e o banner está desativado.", "There's nothing to send: the message is empty and the banner is off."],
  ["O Discord recusou a mensagem. Verifique as permissões da Lunna no canal.", "Discord refused the message. Check Lunna's permissions in the channel."],

  // role panels
  ["Painel não encontrado.", "Panel not found."],
  ["O painel precisa de um título.", "The panel needs a title."],
  ["Escolha o canal do painel.", "Pick the panel's channel."],
  ["Limite de {} painéis por servidor.", "Limit of {1} panels per server."],
  ["A Lunna não consegue enviar mensagens nesse canal.", "Lunna can't send messages in that channel."],
  ["Não foi possível publicar o painel. Tente salvar de novo.", "Couldn't publish the panel. Try saving again."],
  ["Cargos não incluídos: {}", "Roles left out: {1}"],
  ["cargo inexistente ou @everyone", "role doesn't exist or is @everyone"],
  ["@{} é gerenciado por uma integração/bot", "@{1} is managed by an integration/bot"],
  ["@{} está acima do cargo da Lunna", "@{1} is above Lunna's role"],
  ["@{} está acima do seu maior cargo", "@{1} is above your highest role"],
  ["@{} tem permissões de staff ({})", "@{1} has staff permissions ({2})"],

  // tickets
  ["Escolha o canal onde o painel de tickets será publicado.", "Pick the channel where the ticket panel will be posted."],
  ["Crie pelo menos uma categoria de ticket.", "Create at least one ticket category."],
  ["O painel tem {} componentes e o Discord aceita no máximo 40. Remova blocos, imagens ou botões.", "The panel has {1} components and Discord allows at most 40. Remove blocks, images or buttons."],
  ["O painel tem {} caracteres de texto e o Discord aceita no máximo 4000.", "The panel has {1} characters of text and Discord allows at most 4000."],
  ["A Lunna não consegue enviar mensagens no canal do painel.", "Lunna can't send messages in the panel's channel."],
  ["Painel publicado, mas {} e {}.", "Panel posted, but {1} and {2}."],
  ["Painel publicado, mas {}.", "Panel posted, but {1}."],
  ["a Lunna precisa da permissão Gerenciar Canais para criar os tickets", "Lunna needs the Manage Channels permission to create tickets"],
  ["a Lunna precisa da permissão Gerenciar Cargos para definir quem vê cada ticket", "Lunna needs the Manage Roles permission to set who sees each ticket"],
  ["O Discord recusou o painel: confira as URLs das imagens e dos botões de link (precisam começar com https://).", "Discord rejected the panel: check the image and link button URLs (they must start with https://)."],

  // social alerts
  ["Alerta não encontrado.", "Alert not found."],
  ["Esse alerta já existe nesse canal.", "That alert already exists in that channel."],
  ["Escolha YouTube, Twitch ou RSS.", "Pick YouTube, Twitch or RSS."],
  ["O link do feed precisa começar com http:// ou https://", "The feed link must start with http:// or https://"],
  ["Escolha o canal onde a Lunna vai postar.", "Pick the channel where Lunna will post."],
  ["Espere a Lunna encontrar o canal antes de testar.", "Wait for Lunna to find the channel before testing."],
  ["Um teste por minuto.", "One test per minute."],
  ["Seu plano (grátis) permite {} alertas. Com o Premium do servidor dá para ter mais.", "Your plan (free) allows {1} alerts. Server Premium allows more."],
  ["Seu plano ({}) permite {} alertas. Com o Premium do servidor dá para ter mais.", "Your plan ({1}) allows {2} alerts. Server Premium allows more."],
  ["Seu plano ({}) permite {} alertas.", "Your plan ({1}) allows {2} alerts."],
  ["Esse link não é do YouTube.", "That link isn't from YouTube."],
  ["Digite o @ do canal ou o link dele.", "Type the channel's @ or its link."],
  ["Não encontrei esse canal no YouTube.", "Couldn't find that channel on YouTube."],
  ["O YouTube não liberou o feed desse canal agora. Tente de novo em alguns minutos.", "YouTube isn't serving this channel's feed right now. Try again in a few minutes."],
  ["Os alertas da Twitch ainda não estão disponíveis nesta Lunna.", "Twitch alerts aren't available on this Lunna yet."],
  ["Digite o nome do canal da Twitch ou o link dele.", "Type the Twitch channel name or its link."],
  ["Não encontrei esse canal na Twitch.", "Couldn't find that channel on Twitch."],
  ["Cole o link do feed (começa com https://).", "Paste the feed link (it starts with https://)."],
  ["Não consegui abrir o feed: {}", "Couldn't open the feed: {1}"],
  ["Esse link não é um feed RSS/Atom.", "That link isn't an RSS/Atom feed."],
  ["A Lunna não tem permissão para enviar mensagens em #{}.", "Lunna doesn't have permission to send messages in #{1}."],
  ["Não consegui postar: {}", "Couldn't post: {1}"],

  // Lunna AI
  ["Automação não encontrada.", "Automation not found."],
  ["O plano {} permite {} automações ativas. Pause outra ou faça upgrade.", "The {1} plan allows {2} active automations. Pause another one or upgrade."],
  ["Automações agendadas são um recurso Premium.", "Scheduled automations are a Premium feature."],
  ["Pausada pelo painel.", "Paused from the dashboard."],

  // codes, VIP and payments
  ["O código é obrigatório!", "The code is required!"],
  ["Código inválido!", "Invalid code!"],
  ["Este código já foi utilizado!", "This code has already been used!"],
  ["Erro ao resgatar o código.", "Couldn't redeem the code."],
  ["Código resgatado com sucesso! Você recebeu: {}", "Code redeemed! You got: {1}"],
  ["VIP por {} dias (Expira em: {})", "VIP for {1} days (expires: {2})"],
  ["Você já possui este plano VIP ativo.", "You already have this VIP plan active."],
  ["Você não pode adquirir um plano VIP de nível igual ou inferior ao seu atual.", "You can't buy a VIP plan at or below your current level."],
  ["A transação ainda não foi processada completamente", "The transaction hasn't finished processing yet"],
  ["Pagamento processado com sucesso!", "Payment processed!"],
  ["✅ Pagamento processado com sucesso!", "✅ Payment processed!"],
  ["🎉 Pagamento aprovado! Suas {} moedas foram recebidas.", "🎉 Payment approved! Your {1} coins have arrived."],
  ["🎉 Parabéns! Você adquiriu o plano VIP {} com sucesso!", "🎉 Congratulations! You got the {1} VIP plan!"],
  ["Parabéns! Você adquiriu o plano VIP {} com sucesso!", "Congratulations! You got the {1} VIP plan!"],
  ["🎉 Parabéns! Seu servidor está agora no plano {}!", "🎉 Congratulations! Your server is now on the {1} plan!"],

  // server premium
  ["Plano de servidor inválido.", "Invalid server plan."],
  ["Este servidor já tem o {} ativo. Renove o mesmo plano para estender.", "This server already has {1} active. Renew the same plan to extend it."],
  ["Use o checkout: /checkout?type=GUILD_VIP&id=<plano>&guild=<servidor>", "Use the checkout: /checkout?type=GUILD_VIP&id=<plan>&guild=<server>"],
]

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const COMPILED = PATTERNS.map(([pt, en]) => ({
  re: new RegExp("^" + pt.split("{}").map(escape).join("([^\\n]+?)") + "$"),
  en,
}))

/** The English text for a Portuguese server/bot message (lang "en"); anything else is returned as is. */
export function serverText(text: string | null | undefined, lang: string): string {
  if (!text || lang !== "en") return text || ""
  for (const { re, en } of COMPILED) {
    const m = text.match(re)
    if (m) return en.replace(/\{(\d)\}/g, (_, i) => m[Number(i)].split("; ").map((part) => serverText(part, lang)).join("; "))
  }
  return text
}

/** The site's current language, read from <html lang> (set by the [locale] layout). */
export function pageLang(): string {
  return typeof document !== "undefined" && document.documentElement.lang === "en" ? "en" : "pt"
}
