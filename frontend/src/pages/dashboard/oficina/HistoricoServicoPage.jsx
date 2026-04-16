import { useEffect, useMemo, useState } from 'react'
import { CalendarRange, CircleDollarSign, ClipboardCheck, Timer } from 'lucide-react'
import MecanicoChamadoModal from '../../../components/dashboard/MecanicoChamadoModal.jsx'
import { useAppData } from '../../../hooks/useAppData.js'
import {
  CHAMADO_STATUS,
  diasCorridosEntre,
  textoPrazoDiasCorridos,
  totalPecasSugeridas,
} from '../../../lib/chamadoFlow.js'

function CartaoResumoHistorico({ titulo, valor, hint, iconWrapClass, icon }) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm flex items-start justify-between gap-3 min-h-[108px]">
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

export default function HistoricoServicoPage() {
  const { solicitacoes, syncAppData } = useAppData()
  const [sel, setSel] = useState(null)
  const selLive = sel ? solicitacoes.find((s) => s.id === sel.id) ?? sel : null

  useEffect(() => {
    syncAppData()
    function onFocus() {
      syncAppData()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [syncAppData])

  const lista = [...solicitacoes]
    .filter((s) => s.status === CHAMADO_STATUS.CONCLUIDO)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))

  const painel = useMemo(() => {
    const totalServicos = lista.length
    const faturamentoTotal = lista.reduce((acc, s) => acc + totalPecasSugeridas(s.pecasSugeridas), 0)
    const diasArr = lista
      .map((s) => diasCorridosEntre(s.createdAt, s.updatedAt || s.createdAt))
      .filter((d) => d != null)
    const mediaDias =
      diasArr.length === 0 ? null : diasArr.reduce((a, b) => a + b, 0) / diasArr.length

    const now = new Date()
    const noMes = lista.filter((s) => {
      const d = new Date(s.updatedAt || s.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const servicosMes = noMes.length
    const faturamentoMes = noMes.reduce((acc, s) => acc + totalPecasSugeridas(s.pecasSugeridas), 0)

    return { totalServicos, faturamentoTotal, mediaDias, servicosMes, faturamentoMes }
  }, [lista])

  const textoMediaPrazo =
    painel.mediaDias == null
      ? '—'
      : painel.mediaDias === 0
        ? 'No mesmo dia'
        : `${painel.mediaDias.toFixed(1).replace('.', ',')} dias`

  return (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Histórico de serviço</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Resumo dos chamados já finalizados e lista detalhada. Valores seguem o orçamento registrado no sistema; dados
          ficam neste navegador (local).
        </p>
      </div>

      <section aria-label="Resumo do histórico" className="mb-8">
        <h2 className="sr-only">Indicadores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <CartaoResumoHistorico
            titulo="Serviços concluídos"
            valor={painel.totalServicos}
            hint="Total de OS encerradas neste ambiente."
            icon={<ClipboardCheck className="h-5 w-5" strokeWidth={2} />}
            iconWrapClass="bg-brand-cyan/45 text-brand-cyan-deep"
          />
          <CartaoResumoHistorico
            titulo="Faturamento referência"
            valor={`R$ ${painel.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            hint="Soma dos totais de orçamento dos serviços listados."
            icon={<CircleDollarSign className="h-5 w-5" strokeWidth={2} />}
            iconWrapClass="bg-emerald-100/90 text-emerald-800"
          />
          <CartaoResumoHistorico
            titulo="Prazo médio (abertura → encerramento)"
            valor={lista.length ? textoMediaPrazo : '—'}
            hint="Média em dias corridos, por chamado."
            icon={<Timer className="h-5 w-5" strokeWidth={2} />}
            iconWrapClass="bg-amber-100/80 text-amber-900"
          />
          <CartaoResumoHistorico
            titulo="Mês corrente"
            valor={painel.servicosMes}
            hint={`Faturamento ref. no mês: R$ ${painel.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<CalendarRange className="h-5 w-5" strokeWidth={2} />}
            iconWrapClass="bg-brand-rose/35 text-rose-900/90"
          />
        </div>
      </section>

      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[640px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="px-4 py-3 font-semibold">Placa</th>
              <th className="px-4 py-3 font-semibold">Seguro</th>
              <th className="px-4 py-3 font-semibold">Encerrado</th>
              <th className="px-4 py-3 font-semibold">Prazo</th>
              <th className="px-4 py-3 font-semibold text-right">Total ref.</th>
              <th className="px-4 py-3 font-semibold text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500 space-y-2">
                  <p>Nenhum serviço concluído ainda.</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Após «Finalizar serviço» em Ordens de serviço, o chamado aparece aqui.
                  </p>
                </td>
              </tr>
            ) : (
              lista.map((t) => {
                const total = totalPecasSugeridas(t.pecasSugeridas)
                const temTotal = t.pecasSugeridas?.length && total > 0
                const fim = t.updatedAt || t.createdAt
                const dias = diasCorridosEntre(t.createdAt, fim)
                return (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono font-medium">{t.placa}</td>
                    <td className="px-4 py-3 text-slate-600">{t.usaSeguro ? 'Sim' : 'Não'}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                      {new Date(fim).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{textoPrazoDiasCorridos(dias)}</td>
                    <td className="px-4 py-3 text-right text-slate-700 tabular-nums">
                      {temTotal ? `R$ ${total.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSel(t)}
                        className="text-sm font-semibold text-brand-cyan-deep hover:underline"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {selLive ? (
        <MecanicoChamadoModal
          key={`${selLive.id}-${selLive.status}`}
          solicitacao={selLive}
          onClose={() => setSel(null)}
        />
      ) : null}
    </>
  )
}
