import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../../../components/ui/Modal.jsx'
import { useAuth } from '../../../hooks/useAuth.js'
import { useAppData } from '../../../hooks/useAppData.js'
import { CHAMADO_STATUS, labelChamadoStatus, progressoMotoristaChamado } from '../../../lib/chamadoFlow.js'
import { loadMotoristaPerfil, motoristaPerfilCompletoParaChamado } from '../../../lib/motoristaPerfil.js'

export default function MeusCarrosPage() {
  const { user } = useAuth()
  const { solicitacoes, criarChamado, syncAppData } = useAppData()
  const [modal, setModal] = useState(false)
  const [placa, setPlaca] = useState('')
  const [modelo, setModelo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [possuiSeguro, setPossuiSeguro] = useState('')
  const [erro, setErro] = useState('')

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
    const s = criarChamado(user.id, { placa, descricao, modelo, usaSeguro, motoristaNome })
    if (!s) {
      setErro('Informe a placa e a descrição.')
      return
    }
    setPlaca('')
    setModelo('')
    setDescricao('')
    setPossuiSeguro('')
    setModal(false)
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
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                      <div>
                        <p className="font-mono font-semibold text-slate-900">{s.placa}</p>
                        {s.modelo ? <p className="text-xs text-slate-500">{s.modelo}</p> : null}
                        <p className="text-sm text-slate-700 mt-1">{s.descricao}</p>
                        <p className="text-xs text-slate-500 mt-1">{labelChamadoStatus(s.status)}</p>
                      </div>
                      <span className="text-xs font-mono text-slate-400">#{s.id.slice(0, 8)}</span>
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
    </>
  )
}
