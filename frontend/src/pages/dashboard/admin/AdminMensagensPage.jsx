import { useMemo, useState } from 'react'
import { Eye, Search, Trash2 } from 'lucide-react'
import Modal from '../../../components/ui/Modal.jsx'
import { loadMensagensContato, removeMensagemContato } from '../../../lib/saveContato.js'

function formatarData(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return String(iso)
  }
}

export default function AdminMensagensPage() {
  const [busca, setBusca] = useState('')
  const [tick, setTick] = useState(0)
  const [detalhe, setDetalhe] = useState(null)

  const linhas = useMemo(() => {
    void tick
    const q = busca.trim().toLowerCase()
    return loadMensagensContato().filter((row) => {
      if (!q) return true
      return (
        String(row.nome || '').toLowerCase().includes(q) ||
        String(row.contato || '').toLowerCase().includes(q) ||
        String(row.mensagem || '').toLowerCase().includes(q)
      )
    })
  }, [busca, tick])

  function recarregar() {
    setTick((t) => t + 1)
  }

  return (
    <>
      <Modal
        open={Boolean(detalhe)}
        wide
        title="Visualizar mensagem"
        onClose={() => setDetalhe(null)}
      >
        {detalhe ? (
          <div className="space-y-4 text-sm">
            <dl className="grid gap-3 sm:grid-cols-[auto_1fr] sm:gap-x-4 text-slate-700">
              <dt className="font-semibold text-slate-600 shrink-0">Data</dt>
              <dd>{formatarData(detalhe.criadoEm)}</dd>
              <dt className="font-semibold text-slate-600 shrink-0">Nome</dt>
              <dd className="text-slate-900 font-medium break-words">{detalhe.nome || '—'}</dd>
              <dt className="font-semibold text-slate-600 shrink-0">Contato</dt>
              <dd className="break-words">{detalhe.contato || '—'}</dd>
            </dl>
            <div>
              <p className="font-semibold text-slate-600 mb-1.5">Mensagem</p>
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-slate-800 whitespace-pre-wrap break-words max-h-[min(50vh,24rem)] overflow-y-auto text-sm leading-relaxed">
                {detalhe.mensagem || '—'}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mensagens</h1>
          <p className="text-sm text-slate-500 mt-1">
            Formulário «Fale conosco» da página inicial — armazenadas neste navegador (demonstração).
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/90 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="search"
              placeholder="Buscar por nome, contato ou mensagem…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm"
              aria-label="Buscar mensagens"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left text-sm min-w-[56rem]">
            <colgroup>
              <col className="w-[10.5rem]" />
              <col className="w-[14rem]" />
              <col className="w-[17rem]" />
              <col />
              <col className="w-[6.25rem]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Data</th>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Contato</th>
                <th className="px-4 py-3 font-semibold">Prévia da mensagem</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {linhas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Nenhuma mensagem recebida ainda.
                  </td>
                </tr>
              ) : (
                linhas.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/80 align-top">
                    <td className="px-4 py-3.5 tabular-nums text-slate-600 whitespace-nowrap align-middle">
                      {formatarData(row.criadoEm)}
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <span
                        className="font-medium text-slate-900 block truncate"
                        title={row.nome || ''}
                      >
                        {row.nome || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <span className="text-slate-700 block truncate" title={row.contato || ''}>
                        {row.contato || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 align-middle">
                      <p className="line-clamp-4 text-[13px] leading-snug whitespace-pre-wrap break-words text-slate-600">
                        {row.mensagem}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap align-middle">
                      <button
                        type="button"
                        onClick={() => setDetalhe(row)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-violet-600 hover:bg-violet-50 mr-1"
                        title="Visualizar mensagem completa"
                        aria-label={`Visualizar mensagem de ${row.nome}`}
                      >
                        <Eye className="h-4 w-4" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            !window.confirm('Excluir esta mensagem? Esta ação não pode ser desfeita.')
                          ) {
                            return
                          }
                          const r = removeMensagemContato(row.id)
                          if (!r.ok) {
                            alert(r.message)
                            return
                          }
                          if (detalhe && String(detalhe.id) === String(row.id)) setDetalhe(null)
                          recarregar()
                        }}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50"
                        title="Excluir"
                        aria-label={`Excluir mensagem de ${row.nome}`}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
