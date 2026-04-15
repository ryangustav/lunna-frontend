import { NextResponse } from "next/server"

// Este endpoint serve os dados dinâmicos de estatísticas para a página inicial (Hero e StatsBar).
// Quando a API real estiver pronta no back-end (ex: DB da Lunna), você pode conectar a lógica aqui,
// ou redirecionar a chamada no front-end para a URL definitiva.
export async function GET() {
  return NextResponse.json({
    data: {
      servers: 2453,
      users: 180420,
      onlineMembers: 47,
      totalCoins: 1200,
      uptime: 99.9,
    }
  })
}
