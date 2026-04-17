import { useEffect, useMemo } from 'react'
import { CalendarRange, CircleDollarSign, PackageCheck, Timer } from 'lucide-react'
import { useAppData } from '../../../hooks/useAppData.js'
import { diasCorridosEntre, textoPrazoDiasCorridos } from '../../../lib/chamadoFlow.js'

function formatBrl(n) {
  if (n == null || !Number.isFinite(Number(n))) return '—'
  return Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Total da linha: preço unitário cotado × quantidade. */
function subtotalVenda(p) {
  const unit = Number(p?.preco)
  const q = Math.max(1, Number(p?.qtd) || 1)
  if (!Number.isFinite(unit) || unit < 0) return 0
  return unit * q
}

function CartaoResumoPecas({ titulo, valor, hint, iconWrapClass, icon }) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm flex items-start justify-between gap-3 min-h-[108px] ring-1 ring-slate-100/80">
      <div className="min-w-0 pt-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{titulo}</p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1 tabular-nums leading-tight">{valor}</p>
        {hint ? <p className="text-xs text-slate-500 mt-1.5 leading-snug">{hint}</p> : null}
      </div>
      <div
        className={`shrink-0 rounded-xl p-2.5 flex items-center justify-center ring-1 ring-slate-200/80 ${iconWrapClass}`}
        aria-hidden
      >
        {icon}
      </div>
    </div>
  )
}

export default function PedidosVendidosPage() {
  const { pedidos, syncAppData } = useAppData()

  useEffect(() => {
    syncAppData()
    function onFocus() {
      syncAppData()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [syncAppData])

  const vendidos = useMemo(
    () =>
      [...pedidos]
        .filter((p) => p.status === 'respondido')
        .sort((a, b) => new Date(b.respondidoAt || b.createdAt) - new Date(a.respondidoAt || a.createdAt)),
    [pedidos]
  )

  const painel = useMemo(() => {
    const totalItens = vendidos.length
    const faturamentoTotal = vendidos.reduce((acc, p) => acc + subtotalVenda(p), 0)
    const diasArr = vendidos
      .map((p) => diasCorridosEntre(p.createdAt, p.respondidoAt || p.createdAt))
      .filter((d) => d != null)
    const mediaDias =
      diasArr.length === 0 ? null : diasArr.reduce((a, b) => a + b, 0) / diasArr.length

    const now = new Date()
    const noMes = vendidos.filter((p) => {
      const d = new Date(p.respondidoAt || p.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const itensMes = noMes.length
    const faturamentoMes = noMes.reduce((acc, p) => acc + subtotalVenda(p), 0)

    return { totalItens, faturamentoTotal, mediaDias, itensMes, faturamentoMes }
  }, [vendidos])

  const textoMediaResposta =
    painel.mediaDias == null
      ? '—'
      : painel.mediaDias === 0
        ? 'No mesmo dia'
        : `${painel.mediaDias.toFixed(1).replace('.', ',')} dias`

  return (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Histórico de peças</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Visão das peças já cotadas e respondidas: totais por linha (preço unitário × quantidade), prazos ofertados e
          recorte do mês. Os valores refletem o que você informou ao cotar; dados sincronizam com a API quando você está
          logado e o servidor está ativo.
        </p>
      </div>

      <section aria-label="Resumo do histórico de peças" className="mb-8">
        <h2 className="sr-only">Indicadores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <CartaoResumoPecas
            titulo="Peças registradas"
            valor={painel.totalItens}
            hint="Linhas com cotação enviada e fechada neste ambiente."
            icon={<PackageCheck className="h-5 w-5" strokeWidth={2} />}
            iconWrapClass="bg-brand-cyan/45 text-brand-cyan-deep"
          />
          <CartaoResumoPecas
            titulo="Faturamento (peças)"
            valor={formatBrl(painel.faturamentoTotal)}
            hint="Soma dos subtotais: preço unitário cotado × quantidade, por linha."
            icon={<CircleDollarSign className="h-5 w-5" strokeWidth={2} />}
            iconWrapClass="bg-emerald-100/90 text-emerald-800"
          />
          <CartaoResumoPecas
            titulo="Prazo médio (pedido → resposta)"
            valor={vendidos.length ? textoMediaResposta : '—'}
            hint="Média em dias corridos até registrar a cotação."
            icon={<Timer className="h-5 w-5" strokeWidth={2} />}
            iconWrapClass="bg-amber-100/80 text-amber-900"
          />
          <CartaoResumoPecas
            titulo="Mês corrente"
            valor={painel.itensMes}
            hint={`Faturamento no mês: ${formatBrl(painel.faturamentoMes)}`}
            icon={<CalendarRange className="h-5 w-5" strokeWidth={2} />}
            iconWrapClass="bg-brand-rose/35 text-rose-900/90"
          />
        </div>
      </section>

      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-800">Detalhamento das peças</h2>
          <button
            type="button"
            onClick={() => syncAppData()}
            className="self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Atualizar lista
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="px-4 py-3 font-semibold">Peça</th>
                <th className="px-4 py-3 font-semibold">Placa</th>
                <th className="px-4 py-3 font-semibold">Oficina</th>
                <th className="px-4 py-3 font-semibold text-right">Valor unit.</th>
                <th className="px-4 py-3 font-semibold text-right">Total</th>
                <th className="px-4 py-3 font-semibold">Prazo</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Respondido</th>
              </tr>
            </thead>
            <tbody>
              {vendidos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-slate-600 font-medium">Nenhuma peça no histórico ainda.</p>
                    <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                      Quando você responder uma cotação em «Cotações recebidas», a peça aparece aqui com valores e prazo.
                      Use o mesmo navegador e URL que a oficina para ver os pedidos desta demo.
                    </p>
                  </td>
                </tr>
              ) : (
                vendidos.map((p) => {
                  const unit = Number(p.preco)
                  const temUnit = Number.isFinite(unit) && unit >= 0
                  const sub = subtotalVenda(p)
                  const fim = p.respondidoAt || p.createdAt
                  const prazoEntrega =
                    p.prazoDias != null && p.prazoDias !== '' && Number.isFinite(Number(p.prazoDias))
                      ? textoPrazoDiasCorridos(Number(p.prazoDias))
                      : '—'
                  return (
                    <tr key={p.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 align-top">
                        <span className="font-medium text-slate-900">{p.pecaNome}</span>
                        <span className="text-slate-500"> × {p.qtd}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-800 align-top">{p.placa}</td>
                      <td className="px-4 py-3 text-slate-600 align-top max-w-[10rem] sm:max-w-xs truncate" title={p.mecanicaNome}>
                        {p.mecanicaNome || '—'}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700 align-top">
                        {temUnit ? formatBrl(unit) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900 align-top">
                        {sub > 0 ? formatBrl(sub) : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-700 align-top">{prazoEntrega}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap align-top">
                        {new Date(fim).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
