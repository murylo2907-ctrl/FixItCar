import { useEffect, useState } from 'react'
import { UserCircle } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth.js'
import { loadMecanicoPerfil, saveMecanicoPerfil } from '../../../lib/mecanicoPerfil.js'

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const ANO_ATUAL = new Date().getFullYear()

function onlyDigits(s) {
  return String(s || '').replace(/\D/g, '')
}

function formatCpf(digits) {
  const d = digits.slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
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

export default function MeuPerfilOficinaPage() {
  const { user, updateUser } = useAuth()
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [telefone, setTelefone] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [nomeOficina, setNomeOficina] = useState('')
  const [anoFundacao, setAnoFundacao] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [enderecoOficina, setEnderecoOficina] = useState('')
  const [servicosEspecializacao, setServicosEspecializacao] = useState('')
  const [descricaoOficina, setDescricaoOficina] = useState('')
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    const p = loadMecanicoPerfil(user.id)
    setNome(p.nome || user.nome || '')
    setCpf(p.cpf ? formatCpf(onlyDigits(p.cpf)) : '')
    setTelefone(p.telefone ? formatTel(onlyDigits(p.telefone)) : '')
    setDataNascimento(p.dataNascimento || '')
    setLocalizacao(p.localizacao || '')
    setCidade(p.cidade || '')
    setEstado(p.estado || '')
    setNomeOficina(p.nomeOficina || '')
    setAnoFundacao(p.anoFundacao != null && p.anoFundacao !== '' ? String(p.anoFundacao) : '')
    setCnpj(p.cnpj ? formatCnpj(onlyDigits(p.cnpj)) : '')
    setEnderecoOficina(p.enderecoOficina || '')
    setServicosEspecializacao(p.servicosEspecializacao || '')
    setDescricaoOficina(p.descricaoOficina || '')
  }, [user?.id, user?.nome])

  function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setOk(false)

    const nomeTrim = nome.trim()
    const cpfDigits = onlyDigits(cpf)
    const telDigits = onlyDigits(telefone)
    const locTrim = localizacao.trim()
    const cidadeTrim = cidade.trim()

    if (!nomeTrim) {
      setErro('Informe o nome.')
      return
    }
    if (cpfDigits.length !== 11) {
      setErro('Informe um CPF válido (11 dígitos).')
      return
    }
    if (telDigits.length < 10 || telDigits.length > 11) {
      setErro('Informe um telefone com DDD (10 ou 11 dígitos).')
      return
    }
    if (!dataNascimento) {
      setErro('Informe a data de nascimento.')
      return
    }
    if (!locTrim) {
      setErro('Informe a localização (bairro, endereço ou referência).')
      return
    }
    if (!cidadeTrim) {
      setErro('Informe a cidade.')
      return
    }
    if (!estado) {
      setErro('Selecione o estado (UF).')
      return
    }

    const nomeOficinaTrim = nomeOficina.trim()
    const anoNum = Number(anoFundacao)
    const cnpjDigits = onlyDigits(cnpj)
    const endTrim = enderecoOficina.trim()
    const servTrim = servicosEspecializacao.trim()
    const descTrim = descricaoOficina.trim()

    if (!nomeOficinaTrim) {
      setErro('Informe o nome da oficina.')
      return
    }
    if (!Number.isFinite(anoNum) || !Number.isInteger(anoNum) || anoNum < 1900 || anoNum > ANO_ATUAL) {
      setErro(`Informe um ano válido (${1900} a ${ANO_ATUAL}).`)
      return
    }
    if (cnpjDigits.length !== 14) {
      setErro('Informe um CNPJ válido (14 dígitos).')
      return
    }
    if (!endTrim) {
      setErro('Informe o endereço da oficina.')
      return
    }
    if (!servTrim) {
      setErro('Informe serviços e especialização.')
      return
    }
    if (!descTrim) {
      setErro('Informe a descrição da oficina.')
      return
    }

    const payload = {
      nome: nomeTrim,
      cpf: formatCpf(cpfDigits),
      telefone: formatTel(telDigits),
      dataNascimento,
      localizacao: locTrim,
      cidade: cidadeTrim,
      estado,
      nomeOficina: nomeOficinaTrim,
      anoFundacao: String(anoNum),
      cnpj: formatCnpj(cnpjDigits),
      enderecoOficina: endTrim,
      servicosEspecializacao: servTrim,
      descricaoOficina: descTrim,
    }

    saveMecanicoPerfil(user.id, payload)
    updateUser(payload)
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
        Preencha seus dados para contato com motoristas, autopeças e seguradoras quando necessário.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-6 w-full min-w-0">
        <section className="flex flex-col w-full min-w-0 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
            <h2 className="text-sm font-semibold text-slate-800">Dados pessoais</h2>
          </div>
          <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="perfil-of-nome" className="block text-xs font-medium text-slate-600 mb-1">
                Nome completo
                <ReqMark />
              </label>
              <input
                id="perfil-of-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="perfil-of-email" className="block text-xs font-medium text-slate-600 mb-1">
                E-mail
              </label>
              <input
                id="perfil-of-email"
                type="email"
                value={user?.email ?? ''}
                readOnly
                aria-readonly="true"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 cursor-default"
                autoComplete="email"
              />
              <p className="mt-1 text-xs text-slate-500">Preenchido automaticamente com o e-mail da sua conta de login.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label htmlFor="perfil-of-cpf" className="block text-xs font-medium text-slate-600 mb-1">
                  CPF
                  <ReqMark />
                </label>
                <input
                  id="perfil-of-cpf"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(onlyDigits(e.target.value)))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="perfil-of-tel" className="block text-xs font-medium text-slate-600 mb-1">
                  Telefone
                  <ReqMark />
                </label>
                <input
                  id="perfil-of-tel"
                  value={telefone}
                  onChange={(e) => setTelefone(formatTel(onlyDigits(e.target.value)))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                  inputMode="tel"
                  placeholder="(00) 00000-0000"
                  maxLength={16}
                  autoComplete="tel"
                />
              </div>
              <div>
                <label htmlFor="perfil-of-nasc" className="block text-xs font-medium text-slate-600 mb-1">
                  Data de nascimento
                </label>
                <input
                  id="perfil-of-nasc"
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm min-h-[2.5rem]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="perfil-of-loc" className="block text-xs font-medium text-slate-600 mb-1">
                Localização
                <ReqMark />
              </label>
              <input
                id="perfil-of-loc"
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Bairro, rua ou ponto de referência"
                autoComplete="street-address"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label htmlFor="perfil-of-cidade" className="block text-xs font-medium text-slate-600 mb-1">
                  Cidade
                  <ReqMark />
                </label>
                <input
                  id="perfil-of-cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  autoComplete="address-level2"
                />
              </div>
              <div>
                <label htmlFor="perfil-of-uf" className="block text-xs font-medium text-slate-600 mb-1">
                  Estado (UF)
                  <ReqMark />
                </label>
                <select
                  id="perfil-of-uf"
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
          </div>
        </section>

        <section className="flex flex-col w-full min-w-0 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
            <h2 className="text-sm font-semibold text-slate-800">Dados da oficina</h2>
          </div>
          <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="perfil-of-nome-of" className="block text-xs font-medium text-slate-600 mb-1">
                Nome da oficina
                <ReqMark />
              </label>
              <input
                id="perfil-of-nome-of"
                value={nomeOficina}
                onChange={(e) => setNomeOficina(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                autoComplete="organization"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label htmlFor="perfil-of-ano" className="block text-xs font-medium text-slate-600 mb-1">
                  Ano
                  <ReqMark />
                </label>
                <input
                  id="perfil-of-ano"
                  type="number"
                  min={1900}
                  max={ANO_ATUAL}
                  step={1}
                  value={anoFundacao}
                  onChange={(e) => setAnoFundacao(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                  placeholder="Ex.: 2015"
                />
              </div>
              <div>
                <label htmlFor="perfil-of-cnpj" className="block text-xs font-medium text-slate-600 mb-1">
                  CNPJ
                  <ReqMark />
                </label>
                <input
                  id="perfil-of-cnpj"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCnpj(onlyDigits(e.target.value)))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                  inputMode="numeric"
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  autoComplete="off"
                />
              </div>
            </div>
            <div>
              <label htmlFor="perfil-of-end" className="block text-xs font-medium text-slate-600 mb-1">
                Endereço
                <ReqMark />
              </label>
              <input
                id="perfil-of-end"
                value={enderecoOficina}
                onChange={(e) => setEnderecoOficina(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Rua, número, bairro, CEP, cidade"
                autoComplete="street-address"
              />
            </div>
            <div>
              <label htmlFor="perfil-of-serv" className="block text-xs font-medium text-slate-600 mb-1">
                Serviços e especialização
                <ReqMark />
              </label>
              <textarea
                id="perfil-of-serv"
                value={servicosEspecializacao}
                onChange={(e) => setServicosEspecializacao(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-y min-h-[5rem]"
                placeholder="Ex.: mecânica geral, alinhamento, elétrica, funilaria…"
              />
            </div>
            <div>
              <label htmlFor="perfil-of-desc" className="block text-xs font-medium text-slate-600 mb-1">
                Descrição
                <ReqMark />
              </label>
              <textarea
                id="perfil-of-desc"
                value={descricaoOficina}
                onChange={(e) => setDescricaoOficina(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-y min-h-[5rem]"
                placeholder="Breve apresentação da oficina, diferenciais, horários…"
              />
            </div>
          </div>
        </section>

        {erro ? <p className="text-sm text-red-600">{erro}</p> : null}
        {ok ? <p className="text-sm text-emerald-700">Perfil salvo com sucesso.</p> : null}

        <div className="pt-1">
          <button
            type="submit"
            className="rounded-lg bg-brand-rose text-slate-900 font-semibold text-sm px-5 py-2.5 shadow-sm ring-1 ring-brand-rose-deep/30 hover:bg-brand-rose-deep/90"
          >
            Salvar perfil
          </button>
        </div>
      </form>
    </div>
  )
}
