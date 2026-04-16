import { useEffect, useMemo, useState } from 'react'
import Modal from '../../../components/ui/Modal.jsx'
import { useAuth } from '../../../hooks/useAuth.js'
import { useAppData } from '../../../hooks/useAppData.js'
import { CHAMADO_STATUS, chavePlacaComparacao, labelChamadoStatus } from '../../../lib/chamadoFlow.js'

export default function HistoricoSinistrosSeguradoraPage() {
  const { user } = useAuth()
  const { solicitacoes, veiculosSeguradora, syncAppData } = useAppData()
  const [detalhe, setDetalhe] = useState(null)

  useEffect(() => {
    syncAppData()
    function onFocus() {
      syncAppData()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [syncAppData])

  const placasCadastradas = useMemo(() => {
    const sid = Number(user?.id)
    const set = new Set()
    for (const v of veiculosSeguradora || []) {
      if (Number(v.seguradoraId) === sid) {
        const k = chavePlacaComparacao(v.placa)
        if (k) set.add(k)
      }
    }
    return set
  }, [veiculosSeguradora, user?.id])

  const lista = [...solicitacoes]
    .filter(
      (s) =>
        s.usaSeguro &&
        (s.status === CHAMADO_STATUS.FINALIZADO_PELA_SEGURADORA || s.status === CHAMADO_STATUS.CONCLUIDO)
    )
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))

  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Histórico de sinistros</h1>
      <p className="text-sm text-slate-500 mb-6 max-w-2xl">
        Chamados com seguro já encerrados pela seguradora (sem oficina) ou concluídos após reparo. Dados locais neste
        navegador.
      </p>

      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[640px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="px-4 py-3 font-semibold">Placa</th>
              <th className="px-4 py-3 font-semibold w-[88px] text-center">Na base</th>
              <th className="px-4 py-3 font-semibold">Relato</th>
              <th className="px-4 py-3 font-semibold">Situação</th>
              <th className="px-4 py-3 font-semibold">Encerrado</th>
              <th className="px-4 py-3 font-semibold text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500 space-y-2">
                  <p>Nenhum registro no histórico.</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Finalize um chamado em «Sinistros» ou aguarde conclusão na oficina para aparecer aqui.
                  </p>
                </td>
              </tr>
            ) : (
              lista.map((s) => {
                const naBase = placasCadastradas.has(chavePlacaComparacao(s.placa))
                return (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono font-medium">{s.placa}</td>
                    <td className="px-4 py-3 text-center text-sm">{naBase ? 'Sim' : 'Não'}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-[220px] truncate" title={s.descricao}>
                      {s.descricao}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{labelChamadoStatus(s.status)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(s.updatedAt || s.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDetalhe(s)}
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

      <Modal open={Boolean(detalhe)} title={detalhe ? `Sinistro — ${detalhe.placa}` : ''} onClose={() => setDetalhe(null)} wide>
        {detalhe ? (
          <div className="space-y-4 text-sm text-slate-700">
            <p>
              <span className="text-slate-500">Situação:</span>{' '}
              <span className="font-medium text-slate-900">{labelChamadoStatus(detalhe.status)}</span>
            </p>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Relato do motorista</p>
              <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 whitespace-pre-wrap">{detalhe.descricao}</p>
            </div>
            {detalhe.modelo ? (
              <p>
                <span className="text-slate-500">Modelo:</span> {detalhe.modelo}
              </p>
            ) : null}
            <p className="text-xs text-slate-500">
              Aberto em {new Date(detalhe.createdAt).toLocaleString('pt-BR')} · Atualizado em{' '}
              {new Date(detalhe.updatedAt || detalhe.createdAt).toLocaleString('pt-BR')}
            </p>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDetalhe(null)}
                className="rounded-lg bg-brand-cyan-deep text-white px-4 py-2 text-sm font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  )
}
