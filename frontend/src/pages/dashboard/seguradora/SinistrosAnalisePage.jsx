import { useEffect, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import Modal from '../../../components/ui/Modal.jsx'
import { useAuth } from '../../../hooks/useAuth.js'
import { useAppData } from '../../../hooks/useAppData.js'
import { CHAMADO_STATUS, chavePlacaComparacao, labelChamadoStatus } from '../../../lib/chamadoFlow.js'

/** Mesma largura e tipografia para os dois botões da coluna Ação. */
const CLASSE_BOTAO_ACAO =
  'inline-flex justify-center items-center min-w-[14rem] whitespace-nowrap rounded-lg text-xs font-semibold px-3 py-2 shadow-sm'

function textoSugeridoAvisoSeguro(placa) {
  return `Olá,

Identificamos que o veículo de placa ${placa} não consta em nossa base de segurados neste chamado.

Se desejar contratar ou regularizar um seguro, entre em contato com a seguradora pelos nossos canais oficiais.

Atenciosamente.`
}

export default function SinistrosAnalisePage() {
  const { user } = useAuth()
  const {
    solicitacoes,
    veiculosSeguradora,
    avisosMotorista,
    encaminharSeguradoraParaOficina,
    finalizarSinistroSeguradora,
    enviarAvisoSeguradoraParaMotorista,
    syncAppData,
  } = useAppData()

  const [modalItem, setModalItem] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [erroModal, setErroModal] = useState('')

  useEffect(() => {
    syncAppData()
    function onFocus() {
      syncAppData()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [syncAppData])

  const chamadosComAvisoEnviado = useMemo(() => {
    const sid = Number(user?.id)
    const set = new Set()
    for (const a of avisosMotorista || []) {
      if (Number(a.seguradoraId) === sid && a.solicitacaoId) set.add(a.solicitacaoId)
    }
    return set
  }, [avisosMotorista, user?.id])

  const placasCadastradas = useMemo(() => {
    const sid = Number(user?.id)
    const set = new Set()
    for (const v of veiculosSeguradora || []) {
      if (Number(v.seguradoraId) === sid) {
        const k = chavePlacaComparacao(v.placa)
        if (k) set.add(k)
      }
    }
    return set
  }, [veiculosSeguradora, user?.id])

  function placaNaBaseCadastro(placa) {
    const k = chavePlacaComparacao(placa)
    return Boolean(k && placasCadastradas.has(k))
  }

  const pendentes = solicitacoes
    .filter(
      (s) =>
        s.status === CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA ||
        (s.usaSeguro && s.status === CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO)
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  function abrirModalAviso(item) {
    setErroModal('')
    setModalItem(item)
    setMensagem(textoSugeridoAvisoSeguro(item.placa))
  }

  function fecharModal() {
    setModalItem(null)
    setMensagem('')
    setErroModal('')
  }

  function enviarMensagem(e) {
    e.preventDefault()
    setErroModal('')
    if (!modalItem) return
    const ok = enviarAvisoSeguradoraParaMotorista(modalItem.id, {
      seguradoraId: user.id,
      seguradoraNome: user?.nome,
      texto: mensagem,
    })
    if (ok) fecharModal()
    else setErroModal('Não foi possível enviar. Confira se a mensagem tem pelo menos 15 caracteres e o chamado ainda está «Enviado à seguradora».')
  }

  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-6">Sinistros</h1>
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[720px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="px-4 py-3 font-semibold">Placa</th>
              <th className="px-4 py-3 font-semibold w-[100px] text-center">Status</th>
              <th className="px-4 py-3 font-semibold">Relato</th>
              <th className="px-4 py-3 font-semibold">Situação</th>
              <th className="px-4 py-3 font-semibold text-center">Aviso ao motorista</th>
              <th className="px-4 py-3 font-semibold text-center">Ação</th>
            </tr>
          </thead>
          <tbody>
            {pendentes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Nenhum chamado aguardando encaminhamento.
                </td>
              </tr>
            ) : (
              pendentes.map((item) => {
                const naBase = placaNaBaseCadastro(item.placa)
                const avisoJaEnviado = chamadosComAvisoEnviado.has(item.id)
                return (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-mono font-medium">{item.placa}</td>
                    <td className="px-4 py-3 text-center">
                      {naBase ? (
                        <span className="inline-flex justify-center" title="Placa cadastrada em Cadastro de carros">
                          <Check className="h-5 w-5 text-emerald-600 mx-auto" strokeWidth={2.5} aria-label="Placa cadastrada" />
                        </span>
                      ) : (
                        <span className="inline-flex justify-center" title="Placa não cadastrada na base">
                          <X className="h-5 w-5 text-red-500 mx-auto" strokeWidth={2.5} aria-label="Placa não cadastrada" />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate" title={item.descricao}>
                      {item.descricao}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{labelChamadoStatus(item.status)}</td>
                    <td className="px-4 py-3 text-center">
                      {!naBase ? (
                        avisoJaEnviado ? (
                          <span
                            className="inline-flex justify-center items-center min-w-[7.5rem] rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-2"
                            title="Aviso já enviado ao motorista"
                          >
                            Enviado
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => abrirModalAviso(item)}
                            className="rounded-lg border border-brand-cyan-deep/40 bg-brand-cyan/30 text-brand-cyan-deep text-xs font-semibold px-3 py-2 hover:bg-brand-cyan/50"
                          >
                            Enviar aviso
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-slate-400" title="Veículo já consta no cadastro de carros">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {naBase ? (
                        <button
                          type="button"
                          onClick={() =>
                            encaminharSeguradoraParaOficina(item.id, {
                              seguradoraId: user.id,
                              seguradoraNome: user?.nome,
                            })
                          }
                          className={`${CLASSE_BOTAO_ACAO} bg-brand-cyan-deep text-white`}
                        >
                          Encaminhar para oficina
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => finalizarSinistroSeguradora(item.id)}
                          className={`${CLASSE_BOTAO_ACAO} bg-slate-800 text-white hover:bg-slate-900`}
                        >
                          Finalizar chamado
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal open={Boolean(modalItem)} title="Mensagem ao motorista" onClose={fecharModal} wide>
        {modalItem ? (
          <form onSubmit={enviarMensagem} className="space-y-4">
            <p className="text-sm text-slate-600">
              Chamado <span className="font-mono font-medium">{modalItem.placa}</span> — a mensagem abaixo será exibida
              para o motorista em <strong className="font-semibold text-slate-800">Meus carros</strong>.
            </p>
            <div>
              <label htmlFor="msg-aviso" className="block text-xs font-medium text-slate-600 mb-1">
                Texto do aviso (editável)
              </label>
              <textarea
                id="msg-aviso"
                required
                rows={8}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-y min-h-[160px]"
              />
            </div>
            {erroModal ? <p className="text-sm text-red-600">{erroModal}</p> : null}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={fecharModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
                Cancelar
              </button>
              <button type="submit" className="rounded-lg bg-brand-cyan-deep text-white px-4 py-2 text-sm font-semibold">
                Enviar ao motorista
              </button>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  )
}
