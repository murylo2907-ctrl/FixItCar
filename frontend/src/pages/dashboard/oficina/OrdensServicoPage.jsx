import { useEffect, useState } from 'react'
import MecanicoChamadoModal from '../../../components/dashboard/MecanicoChamadoModal.jsx'
import { useAppData } from '../../../hooks/useAppData.js'
import { CHAMADO_STATUS, labelChamadoStatus } from '../../../lib/chamadoFlow.js'

export default function OrdensServicoPage() {
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
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))

  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-6">Ordens de serviço</h1>
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[560px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="px-4 py-3 font-semibold">Placa</th>
              <th className="px-4 py-3 font-semibold">Seguro</th>
              <th className="px-4 py-3 font-semibold">Situação</th>
              <th className="px-4 py-3 font-semibold text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500 space-y-2">
                  <p>Nenhuma OS ativa.</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Se o motorista já abriu chamado: mesmo URL e modo do navegador, ou recarregue a página (F5).
                  </p>
                </td>
              </tr>
            ) : (
              lista.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono font-medium">{t.placa}</td>
                  <td className="px-4 py-3 text-slate-600">{t.usaSeguro ? 'Sim' : 'Não'}</td>
                  <td className="px-4 py-3 text-slate-700 max-w-xs">{labelChamadoStatus(t.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSel(t)}
                      className="text-sm font-semibold text-brand-cyan-deep hover:underline"
                    >
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
