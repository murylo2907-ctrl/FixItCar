import { useMemo, useRef, useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { useAppData } from '../../hooks/useAppData.js'
import { getNotificationSummary } from '../../lib/notificationSummary.js'

/** Sino + painel (site público ou dashboard). */
export default function NotificationBell({ buttonClassName = '', layout = 'dashboard' }) {
  const { user } = useAuth()
  const { solicitacoes, avisosMotorista, pedidos, veiculosSeguradora, syncAppData, marcarAvisoMotoristaComoLido } =
    useAppData()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const { listaNotificacoes, totalBadge, pendentesOrcamento } = useMemo(
    () => getNotificationSummary(user, solicitacoes, avisosMotorista, pedidos, veiculosSeguradora),
    [user, solicitacoes, avisosMotorista, pedidos, veiculosSeguradora]
  )

  if (!user?.role) return null

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          syncAppData()
          setOpen((o) => !o)
        }}
        className={`relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${buttonClassName}`}
        aria-expanded={open}
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" strokeWidth={2} />
        {totalBadge > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-brand-rose-deep text-white text-[10px] font-bold flex items-center justify-center">
            {totalBadge > 9 ? '9+' : totalBadge}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-slate-200 bg-white shadow-xl z-50 py-2 max-h-[min(70vh,320px)] overflow-y-auto">
          <p className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Notificações</p>
          {user.role === 'motorista' && pendentesOrcamento > 0 ? (
            <div className="px-3 py-2 border-b border-slate-100 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Orçamento pendente</p>
              <p className="text-xs text-slate-600 mt-1">
                {pendentesOrcamento === 1
                  ? 'Há 1 orçamento aguardando sua aprovação.'
                  : `Há ${pendentesOrcamento} orçamentos aguardando sua aprovação.`}{' '}
                Abra <strong className="font-semibold">Aprovar orçamento</strong> no painel.
              </p>
            </div>
          ) : null}
          {user.role === 'seguradora' && pendentesOrcamento > 0 ? (
            <div className="px-3 py-2 border-b border-slate-100 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Orçamento da oficina</p>
              <p className="text-xs text-slate-600 mt-1">
                {pendentesOrcamento === 1
                  ? 'Há 1 orçamento aguardando aprovação da seguradora.'
                  : `Há ${pendentesOrcamento} orçamentos aguardando aprovação.`}{' '}
                Abra <strong className="font-semibold">Aprovar orçamento</strong> no menu.
              </p>
            </div>
          ) : null}
          {user.role === 'motorista' && listaNotificacoes.length === 0 && pendentesOrcamento === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-500">Nenhum aviso da seguradora no momento.</p>
          ) : null}
          {user.role === 'motorista'
            ? listaNotificacoes.map((a) => {
                const lida = Boolean(a.lida)
                return (
                  <div
                    key={a.id}
                    className={`px-3 py-2 border-t border-slate-100 first:border-t-0 text-sm ${
                      lida ? 'opacity-75' : ''
                    }`}
                  >
                    <p className="text-xs font-medium text-brand-cyan-deep">{a.seguradoraNome || 'Seguradora'}</p>
                    <p className="text-slate-700 mt-1 whitespace-pre-wrap text-xs leading-relaxed">{a.texto}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                      <p className="text-[10px] text-slate-400">{new Date(a.createdAt).toLocaleString('pt-BR')}</p>
                      {!lida ? (
                        <button
                          type="button"
                          onClick={() => marcarAvisoMotoristaComoLido(a.id)}
                          className="text-[11px] font-semibold text-brand-cyan-deep hover:text-brand-cyan-deep/90 hover:underline"
                        >
                          Marcar como lida
                        </button>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400">Lida</span>
                      )}
                    </div>
                  </div>
                )
              })
            : null}
          {user.role !== 'motorista' ? (
            <p className="px-3 py-4 text-sm text-slate-500">
              {totalBadge > 0 ? (
                user.role === 'mecanico' ? (
                  <>Você tem itens pendentes. Próxima ação sugerida: abrir <strong className="font-semibold">Ordens de serviço</strong>.</>
                ) : user.role === 'autopecas' ? (
                  <>Há cotações aguardando resposta. Próxima ação: <strong className="font-semibold">Cotações recebidas</strong>.</>
                ) : user.role === 'seguradora' ? (
                  <>Existem aprovações em fila. Próxima ação: <strong className="font-semibold">Aprovar orçamento</strong>.</>
                ) : layout === 'site' ? (
                  `Você tem ${totalBadge} item(ns) pendente(s). Abra o painel pelo link com seu nome.`
                ) : (
                  `Você tem ${totalBadge} item(ns) pendente(s) no painel. Abra o menu ao lado.`
                )
              ) : (
                'Nada pendente no momento.'
              )}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
