import { useEffect, useState } from 'react'
import MecanicoChamadoModal from '../../../components/dashboard/MecanicoChamadoModal.jsx'
import { useAppData } from '../../../hooks/useAppData.js'
import { useAuth } from '../../../hooks/useAuth.js'
import { CHAMADO_STATUS, labelChamadoStatus } from '../../../lib/chamadoFlow.js'
import { solicitacaoVisivelParaMecanico } from '../../../lib/mecanicoSolicitacaoFilter.js'

const triagem = [CHAMADO_STATUS.PENDENTE_MECANICO, CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO]

export default function EntradaVeiculosPage() {
  const { user } = useAuth()
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
  const hoje = new Date().toDateString()

  const lista = solicitacoes
    .filter((s) => triagem.includes(s.status))
    .filter((s) => solicitacaoVisivelParaMecanico(s, user?.id))
    .filter((s) => new Date(s.createdAt).toDateString() === hoje)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const fila = solicitacoes
    .filter((s) => triagem.includes(s.status))
    .filter((s) => solicitacaoVisivelParaMecanico(s, user?.id))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Entrada de veículos</h1>
      <p className="text-sm text-slate-500 mb-6">Chamados novos para a oficina (sem seguro ou após encaminhamento da seguradora).</p>
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-x-auto mb-6">
        <div className="px-4 py-2 border-b border-slate-100 bg-amber-50/80 text-xs font-semibold text-amber-900">
          Chegadas hoje ({lista.length})
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="px-4 py-3 font-semibold">Placa</th>
              <th className="px-4 py-3 font-semibold">Relato</th>
              <th className="px-4 py-3 font-semibold">Etapa</th>
              <th className="px-4 py-3 font-semibold text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Nenhuma entrada hoje nesta fila.
                </td>
              </tr>
            ) : (
              lista.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono font-semibold">{t.placa}</td>
                  <td className="px-4 py-3 text-slate-700 max-w-md truncate">{t.descricao}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{labelChamadoStatus(t.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => setSel(t)} className="text-sm font-semibold text-brand-cyan-deep hover:underline">
                      Triar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <h2 className="text-sm font-semibold text-slate-800 mb-2">Fila completa</h2>
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="px-4 py-3 font-semibold">Placa</th>
              <th className="px-4 py-3 font-semibold">Entrada</th>
              <th className="px-4 py-3 font-semibold">Etapa</th>
              <th className="px-4 py-3 text-right font-semibold">Ação</th>
            </tr>
          </thead>
          <tbody>
            {fila.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Fila vazia.
                </td>
              </tr>
            ) : (
              fila.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono">{t.placa}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{new Date(t.createdAt).toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{labelChamadoStatus(t.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => setSel(t)} className="text-sm font-semibold text-brand-cyan-deep hover:underline">
                      Abrir
                    </button>
                  </td>
                </tr>
              ))
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
