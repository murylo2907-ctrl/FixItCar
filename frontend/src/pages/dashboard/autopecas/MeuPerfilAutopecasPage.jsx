import { useEffect, useState } from 'react'
import { UserCircle } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth.js'
import { fetchPerfilFromApi, getStoredToken, pushPerfilToApi } from '../../../lib/apiClient.js'
import { loadAutopecasPerfil, saveAutopecasPerfil } from '../../../lib/autopecasPerfil.js'
import PerfilEmailReadonly from '../../../components/dashboard/PerfilEmailReadonly.jsx'

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

function onlyDigits(s) {
  return String(s || '').replace(/\D/g, '')
}

function formatCnpj(digits) {
  const d = digits.slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

function formatTel(digits) {
  const d = digits.slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function ReqMark() {
  return (
    <span className="text-red-600 font-semibold" aria-hidden="true">
      {' *'}
    </span>
  )
}

export default function MeuPerfilAutopecasPage() {
  const { user, updateUser } = useAuth()
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [razaoSocial, setRazaoSocial] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [atuacao, setAtuacao] = useState('')
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState(false)

  function aplicarPerfil(p) {
    setNomeFantasia(String(p.nomeFantasia || '').trim())
    setRazaoSocial(String(p.razaoSocial || '').trim())
    setCnpj(p.cnpj ? formatCnpj(onlyDigits(p.cnpj)) : '')
    setTelefone(p.telefone ? formatTel(onlyDigits(p.telefone)) : '')
    setEndereco(String(p.endereco || '').trim())
    setCidade(String(p.cidade || '').trim())
    setEstado(String(p.estado || '').trim())
    setAtuacao(String(p.atuacao || '').trim())
  }

  useEffect(() => {
    if (!user?.id) return
    aplicarPerfil(loadAutopecasPerfil(user.id))
    let cancelled = false
    const t = getStoredToken()
    if (!t) return undefined
    ;(async () => {
      try {
        const remote = await fetchPerfilFromApi(t)
        if (cancelled || !remote || typeof remote !== 'object') return
        const has =
          remote.nomeFantasia ||
          remote.razaoSocial ||
          remote.cnpj ||
          remote.telefone ||
          remote.endereco
        if (has) aplicarPerfil({ ...loadAutopecasPerfil(user.id), ...remote })
      } catch {
        /* mantém local */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setOk(false)

    const nf = nomeFantasia.trim()
    const rz = razaoSocial.trim()
    const cnpjDigits = onlyDigits(cnpj)
    const telDigits = onlyDigits(telefone)
    const endTrim = endereco.trim()
    const cid = cidade.trim()
    const at = atuacao.trim()

    if (!nf) {
      setErro('Informe o nome fantasia.')
      return
    }
    if (!rz) {
      setErro('Informe a razão social.')
      return
    }
    if (cnpjDigits.length !== 14) {
      setErro('Informe um CNPJ válido (14 dígitos).')
      return
    }
    if (telDigits.length < 10 || telDigits.length > 11) {
      setErro('Informe um telefone com DDD (10 ou 11 dígitos).')
      return
    }
    if (!endTrim) {
      setErro('Informe o endereço.')
      return
    }
    if (!cid) {
      setErro('Informe a cidade.')
      return
    }
    if (!estado) {
      setErro('Selecione o estado (UF).')
      return
    }
    if (!at) {
      setErro('Informe a área de atuação / especialidade.')
      return
    }

    const payload = {
      nomeFantasia: nf,
      razaoSocial: rz,
      cnpj: formatCnpj(cnpjDigits),
      telefone: formatTel(telDigits),
      endereco: endTrim,
      cidade: cid,
      estado,
      atuacao: at,
    }

    saveAutopecasPerfil(user.id, payload)
    updateUser({ nome: nf })
    try {
      const tok = getStoredToken()
      if (tok) await pushPerfilToApi(payload, tok)
    } catch {
      /* offline / API fora */
    }
    setOk(true)
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-7.5rem)] w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <UserCircle className="h-8 w-8 text-brand-cyan-deep shrink-0" strokeWidth={2} aria-hidden />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Meu perfil</h1>
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-4 shrink-0 w-full">
        Dados da loja para oficinas e motoristas identificarem sua autopeças com segurança.
      </p>

      <section className="flex-1 flex flex-col w-full min-w-0 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <h2 className="text-sm font-semibold text-slate-800">Dados da empresa</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 flex-1 flex flex-col w-full min-w-0">
          <div>
            <label htmlFor="ap-nf" className="block text-xs font-medium text-slate-600 mb-1">
              Nome fantasia
              <ReqMark />
            </label>
            <input
              id="ap-nf"
              value={nomeFantasia}
              onChange={(e) => setNomeFantasia(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              autoComplete="organization"
            />
          </div>
          <div>
            <label htmlFor="ap-rz" className="block text-xs font-medium text-slate-600 mb-1">
              Razão social
              <ReqMark />
            </label>
            <input
              id="ap-rz"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <PerfilEmailReadonly id="ap-email" email={user?.email} role={user?.role} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label htmlFor="ap-cnpj" className="block text-xs font-medium text-slate-600 mb-1">
                CNPJ
                <ReqMark />
              </label>
              <input
                id="ap-cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(formatCnpj(onlyDigits(e.target.value)))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                inputMode="numeric"
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
            </div>
            <div>
              <label htmlFor="ap-tel" className="block text-xs font-medium text-slate-600 mb-1">
                Telefone
                <ReqMark />
              </label>
              <input
                id="ap-tel"
                value={telefone}
                onChange={(e) => setTelefone(formatTel(onlyDigits(e.target.value)))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                inputMode="tel"
                placeholder="(00) 00000-0000"
                maxLength={16}
              />
            </div>
          </div>
          <div>
            <label htmlFor="ap-end" className="block text-xs font-medium text-slate-600 mb-1">
              Endereço
              <ReqMark />
            </label>
            <input
              id="ap-end"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Rua, número, bairro, CEP"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label htmlFor="ap-cid" className="block text-xs font-medium text-slate-600 mb-1">
                Cidade
                <ReqMark />
              </label>
              <input
                id="ap-cid"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="ap-uf" className="block text-xs font-medium text-slate-600 mb-1">
                Estado (UF)
                <ReqMark />
              </label>
              <select
                id="ap-uf"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
              >
                <option value="">Selecione</option>
                {UFS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="ap-atu" className="block text-xs font-medium text-slate-600 mb-1">
              Área de atuação
              <ReqMark />
            </label>
            <textarea
              id="ap-atu"
              value={atuacao}
              onChange={(e) => setAtuacao(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-y min-h-[5rem]"
              placeholder="Ex.: peças originais, funilaria, elétrica, motores…"
            />
          </div>

          {erro ? <p className="text-sm text-red-600">{erro}</p> : null}
          {ok ? <p className="text-sm text-emerald-700">Perfil salvo com sucesso.</p> : null}

          <div className="pt-2 mt-auto">
            <button
              type="submit"
              className="rounded-lg bg-brand-rose text-slate-900 font-semibold text-sm px-5 py-2.5 shadow-sm ring-1 ring-brand-rose-deep/30 hover:bg-brand-rose-deep/90"
            >
              Salvar perfil
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
