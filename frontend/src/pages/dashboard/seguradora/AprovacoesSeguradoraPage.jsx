import { useAppData } from '../../../hooks/useAppData.js'
import { CHAMADO_STATUS, labelChamadoStatus } from '../../../lib/chamadoFlow.js'

export default function AprovacoesSeguradoraPage() {
  const { solicitacoes } = useAppData()
  const lista = solicitacoes
    .filter((s) => s.usaSeguro && s.status === CHAMADO_STATUS.CONCLUIDO)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))

  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-6">Concluídos (com seguro)</h1>
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="px-4 py-3 font-semibold">Placa</th>
              <th className="px-4 py-3 font-semibold">Situação</th>
              <th className="px-4 py-3 font-semibold">Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                  Nenhum registro.
                </td>
              </tr>
            ) : (
              lista.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono font-medium">{s.placa}</td>
                  <td className="px-4 py-3 text-slate-700">{labelChamadoStatus(s.status)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(s.updatedAt || s.createdAt).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
