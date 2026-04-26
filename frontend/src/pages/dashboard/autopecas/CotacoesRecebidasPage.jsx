import { useEffect, useMemo, useState } from 'react'
import Modal from '../../../components/ui/Modal.jsx'
import { useAppData } from '../../../hooks/useAppData.js'
import { totalPecasSugeridas } from '../../../lib/chamadoFlow.js'

function formatBrl(n) {
  if (n == null || !Number.isFinite(Number(n))) return null
  return Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Preço unitário do orçamento da oficina (pedido novo ou dados antigos só na solicitação). */
function precoUnitarioReferenciaPedido(pedido, solicitacao) {
  const direto = Number(pedido?.precoUnitarioReferencia)
  if (Number.isFinite(direto) && direto >= 0) return direto
  const pecas = solicitacao?.pecasSugeridas
  if (!pecas?.length) return null
  const byNomeQtd = pecas.find(
    (x) => String(x.nome || '').trim() === String(pedido?.pecaNome || '').trim() && Number(x.qtd) === Number(pedido?.qtd)
  )
  const byNome = byNomeQtd || pecas.find((x) => String(x.nome || '').trim() === String(pedido?.pecaNome || '').trim())
  const u = Number(byNome?.precoUnitario)
  return Number.isFinite(u) && u >= 0 ? u : null
}

export default function CotacoesRecebidasPage() {
  const { pedidos, solicitacoes, responderPedidoOrcamento, syncAppData } = useAppData()
  const [ativo, setAtivo] = useState(null)
  const [preco, setPreco] = useState('')
  const [prazo, setPrazo] = useState('')
  const [marca, setMarca] = useState('Original')
  const [fornecedorNome, setFornecedorNome] = useState('')

  const pendentes = pedidos
    .filter((p) => (p.status === 'pendente' || p.status === 'em_analise') && p.solicitacaoId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  useEffect(() => {
    syncAppData()
    function onFocus() {
      syncAppData()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [syncAppData])

  const solicitacaoAtiva = useMemo(
    () => (ativo ? solicitacoes.find((s) => s.id === ativo.solicitacaoId) : null),
    [ativo, solicitacoes]
  )

  function enviarResposta(e) {
    e.preventDefault()
    if (!ativo) return
    const v = Number(preco)
    if (Number.isNaN(v) || v < 0) return
    responderPedidoOrcamento(ativo.id, {
      preco: v,
      prazoDias: prazo === '' ? undefined : Number(prazo),
      marca,
      fornecedorNome,
    })
    setAtivo(null)
  }

  const unitRef = ativo ? precoUnitarioReferenciaPedido(ativo, solicitacaoAtiva) : null
  const subtotalRef =
    unitRef != null && Number.isFinite(Number(ativo?.qtd)) ? unitRef * Math.max(1, Number(ativo.qtd) || 1) : null
  const totalOrcamentoOficina = solicitacaoAtiva?.pecasSugeridas?.length
    ? totalPecasSugeridas(solicitacaoAtiva.pecasSugeridas)
    : null

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Cotações recebidas</h1>
        <button
          type="button"
          onClick={() => syncAppData()}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 shrink-0"
        >
          Atualizar lista
        </button>
      </div>
      <ul className="space-y-3">
        {pendentes.length === 0 ? (
          <li className="rounded-xl bg-white border border-slate-200 p-8 text-center text-sm text-slate-500 shadow-sm space-y-3">
            <p>Nenhuma cotação pendente.</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Dados locais neste navegador — mesmo URL e modo (normal/anónimo) que a oficina. Use «Atualizar lista».
            </p>
          </li>
        ) : (
          pendentes.map((c) => (
            <li
              key={c.id}
              className="rounded-xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {c.pecaNome} <span className="text-slate-500 font-normal">×{c.qtd}</span>
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  <span className="font-mono">{c.placa}</span> · {c.mecanicaNome}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAtivo(c)
                  setPreco('')
                  setPrazo('')
                  setMarca('Original')
                  setFornecedorNome('')
                }}
                className="rounded-lg bg-brand-cyan text-slate-900 font-semibold text-sm px-5 py-2.5 shadow-sm ring-1 ring-brand-cyan-deep/30 hover:bg-brand-cyan-deep/20 shrink-0"
              >
                Cotar
              </button>
            </li>
          ))
        )}
      </ul>

      <Modal open={Boolean(ativo)} title="Responder cotação" onClose={() => setAtivo(null)} wide>
        {ativo ? (
          <form onSubmit={enviarResposta} className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 sm:p-4 space-y-3 text-sm text-slate-700">
              <p>
                <span className="font-medium text-slate-800">Chamado</span>{' '}
                <span className="font-mono font-semibold text-slate-900">{ativo.placa}</span>
                <span className="text-slate-400 mx-1.5">·</span>
                <span className="text-slate-600">{ativo.mecanicaNome || 'Oficina'}</span>
              </p>
              {solicitacaoAtiva?.descricaoMecanico ? (
                <div>
                  <p className="font-medium text-slate-800 mb-1">Laudo / descrição da oficina</p>
                  <p className="text-slate-600 whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
                    {solicitacaoAtiva.descricaoMecanico}
                  </p>
                </div>
              ) : null}
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <p className="font-medium text-slate-800">Item pedido para cotação</p>
                <p>
                  <span className="text-slate-900 font-medium">{ativo.pecaNome}</span>{' '}
                  <span className="text-slate-500">× {ativo.qtd}</span>
                </p>
                {unitRef != null ? (
                  <div className="rounded-lg bg-white border border-brand-cyan/40 ring-1 ring-brand-cyan-deep/15 px-3 py-2.5 space-y-1">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Valor que a oficina pediu (orçamento aprovado)
                    </p>
                    <p className="text-lg font-bold text-slate-900 tabular-nums">
                      {formatBrl(unitRef)}
                      <span className="text-sm font-normal text-slate-500"> / unidade</span>
                    </p>
                    {subtotalRef != null ? (
                      <p className="text-sm text-slate-700">
                        Subtotal: <span className="font-semibold text-slate-900 tabular-nums">{formatBrl(subtotalRef)}</span>
                        <span className="text-slate-500">
                          {' '}
                          ({ativo.qtd} × {formatBrl(unitRef)})
                        </span>
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg px-2.5 py-2">
                    Esta cotação não traz preço de referência da oficina no cadastro. Informe seu preço unitário abaixo.
                  </p>
                )}
                {totalOrcamentoOficina != null && totalOrcamentoOficina > 0 ? (
                  <p className="text-xs text-slate-500 pt-1">
                    Total geral do orçamento aprovado (todas as linhas da OS):{' '}
                    <span className="font-semibold text-slate-700 tabular-nums">{formatBrl(totalOrcamentoOficina)}</span>
                  </p>
                ) : null}
              </div>
            </div>
            <div>
              <label htmlFor="fornecedor" className="block text-xs font-medium text-slate-600 mb-1">
                Fornecedor / loja
              </label>
              <input
                id="fornecedor"
                value={fornecedorNome}
                onChange={(e) => setFornecedorNome(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Nome da autopeças"
              />
            </div>
            <div>
              <label htmlFor="marca" className="block text-xs font-medium text-slate-600 mb-1">
                Marca
              </label>
              <select
                id="marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
              >
                <option>Original</option>
                <option>Paralela</option>
                <option>Primeira linha</option>
                <option>Usada com garantia</option>
              </select>
            </div>
            <div>
              <label htmlFor="preco" className="block text-xs font-medium text-slate-600 mb-1">
                Preço unitário (R$)
              </label>
              <input
                id="preco"
                type="number"
                min={0}
                step={0.01}
                required
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="prazo" className="block text-xs font-medium text-slate-600 mb-1">
                Prazo (dias, opcional)
              </label>
              <input
                id="prazo"
                type="number"
                min={0}
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setAtivo(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
                Cancelar
              </button>
              <button type="submit" className="rounded-lg bg-brand-rose text-slate-900 font-semibold px-4 py-2 text-sm ring-1 ring-brand-rose-deep/30">
                Enviar
              </button>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  )
}
