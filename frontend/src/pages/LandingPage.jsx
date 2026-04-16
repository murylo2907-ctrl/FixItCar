import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  ArrowRight,
  ClipboardList,
  Headphones,
  MessageSquareQuote,
  Package,
  Shield,
  Star,
  Truck,
  Wrench,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { saveMensagemContato } from '../lib/saveContato.js'
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
  const { isAuthenticated } = useAuth()
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
        {/* Hero — frase objetiva para SEO */}
        <section id="inicio" className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.35rem] font-bold tracking-tight text-slate-900 text-balance leading-tight">
              FixIt Car: software para fluxo de conserto veicular — chamados, laudos, peças e sinistros em um só lugar
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto text-pretty leading-relaxed">
              Conecte motorista, oficina, autopeças e seguradora com menos retrabalho e mais transparência no reparo.
            </p>
            {!isAuthenticated ? (
              <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-white font-semibold text-sm px-8 py-3 shadow-sm hover:bg-slate-800 w-full sm:w-auto"
                >
                  Entrar
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  to="/cadastro"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-brand-cyan bg-white text-slate-900 font-semibold text-sm px-8 py-3 w-full sm:w-auto hover:bg-brand-cyan/20"
                >
                  Criar conta
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        {/* Quem somos */}
        <section id="quem-somos" className="py-14 sm:py-16 scroll-mt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-slate-900">Quem somos</h2>
            <p className="mt-4 text-slate-600 max-w-3xl leading-relaxed">
              O FixIt Car é uma plataforma web pensada para o dia a dia do conserto: cada participante do ecossistema
              acessa um painel com as informações certas na hora certa. Nosso foco é operação — menos ruído, mais
              clareza entre quem abre o chamado, quem executa o serviço, quem fornece peças e quem valida o sinistro.
            </p>
          </div>
        </section>

        {/* Serviços / como ajudamos (resumo + CTA página) */}
        <section id="servicos-resumo" className="py-14 sm:py-16 bg-white border-y border-slate-200 scroll-mt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Como podemos te ajudar</h2>
                <p className="mt-2 text-slate-600 text-sm max-w-xl">
                  Visão rápida dos módulos. Na página de serviços explicamos com mais detalhe cada perfil e benefício.
                </p>
              </div>
              <Link
                to="/servicos"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-rose text-slate-900 font-semibold text-sm px-5 py-2.5 ring-1 ring-brand-rose-deep/30 hover:opacity-95 shrink-0 self-start sm:self-auto"
              >
                Ver todos os serviços
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {servicosResumo.map((item) => {
                const CardIcon = item.icon
                return (
                  <div
                    key={item.titulo}
                    className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 hover:border-brand-cyan/50 transition"
                  >
                    <CardIcon className="h-8 w-8 text-brand-cyan-deep mb-3" strokeWidth={1.75} aria-hidden />
                    <h3 className="font-bold text-slate-900">{item.titulo}</h3>
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

        {/* Como funciona (fluxo em 4 passos) */}
        <section id="como-funciona" className="py-14 sm:py-16 scroll-mt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Como funciona</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Truck, t: 'Chamado', d: 'Motorista abre OS com placa e sintomas.' },
                { icon: Wrench, t: 'Laudo', d: 'Oficina registra diagnóstico e peças.' },
                { icon: Package, t: 'Peças', d: 'Autopeças responde cotações.' },
                { icon: Shield, t: 'Sinistro', d: 'Seguradora autoriza ou recusa.' },
              ].map((step) => {
                const StepIcon = step.icon
                return (
                  <div key={step.t} className="rounded-xl border border-slate-200 p-5 bg-white">
                    <StepIcon className="h-8 w-8 text-brand-cyan-deep mb-3" strokeWidth={1.75} aria-hidden />
                    <p className="font-semibold text-slate-900">{step.t}</p>
                    <p className="text-sm text-slate-600 mt-1">{step.d}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section id="depoimentos" className="py-14 sm:py-16 bg-white border-y border-slate-200 scroll-mt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 justify-center mb-2">
              <MessageSquareQuote className="h-6 w-6 text-brand-cyan-deep" strokeWidth={1.75} aria-hidden />
              <h2 className="text-2xl font-bold text-slate-900">Depoimentos</h2>
            </div>
            <p className="text-center text-sm text-slate-600 mb-10 max-w-lg mx-auto">
              Relatos de quem usa o fluxo no dia a dia (exemplos ilustrativos).
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {depoimentos.map((d, i) => (
                <figure
                  key={`${d.nome}-${i}`}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 p-6 flex flex-col shadow-sm"
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
        <section id="parceiros" className="py-12 scroll-mt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Parceiros</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {['Oficinas credenciadas', 'Distribuidoras de peças', 'Seguradoras'].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Contato */}
        <section id="contato" className="py-14 sm:py-16 bg-white border-t border-slate-200 scroll-mt-20">
          <div className="max-w-xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 mb-2">
              <Headphones className="h-6 w-6 text-brand-cyan-deep" strokeWidth={1.75} aria-hidden />
              <h2 className="text-2xl font-bold text-slate-900">Fale conosco</h2>
            </div>
            <p className="text-sm text-slate-600 mb-8">
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
                className="w-full rounded-lg bg-brand-cyan-deep text-white font-semibold py-3 text-sm shadow-sm hover:opacity-95"
              >
                Enviar mensagem
              </button>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
