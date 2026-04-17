import Modal from '../ui/Modal.jsx'
import {
  CHAMADO_STATUS,
  diasCorridosEntre,
  labelChamadoStatus,
  textoPrazoDiasCorridos,
  totalPecasSugeridas,
} from '../../lib/chamadoFlow.js'

export default function MotoristaHistoricoDetalheModal({ solicitacao: s, pedidos, onClose }) {
  const fim = s.updatedAt || s.createdAt
  const dias = diasCorridosEntre(s.createdAt, fim)
  const total = totalPecasSugeridas(s.pecasSugeridas)
  const meusPedidos = (pedidos || []).filter((p) => p.solicitacaoId === s.id)

  return (
    <Modal open={true} title={`Detalhes — ${s.placa}`} onClose={onClose} wide>
      <div className="space-y-4 text-sm text-slate-700">
        <p>
          <span className="text-slate-500">Situação:</span>{' '}
          <span className="font-medium text-slate-900">{labelChamadoStatus(s.status)}</span>
          {s.status === CHAMADO_STATUS.FINALIZADO_PELA_SEGURADORA ? (
            <span className="ml-2 text-xs text-amber-700">(encerrado pela seguradora)</span>
          ) : null}
        </p>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Seu relato</p>
          <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 whitespace-pre-wrap">{s.descricao}</p>
        </div>
        {s.descricaoMecanico ? (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Proposta da oficina</p>
            <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 whitespace-pre-wrap">{s.descricaoMecanico}</p>
          </div>
        ) : null}
        {s.pecasSugeridas?.length ? (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Peças e serviços</p>
            <ul className="list-disc pl-5 space-y-1">
              {s.pecasSugeridas.map((p, i) => (
                <li key={i}>
                  {p.nome} × {p.qtd}
                  {Number.isFinite(Number(p.precoUnitario)) ? ` — R$ ${Number(p.precoUnitario).toFixed(2)} / un` : null}
                </li>
              ))}
            </ul>
            {total > 0 ? (
              <p className="mt-2 font-semibold text-slate-900 tabular-nums">Total referência: R$ {total.toFixed(2)}</p>
            ) : null}
          </div>
        ) : null}
        {meusPedidos.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Cotações de peças</p>
            <ul className="space-y-2">
              {meusPedidos.map((p) => (
                <li key={p.id} className="rounded-lg border border-slate-100 px-3 py-2 text-xs sm:text-sm">
                  <span className="font-medium">{p.pecaNome}</span> × {p.qtd}
                  <span className="text-slate-500"> · {p.status === 'respondido' ? `R$ ${Number(p.preco).toFixed(2)}` : 'Pendente'}</span>
                  {p.prazoDias != null ? <span className="text-slate-500"> · {p.prazoDias} d</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="text-xs text-slate-500">
          Aberto em {new Date(s.createdAt).toLocaleString('pt-BR')} · Atualizado em {new Date(fim).toLocaleString('pt-BR')}
          {dias != null ? ` · ${textoPrazoDiasCorridos(dias)} até o encerramento` : null}
        </p>
        <div className="flex justify-end pt-2">
          <button type="button" onClick={onClose} className="rounded-lg bg-brand-cyan-deep text-white px-4 py-2 text-sm font-semibold">
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  )
}
