import { useEffect, useMemo, useState } from 'react'
import { useAppData } from '../../../hooks/useAppData.js'
import { useAuth } from '../../../hooks/useAuth.js'
import { solicitacaoVisivelParaMecanico } from '../../../lib/mecanicoSolicitacaoFilter.js'
import { CHAMADO_STATUS } from '../../../lib/chamadoFlow.js'

export default function SolicitarPecasPage() {
  const { user } = useAuth()
  const { pedidos, solicitacoes, dispararCotacaoRede, oficinaComprarPecasHibrido, syncAppData } = useAppData()
  const [selecoes, setSelecoes] = useState({})

  useEffect(() => {
    syncAppData()
  }, [syncAppData])

  const solById = useMemo(() => Object.fromEntries(solicitacoes.map((s) => [s.id, s])), [solicitacoes])

  const pendentes = pedidos
    .filter((p) => p.solicitacaoId)
    .filter((p) => {
      const sol = solById[p.solicitacaoId]
      if (!sol) return false
      const chamadoAtivo =
        sol.status !== CHAMADO_STATUS.CONCLUIDO && sol.status !== CHAMADO_STATUS.FINALIZADO_PELA_SEGURADORA
      if (!chamadoAtivo) return false
      return solicitacaoVisivelParaMecanico(sol, user?.id)
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const porOs = useMemo(() => {
    const map = {}
    for (const p of pendentes) {
      if (!map[p.solicitacaoId]) map[p.solicitacaoId] = []
      map[p.solicitacaoId].push(p)
    }
    return map
  }, [pendentes])

  const linhasComparativas = pendentes.filter((p) => p.status === 'respondido' || p.status === 'em_analise')

  function melhorCustoBeneficio(p) {
    const preco = Number(p.preco)
    const prazo = Number(p.prazoDias)
    if (!Number.isFinite(preco)) return false
    const ref = Number(p.precoUnitarioReferencia)
    const bomPreco = !Number.isFinite(ref) || preco <= ref
    const bomPrazo = !Number.isFinite(prazo) || prazo <= 2
    return bomPreco && bomPrazo
  }

  function toggleSelecao(p) {
    setSelecoes((s) => ({
      ...s,
      [p.id]: s[p.id]
        ? undefined
        : {
            id: p.id,
            fornecedor: p.fornecedorNome || 'Fornecedor',
            preco: p.preco,
            prazoDias: p.prazoDias,
            marca: p.marca,
          },
    }))
  }

  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-6">Solicitar peças</h1>
      <p className="text-sm text-slate-500 mb-4">
        Dispare cotações para a rede, compare preço/prazo/marca e compre híbrido (peças em fornecedores diferentes).
      </p>
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-x-auto mb-6">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="px-4 py-3 font-semibold">OS</th>
              <th className="px-4 py-3 font-semibold">Itens</th>
              <th className="px-4 py-3 font-semibold">Status cotação</th>
              <th className="px-4 py-3 font-semibold">Placa</th>
              <th className="px-4 py-3 font-semibold text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(porOs).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Nenhuma cotação pendente. Avance o chamado em Ordens de serviço até «Solicitar peças à Auto Peças».
                </td>
              </tr>
            ) : (
              Object.entries(porOs).map(([sid, rows]) => {
                const status =
                  rows.some((r) => r.status === 'comprado')
                    ? 'Comprado'
                    : rows.some((r) => r.status === 'respondido')
                      ? 'Respondido'
                      : rows.some((r) => r.status === 'em_analise')
                        ? 'Em análise'
                        : 'Solicitado'
                return (
                  <tr key={sid} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">#{sid.slice(0, 8)}</td>
                    <td className="px-4 py-3">{rows.length}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{status}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{rows[0]?.placa || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => dispararCotacaoRede(sid)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        Disparar para rede
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[920px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="px-4 py-3 font-semibold">Escolher</th>
              <th className="px-4 py-3 font-semibold">Peça</th>
              <th className="px-4 py-3 font-semibold">Fornecedor</th>
              <th className="px-4 py-3 font-semibold">Preço</th>
              <th className="px-4 py-3 font-semibold">Marca</th>
              <th className="px-4 py-3 font-semibold">Prazo</th>
              <th className="px-4 py-3 font-semibold">Selo</th>
            </tr>
          </thead>
          <tbody>
            {linhasComparativas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  Sem respostas de fornecedores para comparar.
                </td>
              </tr>
            ) : (
              linhasComparativas.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={Boolean(selecoes[p.id])} onChange={() => toggleSelecao(p)} />
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    {p.pecaNome} × {p.qtd}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{p.fornecedorNome || '—'}</td>
                  <td className="px-4 py-3 tabular-nums">{Number.isFinite(Number(p.preco)) ? `R$ ${Number(p.preco).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3">{p.marca || '—'}</td>
                  <td className="px-4 py-3">{Number.isFinite(Number(p.prazoDias)) ? `${Number(p.prazoDias)} dia(s)` : '—'}</td>
                  <td className="px-4 py-3">
                    {melhorCustoBeneficio(p) ? (
                      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">
                        Melhor custo-benefício
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            const escolhidos = Object.values(selecoes).filter(Boolean)
            if (!escolhidos.length) return
            const porSolicitacao = {}
            for (const s of escolhidos) {
              const pedido = pendentes.find((p) => p.id === s.id)
              if (!pedido) continue
              if (!porSolicitacao[pedido.solicitacaoId]) porSolicitacao[pedido.solicitacaoId] = []
              porSolicitacao[pedido.solicitacaoId].push(s)
            }
            Object.entries(porSolicitacao).forEach(([sid, rows]) => oficinaComprarPecasHibrido(sid, rows))
            setSelecoes({})
          }}
          className="rounded-lg bg-brand-cyan-deep text-white px-4 py-2 text-sm font-semibold"
        >
          Comprar peças selecionadas
        </button>
      </div>
    </>
  )
}
