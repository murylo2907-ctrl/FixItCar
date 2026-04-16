import { useEffect, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth.js'
import { useAppData } from '../../../hooks/useAppData.js'
import { chavePlacaComparacao } from '../../../lib/chamadoFlow.js'

export default function CadastroVeiculosSeguradoraPage() {
  const { user } = useAuth()
  const { veiculosSeguradora, cadastrarVeiculoSeguradora, removerVeiculoSeguradora, syncAppData } = useAppData()
  const [modelo, setModelo] = useState('')
  const [placa, setPlaca] = useState('')
  const [ano, setAno] = useState('')
  const [valorSeguro, setValorSeguro] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    syncAppData()
    function onFocus() {
      syncAppData()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [syncAppData])

  const lista = (veiculosSeguradora || [])
    .filter((v) => Number(v.seguradoraId) === Number(user?.id))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

  function submit(e) {
    e.preventDefault()
    setErro('')
    if (lista.some((v) => chavePlacaComparacao(v.placa) === chavePlacaComparacao(placa))) {
      setErro('Já existe um veículo cadastrado com esta placa.')
      return
    }
    const ok = cadastrarVeiculoSeguradora(user.id, {
      modelo,
      placa,
      ano,
      valorSeguro,
    })
    if (ok) {
      setModelo('')
      setPlaca('')
      setAno('')
      setValorSeguro('')
    } else {
      setErro('Confira os campos: modelo e placa obrigatórios, ano entre 1950 e 2100, valor do seguro ≥ 0.')
    }
  }

  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Cadastro de carros</h1>
      <p className="text-sm text-slate-500 mb-6 max-w-2xl">
        Registre veículos cobertos pela seguradora (modelo, placa, ano e valor da apólice/cobertura de referência). Os
        dados ficam neste navegador (local).
      </p>

      <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-5 mb-8">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Novo veículo</h2>
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-3">
            <label htmlFor="cv-modelo" className="block text-xs font-medium text-slate-600 mb-1">
              Modelo
            </label>
            <input
              id="cv-modelo"
              required
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Ex.: Fiat Uno Vivace"
            />
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="cv-placa" className="block text-xs font-medium text-slate-600 mb-1">
              Placa
            </label>
            <input
              id="cv-placa"
              required
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono uppercase"
              placeholder="ABC-1D23"
            />
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="cv-ano" className="block text-xs font-medium text-slate-600 mb-1">
              Ano
            </label>
            <input
              id="cv-ano"
              type="number"
              required
              min={1950}
              max={2100}
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="2020"
            />
          </div>
          <div className="lg:col-span-3">
            <label htmlFor="cv-valor" className="block text-xs font-medium text-slate-600 mb-1">
              Valor do seguro (R$)
            </label>
            <input
              id="cv-valor"
              type="number"
              required
              min={0}
              step={0.01}
              value={valorSeguro}
              onChange={(e) => setValorSeguro(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="0,00"
            />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-2">
            <button
              type="submit"
              className="rounded-lg bg-brand-cyan-deep text-white text-sm font-semibold px-4 py-2.5 shadow-sm w-full sm:w-auto"
            >
              Cadastrar
            </button>
          </div>
        </form>
        {erro ? <p className="text-sm text-red-600 mt-3">{erro}</p> : null}
      </div>

      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <h2 className="text-sm font-semibold text-slate-800 px-4 pt-4 pb-2">Veículos cadastrados</h2>
        <table className="w-full text-left text-sm min-w-[560px]">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
              <th className="px-4 py-3 font-semibold">Modelo</th>
              <th className="px-4 py-3 font-semibold">Placa</th>
              <th className="px-4 py-3 font-semibold">Ano</th>
              <th className="px-4 py-3 font-semibold text-right">Valor do seguro</th>
              <th className="px-4 py-3 font-semibold text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Nenhum veículo cadastrado ainda.
                </td>
              </tr>
            ) : (
              lista.map((v) => (
                <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 text-slate-800">{v.modelo}</td>
                  <td className="px-4 py-3 font-mono font-medium">{v.placa}</td>
                  <td className="px-4 py-3 text-slate-700">{v.ano}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                    R$ {Number(v.valorSeguro).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removerVeiculoSeguradora(user.id, v.id)}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
