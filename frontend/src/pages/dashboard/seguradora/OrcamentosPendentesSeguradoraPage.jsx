import { useAuth } from '../../../hooks/useAuth.js'
import { useAppData } from '../../../hooks/useAppData.js'
import {
  CHAMADO_STATUS,
  labelChamadoStatus,
  seguradoraPodeAtuarNoChamado,
  totalPecasSugeridas,
} from '../../../lib/chamadoFlow.js'

export default function OrcamentosPendentesSeguradoraPage() {
  const { user } = useAuth()
  const { solicitacoes, veiculosSeguradora, seguradoraAprovarOrcamento } = useAppData()
  const sid = Number(user?.id)

  const pendentes = solicitacoes
    .filter(
      (s) => s.status === CHAMADO_STATUS.AGUARDANDO_APROVACAO_SEGURADORA && seguradoraPodeAtuarNoChamado(s, sid, veiculosSeguradora)
    )
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))

  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Aprovar orçamento (oficina)</h1>
      <p className="text-sm text-slate-600 mb-6 max-w-2xl">
        Chamados com seguro: a oficina envia o orçamento para a seguradora aprovar. Após a aprovação, a oficina segue com o
        reparo.
      </p>
      {pendentes.length === 0 ? (
        <p className="text-sm text-slate-500 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          Nenhum orçamento aguardando sua aprovação.
        </p>
      ) : (
        <ul className="space-y-4">
          {pendentes.map((s) => (
            <li key={s.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-mono font-semibold text-slate-900">{s.placa}</p>
                  {s.motoristaNome ? <p className="text-xs text-slate-500">Motorista: {s.motoristaNome}</p> : null}
                </div>
                <span className="text-xs text-slate-500">{labelChamadoStatus(s.status)}</span>
              </div>
              {s.descricaoMecanico ? (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Proposta da oficina</p>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 border border-slate-100">
                    {s.descricaoMecanico}
                  </p>
                </div>
              ) : null}
              {s.pecasSugeridas?.length ? (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Peças e serviços</p>
                  <ul className="text-sm list-disc pl-5 text-slate-700 space-y-1">
                    {s.pecasSugeridas.map((p, i) => (
                      <li key={i}>
                        {p.nome} × {p.qtd}
                        {Number.isFinite(Number(p.precoUnitario))
                          ? ` — R$ ${Number(p.precoUnitario).toFixed(2)} / un (subtotal R$ ${(Number(p.precoUnitario) * (Number(p.qtd) || 1)).toFixed(2)})`
                          : null}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm font-semibold text-slate-900 mt-2">
                    Total estimado: R$ {totalPecasSugeridas(s.pecasSugeridas).toFixed(2)}
                  </p>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => seguradoraAprovarOrcamento(s.id, user.id)}
                className="rounded-lg bg-brand-cyan-deep text-white text-sm font-semibold px-5 py-2.5 shadow-sm"
              >
                Aprovar orçamento
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
