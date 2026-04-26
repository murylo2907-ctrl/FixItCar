import { useEffect, useState } from 'react'
import MecanicoChamadoModal from '../../../components/dashboard/MecanicoChamadoModal.jsx'
import { useAppData } from '../../../hooks/useAppData.js'
import { useAuth } from '../../../hooks/useAuth.js'
import { CHAMADO_STATUS, etapaOsFromStatus, labelChamadoStatus } from '../../../lib/chamadoFlow.js'
import { solicitacaoVisivelParaMecanico } from '../../../lib/mecanicoSolicitacaoFilter.js'

export default function OrdensServicoPage() {
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

  const lista = [...solicitacoes]
    .filter(
      (s) =>
        s.status !== CHAMADO_STATUS.CONCLUIDO && s.status !== CHAMADO_STATUS.FINALIZADO_PELA_SEGURADORA
    )
    .filter((s) => solicitacaoVisivelParaMecanico(s, user?.id))
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))

  const colunas = [
    { id: 'triagem', titulo: 'Triagem' },
    { id: 'orcamento', titulo: 'Orçamento' },
    { id: 'aprovacao', titulo: 'Aprovação' },
    { id: 'execucao', titulo: 'Em execução' },
    { id: 'pronto', titulo: 'Finalizado' },
  ]

  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-6">Ordens de serviço</h1>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
        {colunas.map((c) => {
          const cards = lista.filter((s) => etapaOsFromStatus(s.status, s.etapaOs) === c.id)
          return (
            <section key={c.id} className="rounded-xl border border-slate-200 bg-white shadow-sm min-h-[240px]">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{c.titulo}</h2>
                <span className="text-[11px] text-slate-500">{cards.length}</span>
              </div>
              <div className="p-3 space-y-2">
                {cards.length === 0 ? <p className="text-xs text-slate-400">Sem itens.</p> : null}
                {cards.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSel(t)}
                    className="w-full text-left rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2"
                  >
                    <p className="font-mono text-sm font-semibold text-slate-900">{t.placa}</p>
                    <p className="text-xs text-slate-600">{t.usaSeguro ? 'Seguradora' : 'Particular'}</p>
                    <p className="text-xs text-slate-500 mt-1 truncate">{labelChamadoStatus(t.status)}</p>
                  </button>
                ))}
              </div>
            </section>
          )
        })}
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
