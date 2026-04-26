import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import Modal from '../../../components/ui/Modal.jsx'
import { useAuth } from '../../../hooks/useAuth.js'
import { useAppData } from '../../../hooks/useAppData.js'
import { CHAMADO_STATUS, labelChamadoStatus, progressoMotoristaChamado } from '../../../lib/chamadoFlow.js'
import { loadMotoristaPerfil, motoristaPerfilCompletoParaChamado } from '../../../lib/motoristaPerfil.js'

export default function MeusCarrosPage() {
  const { user } = useAuth()
  const { solicitacoes, criarChamado, motoristaEditarChamado, syncAppData } = useAppData()
  const [modal, setModal] = useState(false)
  const [edicaoId, setEdicaoId] = useState(null)
  const [placa, setPlaca] = useState('')
  const [modelo, setModelo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [possuiSeguro, setPossuiSeguro] = useState('')
  const [vozCliente, setVozCliente] = useState('')
  const [fotoFrente, setFotoFrente] = useState(false)
  const [fotoTraseira, setFotoTraseira] = useState(false)
  const [fotoLados, setFotoLados] = useState(false)
  const [fotoPainel, setFotoPainel] = useState(false)
  const [sinistroNumero, setSinistroNumero] = useState('')
  const [nomePerito, setNomePerito] = useState('')
  const [erro, setErro] = useState('')
  const [editPlaca, setEditPlaca] = useState('')
  const [editModelo, setEditModelo] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPossuiSeguro, setEditPossuiSeguro] = useState('')
  const [erroEdicao, setErroEdicao] = useState('')

  const emEdicao = edicaoId ? solicitacoes.find((x) => x.id === edicaoId) : null

  const meus = solicitacoes
    .filter((s) => Number(s.motoristaId) === Number(user?.id))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const perfilParaChamado = motoristaPerfilCompletoParaChamado(user?.id, user)

  useEffect(() => {
    syncAppData()
    function onFocus() {
      syncAppData()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [syncAppData])

  function abrirChamado(e) {
    e.preventDefault()
    setErro('')
    const perfil = motoristaPerfilCompletoParaChamado(user.id, user)
    if (!perfil.ok) {
      setErro(perfil.message)
      return
    }
    if (possuiSeguro !== 'sim' && possuiSeguro !== 'nao') {
      setErro('Indique se possui seguro (Sim ou Não).')
      return
    }
    const usaSeguro = possuiSeguro === 'sim'
    const perfilNome = String(loadMotoristaPerfil(user.id).nome || '').trim()
    const motoristaNome = String(user.nome || perfilNome || '').trim()
    const s = criarChamado(user.id, {
      placa,
      descricao,
      modelo,
      usaSeguro,
      motoristaNome,
      triagem: {
        vozCliente,
        checklistFotos: {
          frente: fotoFrente,
          traseira: fotoTraseira,
          lados: fotoLados,
          painel: fotoPainel,
        },
        sinistroNumero,
        nomePerito,
      },
    })
    if (!s) {
      setErro('Informe a placa e a descrição.')
      return
    }
    setPlaca('')
    setModelo('')
    setDescricao('')
    setPossuiSeguro('')
    setVozCliente('')
    setFotoFrente(false)
    setFotoTraseira(false)
    setFotoLados(false)
    setFotoPainel(false)
    setSinistroNumero('')
    setNomePerito('')
    setModal(false)
  }

  function abrirEdicao(s) {
    setErroEdicao('')
    setEdicaoId(s.id)
    setEditPlaca(s.placa || '')
    setEditModelo(s.modelo || '')
    setEditDesc(s.descricao || '')
    setEditPossuiSeguro(s.usaSeguro ? 'sim' : 'nao')
  }

  function salvarEdicao(e) {
    e.preventDefault()
    setErroEdicao('')
    if (!edicaoId || !user?.id) return
    const alvo = solicitacoes.find((x) => x.id === edicaoId)
    if (!alvo) return
    const podeMudarSeguro =
      alvo.status === CHAMADO_STATUS.PENDENTE_MECANICO ||
      alvo.status === CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO ||
      alvo.status === CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA
    if (podeMudarSeguro && editPossuiSeguro !== 'sim' && editPossuiSeguro !== 'nao') {
      setErroEdicao('Indique se possui seguro (Sim ou Não).')
      return
    }
    const usaSeguro = podeMudarSeguro ? editPossuiSeguro === 'sim' : Boolean(alvo.usaSeguro)
    const r = motoristaEditarChamado(user.id, edicaoId, {
      placa: editPlaca,
      modelo: editModelo,
      descricao: editDesc,
      usaSeguro,
    })
    if (r.ok) {
      setEdicaoId(null)
    } else {
      setErroEdicao(r.message || 'Não foi possível salvar.')
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Meus carros</h1>
        <button
          type="button"
          disabled={!perfilParaChamado.ok}
          title={
            perfilParaChamado.ok
              ? 'Abrir novo chamado'
              : 'Complete os dados obrigatórios em Meu perfil para abrir um chamado.'
          }
          onClick={() => {
            if (!motoristaPerfilCompletoParaChamado(user.id, user).ok) return
            setModal(true)
          }}
          className="rounded-lg bg-brand-rose text-slate-900 font-semibold text-sm px-5 py-2.5 shadow-sm ring-1 ring-brand-rose-deep/30 hover:bg-brand-rose-deep/90 shrink-0 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
        >
          Abrir chamado
        </button>
      </div>

      {!perfilParaChamado.ok ? (
        <div className="mb-6 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 sm:px-5 sm:py-4 text-sm text-amber-950 shadow-sm">
          <p className="font-medium text-amber-900">Perfil incompleto</p>
          <p className="mt-1 text-amber-900/90 leading-relaxed">{perfilParaChamado.message}</p>
          <Link
            to="/dashboard/motorista/perfil"
            className="mt-3 inline-flex text-sm font-semibold text-brand-cyan-deep hover:underline"
          >
            Ir para Meu perfil
          </Link>
        </div>
      ) : null}

      <section className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          <h2 className="text-sm font-semibold text-slate-800">Acompanhamento</h2>
        </div>
        {meus.filter(
          (s) =>
            s.status !== CHAMADO_STATUS.CONCLUIDO && s.status !== CHAMADO_STATUS.FINALIZADO_PELA_SEGURADORA
        ).length === 0 ? (
          <p className="text-sm text-slate-500 px-4 py-10 text-center">Nenhum chamado ativo.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {meus
              .filter(
                (s) =>
                  s.status !== CHAMADO_STATUS.CONCLUIDO &&
                  s.status !== CHAMADO_STATUS.FINALIZADO_PELA_SEGURADORA
              )
              .map((s) => {
                const pct = progressoMotoristaChamado(s.status)
                return (
                  <li key={s.id} className="px-4 py-4 sm:px-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-mono font-semibold text-slate-900">{s.placa}</p>
                        {s.modelo ? <p className="text-xs text-slate-500">{s.modelo}</p> : null}
                        <p className="text-sm text-slate-700 mt-1">{s.descricao}</p>
                        <p className="text-xs text-slate-500 mt-1">{labelChamadoStatus(s.status)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 sm:flex-col sm:items-end sm:gap-1">
                        <button
                          type="button"
                          onClick={() => abrirEdicao(s)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                          Editar
                        </button>
                        <span className="text-xs font-mono text-slate-400 sm:text-right">#{s.id.slice(0, 8)}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progresso</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 ring-1 ring-slate-200/80 overflow-hidden">
                        <div className="h-full rounded-full bg-brand-cyan-deep" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </li>
                )
              })}
          </ul>
        )}
      </section>

      <Modal open={modal} title="Novo chamado" onClose={() => setModal(false)}>
        <form onSubmit={abrirChamado} className="space-y-4">
          <div>
            <label htmlFor="placa" className="block text-xs font-medium text-slate-600 mb-1">
              Placa
            </label>
            <input
              id="placa"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
              maxLength={12}
              required
            />
          </div>
          <div>
            <label htmlFor="modelo" className="block text-xs font-medium text-slate-600 mb-1">
              Modelo (opcional)
            </label>
            <input
              id="modelo"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="desc" className="block text-xs font-medium text-slate-600 mb-1">
              Ocorrido
            </label>
            <textarea
              id="desc"
              required
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-y min-h-[96px]"
            />
          </div>
          <fieldset>
            <legend className="block text-xs font-medium text-slate-600 mb-2">Possui seguro?</legend>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="seguro"
                  value="sim"
                  checked={possuiSeguro === 'sim'}
                  onChange={() => setPossuiSeguro('sim')}
                  className="text-brand-cyan-deep"
                />
                Sim
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="seguro"
                  value="nao"
                  checked={possuiSeguro === 'nao'}
                  onChange={() => setPossuiSeguro('nao')}
                  className="text-brand-cyan-deep"
                />
                Não
              </label>
            </div>
          </fieldset>
          <div>
            <label htmlFor="voz-cliente" className="block text-xs font-medium text-slate-600 mb-1">
              Voz do cliente (relato)
            </label>
            <textarea
              id="voz-cliente"
              rows={3}
              value={vozCliente}
              onChange={(e) => setVozCliente(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-y min-h-[80px]"
              placeholder="Ex.: barulho ao frear, vibração em alta, luz de injeção acesa..."
            />
          </div>
          <fieldset>
            <legend className="block text-xs font-medium text-slate-600 mb-2">Checklist de fotos</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                <input type="checkbox" checked={fotoFrente} onChange={(e) => setFotoFrente(e.target.checked)} />
                Frente
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                <input type="checkbox" checked={fotoTraseira} onChange={(e) => setFotoTraseira(e.target.checked)} />
                Traseira
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                <input type="checkbox" checked={fotoLados} onChange={(e) => setFotoLados(e.target.checked)} />
                Lados
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                <input type="checkbox" checked={fotoPainel} onChange={(e) => setFotoPainel(e.target.checked)} />
                Painel
              </label>
            </div>
          </fieldset>
          {possuiSeguro === 'sim' ? (
            <div className="rounded-lg border border-cyan-100 bg-cyan-50/70 p-3 space-y-3">
              <p className="text-xs text-cyan-900 font-medium">Dados de seguradora (abertura dinâmica)</p>
              <div>
                <label htmlFor="sinistro" className="block text-xs font-medium text-slate-600 mb-1">
                  Sinistro
                </label>
                <input
                  id="sinistro"
                  value={sinistroNumero}
                  onChange={(e) => setSinistroNumero(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Número do sinistro"
                />
              </div>
              <div>
                <label htmlFor="perito" className="block text-xs font-medium text-slate-600 mb-1">
                  Nome do perito
                </label>
                <input
                  id="perito"
                  value={nomePerito}
                  onChange={(e) => setNomePerito(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Perito responsável"
                />
              </div>
            </div>
          ) : null}
          {erro ? <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p> : null}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-brand-cyan-deep text-white px-4 py-2 text-sm font-semibold">
              Registrar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(edicaoId && emEdicao)}
        title="Editar chamado"
        onClose={() => {
          setEdicaoId(null)
          setErroEdicao('')
          setEditPossuiSeguro('')
        }}
      >
        {emEdicao ? (
          <form onSubmit={salvarEdicao} className="space-y-4">
            {(() => {
              const podeMudarSeguro =
                emEdicao.status === CHAMADO_STATUS.PENDENTE_MECANICO ||
                emEdicao.status === CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO ||
                emEdicao.status === CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA
              return podeMudarSeguro ? (
                <p className="text-xs text-slate-500">
                  Ajuste placa, modelo, ocorrido e seguro enquanto o chamado ainda não estiver com a oficina em análise ou
                  reparo.
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Ajuste placa, modelo e ocorrido. O seguro deste chamado não pode ser alterado nesta etapa (oficina ou
                  seguradora já avançaram).
                </p>
              )
            })()}
            <div>
              <label htmlFor="edit-placa" className="block text-xs font-medium text-slate-600 mb-1">
                Placa
              </label>
              <input
                id="edit-placa"
                value={editPlaca}
                onChange={(e) => setEditPlaca(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                maxLength={12}
                required
              />
            </div>
            <div>
              <label htmlFor="edit-modelo" className="block text-xs font-medium text-slate-600 mb-1">
                Modelo (opcional)
              </label>
              <input
                id="edit-modelo"
                value={editModelo}
                onChange={(e) => setEditModelo(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="edit-desc" className="block text-xs font-medium text-slate-600 mb-1">
                Ocorrido
              </label>
              <textarea
                id="edit-desc"
                required
                rows={4}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-y min-h-[96px]"
              />
            </div>
            {(() => {
              const podeMudarSeguro =
                emEdicao.status === CHAMADO_STATUS.PENDENTE_MECANICO ||
                emEdicao.status === CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO ||
                emEdicao.status === CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA
              return (
                <fieldset className={!podeMudarSeguro ? 'opacity-80' : ''}>
                  <legend className="block text-xs font-medium text-slate-600 mb-2">Possui seguro?</legend>
                  <div className="flex flex-col gap-2">
                    <label
                      className={`flex items-center gap-2 text-sm text-slate-800 ${
                        podeMudarSeguro ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                    >
                      <input
                        type="radio"
                        name="seguro-edicao"
                        value="sim"
                        disabled={!podeMudarSeguro}
                        checked={editPossuiSeguro === 'sim'}
                        onChange={() => setEditPossuiSeguro('sim')}
                        className="text-brand-cyan-deep disabled:opacity-50"
                      />
                      Sim
                    </label>
                    <label
                      className={`flex items-center gap-2 text-sm text-slate-800 ${
                        podeMudarSeguro ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                    >
                      <input
                        type="radio"
                        name="seguro-edicao"
                        value="nao"
                        disabled={!podeMudarSeguro}
                        checked={editPossuiSeguro === 'nao'}
                        onChange={() => setEditPossuiSeguro('nao')}
                        className="text-brand-cyan-deep disabled:opacity-50"
                      />
                      Não
                    </label>
                  </div>
                </fieldset>
              )
            })()}
            {erroEdicao ? <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erroEdicao}</p> : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEdicaoId(null)
                  setErroEdicao('')
                  setEditPossuiSeguro('')
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button type="submit" className="rounded-lg bg-brand-cyan-deep text-white px-4 py-2 text-sm font-semibold">
                Salvar alterações
              </button>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  )
}
