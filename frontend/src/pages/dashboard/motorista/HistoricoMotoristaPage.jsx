import { useEffect, useState } from 'react'
import MotoristaHistoricoDetalheModal from '../../../components/dashboard/MotoristaHistoricoDetalheModal.jsx'
import { useAuth } from '../../../hooks/useAuth.js'
import { useAppData } from '../../../hooks/useAppData.js'
import {
  CHAMADO_STATUS,
  diasCorridosEntre,
  labelChamadoStatus,
  textoPrazoDiasCorridos,
  totalPecasSugeridas,
} from '../../../lib/chamadoFlow.js'

export default function HistoricoMotoristaPage() {
  const { user } = useAuth()
  const { solicitacoes, pedidos, syncAppData } = useAppData()
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

  const lista = solicitacoes
    .filter((s) => Number(s.motoristaId) === Number(user?.id))
    .filter(
      (s) =>
        s.status === CHAMADO_STATUS.CONCLUIDO || s.status === CHAMADO_STATUS.FINALIZADO_PELA_SEGURADORA
    )
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))

  const totalGasto = lista.reduce((acc, s) => acc + totalPecasSugeridas(s.pecasSugeridas), 0)
  const ticketMedio = lista.length ? totalGasto / lista.length : 0

  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Histórico</h1>
      <p className="text-sm text-slate-500 mb-6">
        Serviços concluídos. Use <strong className="font-semibold text-slate-700">Detalhes</strong> para ver relato,
        descrição da oficina, valores e quanto tempo levou até a conclusão.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          Ticket médio: <span className="font-semibold">R$ {ticketMedio.toFixed(2)}</span>
        </p>
        <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          Total no histórico: <span className="font-semibold">R$ {totalGasto.toFixed(2)}</span>
        </p>
      </div>
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[640px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="px-4 py-3 font-semibold">Placa</th>
              <th className="px-4 py-3 font-semibold">Situação</th>
              <th className="px-4 py-3 font-semibold">Encerrado</th>
              <th className="px-4 py-3 font-semibold">Prazo</th>
              <th className="px-4 py-3 font-semibold text-right">Orçamento aprovado</th>
              <th className="px-4 py-3 font-semibold text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Nenhum serviço concluído ainda.
                </td>
              </tr>
            ) : (
              lista.map((s) => {
                const fim = s.updatedAt || s.createdAt
                const dias = diasCorridosEntre(s.createdAt, fim)
                const total = totalPecasSugeridas(s.pecasSugeridas)
                const temValor = s.pecasSugeridas?.length && total > 0
                return (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono font-medium">{s.placa}</td>
                    <td className="px-4 py-3 text-slate-700">{labelChamadoStatus(s.status)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(fim).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{textoPrazoDiasCorridos(dias)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                      {temValor ? `R$ ${total.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSel(s)}
                        className="text-sm font-semibold text-brand-cyan-deep hover:underline"
                      >
                        Detalhes
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
        <MotoristaHistoricoDetalheModal
          key={selLive.id}
          solicitacao={selLive}
          pedidos={pedidos}
          onClose={() => setSel(null)}
        />
      ) : null}
    </>
  )
}
