import { useEffect } from 'react'
import { useAppData } from '../../../hooks/useAppData.js'

export default function SolicitarPecasPage() {
  const { pedidos, syncAppData } = useAppData()

  useEffect(() => {
    syncAppData()
  }, [syncAppData])
  const pendentes = pedidos
    .filter((p) => p.status === 'pendente' && p.solicitacaoId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-6">Solicitar peças</h1>
      <p className="text-sm text-slate-500 mb-4">
        Pedidos enviados à Auto Peças após a etapa «Solicitar peças» no chamado (fluxo aprovado ou com seguro).
      </p>
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="px-4 py-3 font-semibold">Peça</th>
              <th className="px-4 py-3 font-semibold">Qtd</th>
              <th className="px-4 py-3 font-semibold">Placa</th>
              <th className="px-4 py-3 font-semibold">OS</th>
            </tr>
          </thead>
          <tbody>
            {pendentes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  Nenhuma cotação pendente. Avance o chamado em Ordens de serviço até «Solicitar peças à Auto Peças».
                </td>
              </tr>
            ) : (
              pendentes.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{p.pecaNome}</td>
                  <td className="px-4 py-3">{p.qtd}</td>
                  <td className="px-4 py-3 font-mono">{p.placa}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">#{p.solicitacaoId.slice(0, 8)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
