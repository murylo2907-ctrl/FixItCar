import { useAppData } from '../../../hooks/useAppData.js'

export default function PedidosVendidosPage() {
  const { pedidos } = useAppData()
  const vendidos = pedidos
    .filter((p) => p.status === 'respondido')
    .sort((a, b) => new Date(b.respondidoAt || b.createdAt) - new Date(a.respondidoAt || a.createdAt))

  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-6">Pedidos vendidos</h1>
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="px-4 py-3 font-semibold">Peça</th>
              <th className="px-4 py-3 font-semibold">Placa</th>
              <th className="px-4 py-3 font-semibold">Valor</th>
              <th className="px-4 py-3 font-semibold">Prazo</th>
            </tr>
          </thead>
          <tbody>
            {vendidos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  Nenhum pedido cotado ainda.
                </td>
              </tr>
            ) : (
              vendidos.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">
                    {p.pecaNome} × {p.qtd}
                  </td>
                  <td className="px-4 py-3 font-mono">{p.placa}</td>
                  <td className="px-4 py-3">{p.preco != null ? `R$ ${p.preco.toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{p.prazoDias != null ? `${p.prazoDias} d` : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
