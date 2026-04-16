import { Link } from 'react-router-dom'
import { ClipboardList, Gauge, MessageSquare, Shield, Sparkles, Truck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { defaultDashboardPath } from '../lib/dashboardPaths.js'
import SiteHeader from '../components/marketing/SiteHeader.jsx'
import SiteFooter from '../components/marketing/SiteFooter.jsx'

const blocos = [
  {
    icon: Truck,
    titulo: 'Motorista',
    texto:
      'Abra chamados com placa e sintomas, acompanhe etapas do conserto e visualize o que a oficina e a seguradora registraram — sem depender só de telefone.',
  },
  {
    icon: ClipboardList,
    titulo: 'Oficina',
    texto:
      'Centralize ordens de serviço, laudo técnico e lista de peças. Envie pedidos de cotação para a rede e mantenha o status da OS visível para o cliente.',
  },
  {
    icon: Gauge,
    titulo: 'Autopeças',
    texto:
      'Receba pedidos de orçamento das oficinas, responda com preço e prazo e acompanhe o que já foi cotado ou vendido no painel.',
  },
  {
    icon: Shield,
    titulo: 'Seguradora',
    texto:
      'Analise sinistros com laudo e peças indicadas, autorize ou recuse com poucos cliques e mantenha histórico para auditoria.',
  },
  {
    icon: MessageSquare,
    titulo: 'Comunicação',
    texto:
      'Um único fluxo digital reduz retrabalho e mensagens cruzadas entre motorista, oficina, fornecedor e seguradora.',
  },
  {
    icon: Sparkles,
    titulo: 'Operação moderna',
    texto:
      'Interface pensada para uso diário: menus por perfil, dados persistidos no navegador (demo) e preparação para integração com API e banco.',
  },
]

export default function ServicosPage() {
  const { user, isAuthenticated } = useAuth()
  const painelHref = user?.role ? defaultDashboardPath(user.role) : '/dashboard'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SiteHeader anchorPrefix="/" />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan-deep mb-2">Serviços</p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Como o FixIt Car ajuda cada parte da cadeia</h1>
        <p className="mt-4 text-slate-600 leading-relaxed">
          Abaixo detalhamos os módulos por perfil. Na prática, todos trabalham sobre o mesmo fluxo de solicitação de
          conserto — cada um com as telas e permissões que fazem sentido para o dia a dia.
        </p>
        <ul className="mt-10 space-y-8">
          {blocos.map((b) => {
            const BlocoIcon = b.icon
            return (
              <li key={b.titulo} className="flex gap-4">
                <span className="shrink-0 h-11 w-11 rounded-xl bg-brand-cyan/40 ring-1 ring-brand-cyan-deep/25 flex items-center justify-center">
                  <BlocoIcon className="h-5 w-5 text-brand-cyan-deep" strokeWidth={2} aria-hidden />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{b.titulo}</h2>
                  <p className="mt-1 text-slate-600 text-sm leading-relaxed">{b.texto}</p>
                </div>
              </li>
            )
          })}
        </ul>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            to="/#contato"
            className="inline-flex items-center justify-center rounded-lg bg-brand-rose text-slate-900 font-semibold text-sm px-6 py-2.5 ring-1 ring-brand-rose-deep/30 hover:opacity-95"
          >
            Falar conosco
          </Link>
          <Link
            to={isAuthenticated ? painelHref : '/login'}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white font-semibold text-sm px-6 py-2.5 text-slate-800 hover:bg-slate-50"
          >
            {isAuthenticated ? 'Meu painel' : 'Acessar o painel'}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
