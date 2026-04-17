import { useMemo, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
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
          <table className="w-full text-left text-sm min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Data</th>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Contato</th>
                <th className="px-4 py-3 font-semibold min-w-[200px]">Mensagem</th>
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
                    <td className="px-4 py-3 tabular-nums text-slate-600 whitespace-nowrap">
                      {formatarData(row.criadoEm)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[140px]">
                      <span className="line-clamp-2">{row.nome}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-[180px] break-words">
                      {row.contato}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <p className="line-clamp-3 whitespace-pre-wrap break-words">{row.mensagem}</p>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
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
