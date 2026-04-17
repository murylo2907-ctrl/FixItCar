import { useMemo, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useAppData } from '../../hooks/useAppData.js'
import { CHAMADO_STATUS, labelChamadoStatus, totalPecasSugeridas } from '../../lib/chamadoFlow.js'
import { loadMecanicoPerfil } from '../../lib/mecanicoPerfil.js'

function emptyPeca() {
  return { nome: '', qtd: 1, precoUnitario: '' }
}

export default function MecanicoChamadoModal({ solicitacao: s, onClose }) {
  const { user } = useAuth()
  const {
    pedidos,
    mecanicoConfirmarTriagem,
    mecanicoEnviarParaSeguradora,
    mecanicoRegistrarOrcamento,
    mecanicoGerarPedidosCotacao,
    mecanicoConcluirServico,
  } = useAppData()

  const mecanicaNome = useMemo(() => {
    const p = loadMecanicoPerfil(user?.id)
    return (p.nomeOficina || user?.nome || 'Oficina').trim()
  }, [user?.id, user?.nome])

  const [relatoSeguradora, setRelatoSeguradora] = useState(s.descricaoMecanico || '')
  const [laudo, setLaudo] = useState(s.descricaoMecanico || '')
  const [pecas, setPecas] = useState(
    s.pecasSugeridas?.length ? s.pecasSugeridas.map((p) => ({ ...p, precoUnitario: p.precoUnitario ?? '' })) : [emptyPeca()]
  )

  const pedidosDaOs = pedidos.filter((p) => p.solicitacaoId === s.id)

  function submitOrcamento(e) {
    e.preventDefault()
    const rows = pecas
      .map((p) => ({
        nome: String(p.nome || '').trim(),
        qtd: Math.max(1, Number(p.qtd) || 1),
        precoUnitario: p.precoUnitario === '' ? undefined : Number(p.precoUnitario),
      }))
      .filter((p) => p.nome)
    if (!String(laudo || '').trim() || rows.length === 0) return
    mecanicoRegistrarOrcamento(s.id, laudo, rows)
    onClose?.()
  }

  function addPecaRow() {
    setPecas((list) => [...list, emptyPeca()])
  }

  function updatePeca(i, field, value) {
    setPecas((list) => list.map((row, j) => (j === i ? { ...row, [field]: value } : row)))
  }

  const body = (() => {
    if (
      s.status === CHAMADO_STATUS.PENDENTE_MECANICO ||
      s.status === CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO
    ) {
      return (
        <div className="space-y-4 text-sm text-slate-700">
          <p>
            <span className="text-slate-500">Placa:</span>{' '}
            <span className="font-mono font-semibold">{s.placa}</span>
          </p>
          <p className="whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-3">{s.descricao}</p>
          <p className="text-xs text-slate-500">{s.usaSeguro ? 'Com seguro — após triagem seguirá fluxo com seguradora.' : 'Sem seguro — orçamento direto ao motorista.'}</p>
          <button
            type="button"
            onClick={() => {
              mecanicoConfirmarTriagem(s.id)
              onClose?.()
            }}
            className="w-full rounded-lg bg-brand-cyan-deep text-white font-semibold py-2.5 text-sm"
          >
            Iniciar triagem
          </button>
        </div>
      )
    }

    if (s.status === CHAMADO_STATUS.EM_ANALISE_MECANICO) {
      if (s.usaSeguro && !s.seguradoraLiberouOficina) {
        return (
          <div className="space-y-4 text-sm">
            <p className="text-slate-600">Encaminhe o sinistro para análise da seguradora (relato opcional).</p>
            <textarea
              value={relatoSeguradora}
              onChange={(e) => setRelatoSeguradora(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Relato / observações para a seguradora"
            />
            <button
              type="button"
              onClick={() => {
                mecanicoEnviarParaSeguradora(s.id, relatoSeguradora)
                onClose?.()
              }}
              className="w-full rounded-lg bg-brand-cyan-deep text-white font-semibold py-2.5 text-sm"
            >
              Enviar à seguradora
            </button>
          </div>
        )
      }
      return (
        <form onSubmit={submitOrcamento} className="space-y-4 text-sm">
          <p className="text-slate-600">Registre laudo e itens do orçamento para aprovação do motorista.</p>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Laudo / proposta</label>
            <textarea
              required
              value={laudo}
              onChange={(e) => setLaudo(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Peças e serviços</span>
              <button type="button" onClick={addPecaRow} className="text-xs font-semibold text-brand-cyan-deep hover:underline">
                + linha
              </button>
            </div>
            {pecas.map((p, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-12 sm:col-span-5">
                  <input
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                    placeholder="Descrição"
                    value={p.nome}
                    onChange={(e) => updatePeca(i, 'nome', e.target.value)}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                    value={p.qtd}
                    onChange={(e) => updatePeca(i, 'qtd', e.target.value)}
                  />
                </div>
                <div className="col-span-8 sm:col-span-3">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                    placeholder="R$ / un."
                    value={p.precoUnitario}
                    onChange={(e) => updatePeca(i, 'precoUnitario', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
          <button type="submit" className="w-full rounded-lg bg-slate-900 text-white font-semibold py-2.5 text-sm">
            Enviar orçamento ao motorista
          </button>
        </form>
      )
    }

    if (s.status === CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA) {
      return (
        <div className="text-sm text-slate-600 space-y-2">
          <p>Chamado aguardando decisão da seguradora.</p>
          {s.descricaoMecanico ? (
            <p className="rounded-lg border border-slate-100 bg-slate-50 p-3 whitespace-pre-wrap text-slate-800">{s.descricaoMecanico}</p>
          ) : null}
        </div>
      )
    }

    if (s.status === CHAMADO_STATUS.AGUARDANDO_APROVACAO_CLIENTE) {
      const total = totalPecasSugeridas(s.pecasSugeridas)
      return (
        <div className="text-sm space-y-3 text-slate-700">
          <p className="text-slate-500">Situação: {labelChamadoStatus(s.status)}</p>
          {s.descricaoMecanico ? (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Proposta</p>
              <p className="whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-3">{s.descricaoMecanico}</p>
            </div>
          ) : null}
          {s.pecasSugeridas?.length ? (
            <p className="font-semibold">Total referência: R$ {total.toFixed(2)}</p>
          ) : null}
        </div>
      )
    }

    if (s.status === CHAMADO_STATUS.EM_REPARO) {
      return (
        <div className="space-y-4 text-sm">
          <p className="text-slate-600">Orçamento aprovado. Gere pedidos de cotação para a Auto Peças ou finalize o serviço.</p>
          <button
            type="button"
            onClick={() => {
              mecanicoGerarPedidosCotacao(s.id, mecanicaNome)
              onClose?.()
            }}
            className="w-full rounded-lg bg-brand-cyan-deep text-white font-semibold py-2.5"
          >
            Solicitar cotações de peças
          </button>
          <button
            type="button"
            onClick={() => {
              mecanicoConcluirServico(s.id)
              onClose?.()
            }}
            className="w-full rounded-lg border border-slate-200 bg-white font-semibold py-2.5 text-slate-800"
          >
            Finalizar serviço
          </button>
        </div>
      )
    }

    if (s.status === CHAMADO_STATUS.AGUARDANDO_PECAS) {
      return (
        <div className="space-y-4 text-sm">
          <p className="text-slate-600">Pedidos enviados à Auto Peças.</p>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
            {pedidosDaOs.length === 0 ? (
              <li className="p-3 text-slate-500">Nenhum pedido.</li>
            ) : (
              pedidosDaOs.map((p) => (
                <li key={p.id} className="p-3 flex justify-between gap-2">
                  <span>
                    {p.pecaNome} × {p.qtd}
                  </span>
                  <span className="text-xs text-slate-500">{p.status === 'respondido' ? 'Cotado' : 'Pendente'}</span>
                </li>
              ))
            )}
          </ul>
          <button
            type="button"
            onClick={() => {
              mecanicoConcluirServico(s.id)
              onClose?.()
            }}
            className="w-full rounded-lg bg-slate-900 text-white font-semibold py-2.5"
          >
            Finalizar serviço
          </button>
        </div>
      )
    }

    if (s.status === CHAMADO_STATUS.CONCLUIDO || s.status === CHAMADO_STATUS.FINALIZADO_PELA_SEGURADORA) {
      const total = totalPecasSugeridas(s.pecasSugeridas)
      return (
        <div className="text-sm space-y-3 text-slate-700">
          <p>{labelChamadoStatus(s.status)}</p>
          {s.descricaoMecanico ? <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 border border-slate-100">{s.descricaoMecanico}</p> : null}
          {total > 0 ? <p className="font-semibold tabular-nums">Total ref.: R$ {total.toFixed(2)}</p> : null}
        </div>
      )
    }

    return <p className="text-sm text-slate-600">{labelChamadoStatus(s.status)}</p>
  })()

  return (
    <Modal open={true} title={`OS — ${s.placa}`} onClose={onClose} wide>
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Etapa: <span className="font-medium text-slate-700">{labelChamadoStatus(s.status)}</span>
        </p>
        {body}
        <div className="flex justify-end pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  )
}
