import { useMemo, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useAppData } from '../../hooks/useAppData.js'
import {
  CHAMADO_STATUS,
  ETAPAS_OS,
  etapaOsFromStatus,
  labelChamadoStatus,
  labelEtapaOs,
  semaforoStatus,
  totalPecasSugeridas,
} from '../../lib/chamadoFlow.js'
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
    mecanicoRegistrarEvidencia,
    mecanicoSolicitarAditivo,
    mecanicoConcluirServico,
  } = useAppData()

  const mecanicaNome = useMemo(() => {
    const p = loadMecanicoPerfil(user?.id)
    return (p.nomeOficina || user?.nome || 'Oficina').trim()
  }, [user?.id, user?.nome])

  const [relatoSeguradora, setRelatoSeguradora] = useState(s.descricaoMecanico || '')
  const [laudo, setLaudo] = useState(s.descricaoMecanico || '')
  const [itensOrcamento, setItensOrcamento] = useState(() =>
    s.pecasSugeridas?.length ? s.pecasSugeridas.map((p) => ({ ...p, precoUnitario: p.precoUnitario ?? '' })) : []
  )
  const [rascunhoPeca, setRascunhoPeca] = useState(() => emptyPeca())
  const [erroRascunho, setErroRascunho] = useState('')
  const [evidenciaTexto, setEvidenciaTexto] = useState('')
  const [aditivoTexto, setAditivoTexto] = useState('')
  const [aditivoValor, setAditivoValor] = useState('')

  const pedidosDaOs = pedidos.filter((p) => p.solicitacaoId === s.id)
  const etapaAtual = etapaOsFromStatus(s.status, s.etapaOs)
  const idxEtapa = ETAPAS_OS.indexOf(etapaAtual)
  const semaforo = semaforoStatus(s.status)

  function submitOrcamento(e) {
    e.preventDefault()
    const rows = itensOrcamento
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

  function adicionarPecaDoRascunho() {
    const nome = String(rascunhoPeca.nome || '').trim()
    if (!nome) {
      setErroRascunho('Informe a peça ou o serviço antes de adicionar.')
      return
    }
    setErroRascunho('')
    const qtd = Math.max(1, Number(rascunhoPeca.qtd) || 1)
    const precoRaw = rascunhoPeca.precoUnitario
    setItensOrcamento((list) => [...list, { nome, qtd, precoUnitario: precoRaw }])
    setRascunhoPeca(emptyPeca())
  }

  function removerItemOrcamento(i) {
    setItensOrcamento((list) => list.filter((_, j) => j !== i))
  }

  const nomeMotorista = String(s.motoristaNome || '').trim()
  const modeloVeiculo = String(s.modelo || '').trim()

  const modalTitle = (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ordem de serviço</p>
      <p className="text-lg font-bold text-slate-900 leading-snug break-words">
        {nomeMotorista || 'Motorista'}
      </p>
      <p className="text-sm text-slate-600 font-normal leading-snug">
        Placa <span className="font-mono font-semibold text-slate-800">{s.placa}</span>
        {modeloVeiculo ? <span className="text-slate-500"> · {modeloVeiculo}</span> : null}
      </p>
    </div>
  )

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
          <p className="text-xs text-slate-500">
            {s.usaSeguro
              ? 'Com seguro — após triagem seguirá fluxo com seguradora; o orçamento será aprovado pela seguradora.'
              : 'Sem seguro — orçamento aprovado pelo motorista.'}
          </p>
          <button
            type="button"
            onClick={() => {
              mecanicoConfirmarTriagem(s.id, {
                mecanicoId: user?.id,
                mecanicoNome: mecanicaNome,
              })
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
          <p className="text-slate-600">
            {s.usaSeguro
              ? 'Registre laudo e itens do orçamento. A aprovação seguirá para a seguradora (não para o motorista).'
              : 'Registre laudo e itens do orçamento para aprovação do motorista.'}
          </p>
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
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-700">Peças e serviços</span>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Preencha uma linha e clique em <strong className="font-medium text-slate-600">Adicionar</strong> para incluir no
                orçamento. Os itens aparecem na lista abaixo.
              </p>
            </div>
            <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 px-0.5">
              <div className="col-span-5">Peça ou serviço</div>
              <div className="col-span-2 text-center">Qtd</div>
              <div className="col-span-3">Valor unit. (R$)</div>
              <div className="col-span-2 text-center"> </div>
            </div>
            <div className="grid grid-cols-12 gap-2 items-end rounded-lg border border-slate-100 bg-slate-50/50 p-2 sm:border-slate-200 sm:bg-slate-50/30 sm:p-3">
              <div className="col-span-12 sm:col-span-5">
                <label className="sm:hidden block text-[10px] font-medium text-slate-500 mb-0.5">Peça ou serviço</label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                  placeholder="Ex.: pastilha de freio, troca de óleo"
                  value={rascunhoPeca.nome}
                  onChange={(e) => {
                    setErroRascunho('')
                    setRascunhoPeca((row) => ({ ...row, nome: e.target.value }))
                  }}
                />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <label className="sm:hidden block text-[10px] font-medium text-slate-500 mb-0.5">Qtd</label>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm tabular-nums"
                  placeholder="1"
                  value={rascunhoPeca.qtd}
                  onChange={(e) => setRascunhoPeca((row) => ({ ...row, qtd: e.target.value }))}
                />
              </div>
              <div className="col-span-5 sm:col-span-3">
                <label className="sm:hidden block text-[10px] font-medium text-slate-500 mb-0.5">Valor unit. (R$)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  inputMode="decimal"
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm tabular-nums"
                  placeholder="0,00"
                  value={rascunhoPeca.precoUnitario}
                  onChange={(e) => setRascunhoPeca((row) => ({ ...row, precoUnitario: e.target.value }))}
                />
              </div>
              <div className="col-span-3 sm:col-span-2">
                <label className="sm:hidden block text-[10px] font-medium text-slate-500 mb-0.5 opacity-0 pointer-events-none select-none">
                  Ação
                </label>
                <button
                  type="button"
                  onClick={adicionarPecaDoRascunho}
                  className="w-full rounded-lg bg-brand-cyan-deep text-white text-xs font-semibold py-2 px-2 shadow-sm hover:opacity-95 active:opacity-90"
                >
                  Adicionar
                </button>
              </div>
            </div>
            {erroRascunho ? <p className="text-xs text-red-600">{erroRascunho}</p> : null}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <p className="text-xs font-semibold text-slate-600 px-3 py-2 bg-slate-50 border-b border-slate-100">
                Itens do orçamento
                {itensOrcamento.length > 0 ? (
                  <span className="font-normal text-slate-500"> ({itensOrcamento.length})</span>
                ) : null}
              </p>
              {itensOrcamento.length === 0 ? (
                <p className="px-3 py-4 text-sm text-slate-500 text-center">Nenhum item ainda. Adicione peças ou serviços acima.</p>
              ) : (
                <ul className="divide-y divide-slate-100 max-h-52 overflow-y-auto">
                  {itensOrcamento.map((p, i) => {
                    const unit =
                      p.precoUnitario === '' || p.precoUnitario === undefined
                        ? null
                        : Number(p.precoUnitario)
                    const q = Math.max(1, Number(p.qtd) || 1)
                    const sub = unit != null && !Number.isNaN(unit) ? unit * q : null
                    return (
                      <li key={`${p.nome}-${i}`} className="px-3 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                        <span className="font-medium text-slate-800 min-w-0 break-words">{p.nome}</span>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 justify-between sm:justify-end">
                          <span className="text-slate-600 tabular-nums text-xs sm:text-sm">
                            {q} un.
                            {unit != null && !Number.isNaN(unit) ? ` × R$ ${unit.toFixed(2)}` : ''}
                            {sub != null ? <span className="font-semibold text-slate-800"> = R$ {sub.toFixed(2)}</span> : null}
                          </span>
                          <button
                            type="button"
                            onClick={() => removerItemOrcamento(i)}
                            className="text-xs font-medium text-slate-500 hover:text-red-600 hover:underline shrink-0"
                          >
                            Remover
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={itensOrcamento.length === 0}
            className="w-full rounded-lg bg-slate-900 text-white font-semibold py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {s.usaSeguro ? 'Enviar orçamento à seguradora' : 'Enviar orçamento ao motorista'}
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

    if (
      s.status === CHAMADO_STATUS.AGUARDANDO_APROVACAO_CLIENTE ||
      s.status === CHAMADO_STATUS.AGUARDANDO_APROVACAO_SEGURADORA
    ) {
      const total = totalPecasSugeridas(s.pecasSugeridas)
      return (
        <div className="text-sm space-y-3 text-slate-700">
          <p className="text-slate-500">Situação: {labelChamadoStatus(s.status)}</p>
          {s.status === CHAMADO_STATUS.AGUARDANDO_APROVACAO_SEGURADORA ? (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Com seguro: a seguradora aprova o orçamento no painel dela. O motorista não aprova nesta etapa.
            </p>
          ) : null}
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
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <p className="text-xs font-semibold text-slate-700">Chat interno / evidência técnica</p>
            <div className="flex gap-2">
              <input
                value={evidenciaTexto}
                onChange={(e) => setEvidenciaTexto(e.target.value)}
                placeholder="Ex.: Foto peça velha vs nova anexada no box 2"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (!String(evidenciaTexto || '').trim()) return
                  mecanicoRegistrarEvidencia(s.id, {
                    descricao: evidenciaTexto,
                    tipo: 'foto',
                    autor: mecanicaNome,
                  })
                  setEvidenciaTexto('')
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
              >
                Postar
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
            <p className="text-xs font-semibold text-amber-900">Ajustar Orçamento</p>
            <textarea
              value={aditivoTexto}
              onChange={(e) => setAditivoTexto(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm bg-white"
              placeholder="Descreva o problema extra encontrado no conserto"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                step={0.01}
                value={aditivoValor}
                onChange={(e) => setAditivoValor(e.target.value)}
                className="w-40 rounded-lg border border-amber-200 px-3 py-2 text-sm bg-white"
                placeholder="Valor extra R$"
              />
              <button
                type="button"
                onClick={() => {
                  const ok = mecanicoSolicitarAditivo(s.id, {
                    motivo: aditivoTexto,
                    valor: aditivoValor,
                  })
                  if (ok) {
                    setAditivoTexto('')
                    setAditivoValor('')
                    onClose?.()
                  }
                }}
                className="rounded-lg bg-amber-500 text-white px-3 py-2 text-xs font-semibold"
              >
                Ajustar Orçamento
              </button>
            </div>
          </div>
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
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <p className="text-xs font-semibold text-slate-700">Ajustar Orçamento (se necessário)</p>
            <button
              type="button"
              onClick={() => {
                const ok = mecanicoSolicitarAditivo(s.id, {
                  motivo: 'Solicitação de aditivo durante aguardando peças',
                })
                if (ok) onClose?.()
              }}
              className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-800"
            >
              Ajustar Orçamento
            </button>
          </div>
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
    <Modal open={true} title={modalTitle} onClose={onClose} wide>
      <div className="space-y-4">
        <div className={`rounded-lg border px-3 py-2 text-xs font-medium ${semaforo.classe}`}>
          Semáforo do status: {semaforo.cor.toUpperCase()}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Timeline da OS</p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {ETAPAS_OS.map((et, i) => (
              <div
                key={et}
                className={`rounded-md border px-2 py-1.5 text-xs ${
                  i <= idxEtapa ? 'border-brand-cyan-deep bg-brand-cyan/20 text-slate-800' : 'border-slate-200 text-slate-500'
                }`}
              >
                {labelEtapaOs(et)}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Etapa: <span className="font-medium text-slate-700">{labelChamadoStatus(s.status)}</span>
        </p>
        {body}
        {(s.logDecisoes?.length || s.evidencias?.length) ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <p className="text-xs font-semibold text-slate-700">Log de decisões</p>
            <ul className="space-y-1 max-h-28 overflow-y-auto">
              {(s.logDecisoes || []).slice(0, 6).map((l) => (
                <li key={l.id} className="text-xs text-slate-600">
                  {new Date(l.createdAt).toLocaleString('pt-BR')} — {l.texto}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex justify-end pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  )
}
