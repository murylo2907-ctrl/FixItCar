import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  ArrowRight,
  ClipboardList,
  Headphones,
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  Shield,
  Sparkles,
  Star,
  Truck,
  Wrench,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { saveMensagemContato } from '../lib/saveContato.js'
import { defaultDashboardPath } from '../lib/dashboardPaths.js'
import SiteHeader from '../components/marketing/SiteHeader.jsx'
import SiteFooter from '../components/marketing/SiteFooter.jsx'

const servicosResumo = [
  {
    icon: Truck,
    titulo: 'Chamados para o motorista',
    desc: 'Abertura de OS com placa, sintomas e acompanhamento do andamento.',
  },
  {
    icon: ClipboardList,
    titulo: 'Operação da oficina',
    desc: 'Fila de veículos, laudo e solicitação de peças em um painel.',
  },
  {
    icon: Package,
    titulo: 'Cotações na autopeças',
    desc: 'Pedidos chegam organizados; você responde com preço e prazo.',
  },
  {
    icon: Shield,
    titulo: 'Sinistros na seguradora',
    desc: 'Fila de análise com laudo e decisão rápida (autorizar ou recusar).',
  },
]

const depoimentos = [
  {
    nome: 'Renata Oliveira',
    papel: 'Motorista',
    texto: 'Consegui ver em qual etapa estava o conserto sem ficar ligando para todo mundo.',
  },
  {
    nome: 'Oficina Boa Vista',
    papel: 'Mecânica',
    texto: 'A OS chega com o relato do cliente; a gente registra laudo e peças no mesmo lugar.',
  },
  {
    nome: 'Peças Sul Distribuidora',
    papel: 'Autopeças',
    texto: 'Os pedidos de cotação chegam claros; respondemos e fechamos o fluxo mais rápido.',
  },
]

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth()
  const painelHref = user?.role ? defaultDashboardPath(user.role) : '/dashboard'
  const [nome, setNome] = useState('')
  const [contato, setContato] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [envio, setEnvio] = useState(null)

  function enviarContato(e) {
    e.preventDefault()
    const r = saveMensagemContato({ nome, contato, mensagem })
    if (r.ok) {
      setEnvio('ok')
      setNome('')
      setContato('')
      setMensagem('')
    } else {
      setEnvio('erro')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SiteHeader anchorPrefix="" />

      <main>
        <section id="inicio" className="relative overflow-hidden border-b border-slate-200/80">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-brand-cyan/[0.07]" aria-hidden />
          <div
            className="absolute -top-24 left-1/4 w-[28rem] h-[28rem] rounded-full bg-brand-cyan/30 blur-3xl pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute -bottom-32 right-0 w-[32rem] h-[32rem] rounded-full bg-brand-rose/25 blur-3xl pointer-events-none"
            aria-hidden
          />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/35 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-cyan-deep shadow-sm shadow-brand-cyan/10">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Fluxo de conserto em um só lugar
            </div>
            <h1 className="mt-8 text-3xl sm:text-4xl lg:text-5xl xl:text-[2.75rem] font-bold tracking-tight text-slate-900 text-balance leading-[1.15] max-w-4xl mx-auto">
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                FixIt Car: software para fluxo de conserto veicular
              </span>{' '}
              <span className="text-slate-700 font-semibold lg:font-bold text-2xl sm:text-3xl lg:text-4xl xl:text-[2.15rem] block sm:inline sm:mt-0 mt-2">
                chamados, laudos, peças e sinistros integrados.
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto text-pretty leading-relaxed">
              Conecte motorista, oficina, autopeças e seguradora com menos retrabalho e mais transparência no reparo.
            </p>
            {!isAuthenticated ? (
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white font-semibold text-sm px-8 py-3.5 shadow-lg shadow-slate-900/25 hover:bg-slate-800 w-full sm:w-auto transition-transform hover:-translate-y-0.5"
                >
                  Entrar
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  to="/cadastro"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-brand-cyan-deep/40 bg-white text-slate-900 font-semibold text-sm px-8 py-3.5 w-full sm:w-auto hover:bg-brand-cyan/15 shadow-md shadow-slate-200/80 transition-transform hover:-translate-y-0.5"
                >
                  Criar conta
                </Link>
              </div>
            ) : (
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={painelHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan-deep to-brand-cyan-deep/90 text-white font-semibold text-sm px-8 py-3.5 shadow-lg shadow-brand-cyan-deep/25 hover:opacity-95 w-full sm:w-auto transition-transform hover:-translate-y-0.5"
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden />
                  Ir para o painel
                </Link>
                <Link
                  to="/servicos"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm px-8 py-3.5 shadow-md hover:bg-slate-50 w-full sm:w-auto"
                >
                  Ver serviços
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            )}
          </div>
        </section>

        <section id="quem-somos" className="py-16 sm:py-20 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Quem somos</h2>
                <p className="mt-5 text-slate-600 text-lg leading-relaxed">
                  O FixIt Car é uma plataforma web pensada para o dia a dia do conserto: cada participante do ecossistema
                  acessa um painel com as informações certas na hora certa.
                </p>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  Nosso foco é operação — menos ruído, mais clareza entre quem abre o chamado, quem executa o serviço,
                  quem fornece peças e quem valida o sinistro.
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-brand-cyan/40 via-white to-brand-rose/30 p-8 sm:p-10 border border-slate-200/80 shadow-xl shadow-slate-200/50">
                <ul className="space-y-4 text-sm text-slate-700">
                  {[
                    'Painéis por perfil (motorista, oficina, autopeças, seguradora)',
                    'Acompanhamento do chamado em tempo real (demo no navegador)',
                    'Fluxo pensado para escalar com API e banco depois',
                  ].map((t) => (
                    <li key={t} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-cyan-deep shrink-0" aria-hidden />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="servicos-resumo" className="py-16 sm:py-20 bg-white border-y border-slate-200/80 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Como podemos te ajudar</h2>
                <p className="mt-3 text-slate-600 max-w-xl leading-relaxed">
                  Visão rápida dos módulos. Na página de serviços explicamos com mais detalhe cada perfil e benefício.
                </p>
              </div>
              <Link
                to="/servicos"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-rose text-slate-900 font-semibold text-sm px-6 py-3 ring-1 ring-brand-rose-deep/35 shadow-md shadow-brand-rose/20 hover:opacity-95 shrink-0 self-start sm:self-auto transition-transform hover:-translate-y-0.5"
              >
                Ver todos os serviços
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
              {servicosResumo.map((item) => {
                const CardIcon = item.icon
                return (
                  <div
                    key={item.titulo}
                    className="group rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-7 shadow-md shadow-slate-200/40 hover:shadow-xl hover:shadow-brand-cyan/10 hover:border-brand-cyan/40 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="inline-flex rounded-xl bg-brand-cyan/35 p-3 ring-1 ring-brand-cyan-deep/15 mb-4">
                      <CardIcon className="h-7 w-7 text-brand-cyan-deep" strokeWidth={1.75} aria-hidden />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">{item.titulo}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                )
              })}
            </div>
            <div className="mt-10 text-center">
              <Link
                to="/servicos"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-cyan-deep hover:underline"
              >
                Conheça a página completa de serviços
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="py-16 sm:py-20 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-4 tracking-tight">Como funciona</h2>
            <p className="text-center text-slate-600 max-w-lg mx-auto mb-12 text-sm sm:text-base">
              Quatro etapas que conectam todo o ecossistema do reparo.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Truck, t: 'Chamado', d: 'Motorista abre OS com placa e sintomas.' },
                { icon: Wrench, t: 'Laudo', d: 'Oficina registra diagnóstico e peças.' },
                { icon: Package, t: 'Peças', d: 'Autopeças responde cotações.' },
                { icon: Shield, t: 'Sinistro', d: 'Seguradora autoriza ou recusa.' },
              ].map((step, idx) => {
                const StepIcon = step.icon
                return (
                  <div
                    key={step.t}
                    className="relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-lg shadow-slate-200/30 text-center lg:text-left"
                  >
                    <span className="absolute -top-3 left-6 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-md">
                      {idx + 1}
                    </span>
                    <StepIcon
                      className="h-9 w-9 text-brand-cyan-deep mx-auto lg:mx-0 mt-4 mb-4"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <p className="font-bold text-slate-900">{step.t}</p>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{step.d}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="depoimentos" className="py-16 sm:py-20 bg-gradient-to-b from-white to-slate-50/80 border-y border-slate-200/80 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 justify-center mb-2">
              <MessageSquareQuote className="h-7 w-7 text-brand-cyan-deep" strokeWidth={1.75} aria-hidden />
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Depoimentos</h2>
            </div>
            <p className="text-center text-sm sm:text-base text-slate-600 mb-12 max-w-lg mx-auto">
              Relatos de quem usa o fluxo no dia a dia (exemplos ilustrativos).
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {depoimentos.map((d, i) => (
                <figure
                  key={`${d.nome}-${i}`}
                  className="rounded-2xl border border-slate-200/90 bg-white p-7 flex flex-col shadow-lg shadow-slate-200/40 hover:shadow-xl transition-shadow"
                >
                  <div className="flex gap-0.5 text-amber-400 mb-3" aria-hidden>
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-sm text-slate-700 leading-relaxed flex-1">&ldquo;{d.texto}&rdquo;</blockquote>
                  <figcaption className="mt-4 pt-4 border-t border-slate-200">
                    <span className="font-semibold text-slate-900 text-sm">{d.nome}</span>
                    <span className="text-slate-500 text-xs block">{d.papel}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Parceiros */}
        <section id="parceiros" className="py-14 sm:py-16 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">Parceiros</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {['Oficinas credenciadas', 'Distribuidoras de peças', 'Seguradoras'].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center rounded-full border border-slate-200/90 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-md shadow-slate-200/30"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="contato" className="py-16 sm:py-20 bg-white border-t border-slate-200/80 scroll-mt-20">
          <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/50 to-white p-8 sm:p-10 shadow-xl shadow-slate-200/40">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg bg-brand-cyan/40 p-2">
                  <Headphones className="h-6 w-6 text-brand-cyan-deep" strokeWidth={1.75} aria-hidden />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Fale conosco</h2>
              </div>
              <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                Envie nome, contato e mensagem. Em ambiente de demonstração, guardamos no seu navegador para teste.
              </p>
              <form onSubmit={enviarContato} className="space-y-4">
              <div>
                <label htmlFor="ct-nome" className="block text-sm font-medium text-slate-700 mb-1">
                  Nome
                </label>
                <input
                  id="ct-nome"
                  required
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value)
                    setEnvio(null)
                  }}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan-deep/40"
                />
              </div>
              <div>
                <label htmlFor="ct-contato" className="block text-sm font-medium text-slate-700 mb-1">
                  Contato (e-mail ou telefone)
                </label>
                <input
                  id="ct-contato"
                  required
                  value={contato}
                  onChange={(e) => {
                    setContato(e.target.value)
                    setEnvio(null)
                  }}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan-deep/40"
                  placeholder="email@exemplo.com ou (11) 99999-9999"
                />
              </div>
              <div>
                <label htmlFor="ct-msg" className="block text-sm font-medium text-slate-700 mb-1">
                  Mensagem
                </label>
                <textarea
                  id="ct-msg"
                  required
                  rows={5}
                  value={mensagem}
                  onChange={(e) => {
                    setMensagem(e.target.value)
                    setEnvio(null)
                  }}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan-deep/40 resize-y min-h-[120px]"
                  placeholder="Como podemos ajudar?"
                />
              </div>
              {envio === 'ok' ? (
                <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                  Mensagem registrada. Obrigado — em produção isso seguiria para o seu e-mail ou CRM.
                </p>
              ) : null}
              {envio === 'erro' ? (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  Verifique os campos e tente novamente.
                </p>
              ) : null}
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-brand-cyan-deep to-brand-cyan-deep/90 text-white font-semibold py-3.5 text-sm shadow-lg shadow-brand-cyan-deep/25 hover:opacity-95 transition-opacity"
              >
                Enviar mensagem
              </button>
            </form>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
