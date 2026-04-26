const STORAGE = 'fixitcar_mecanico_perfil_v1'

const empty = () => ({
  nome: '',
  cpf: '',
  telefone: '',
  dataNascimento: '',
  localizacao: '',
  cidade: '',
  estado: '',
  nomeOficina: '',
  anoFundacao: '',
  cnpj: '',
  enderecoOficina: '',
  servicosEspecializacao: '',
  descricaoOficina: '',
  fornecedoresParceiros: '',
  chavePix: '',
  bancoRecebimento: '',
})

export function loadMecanicoPerfil(userId) {
  if (userId == null) return empty()
  try {
    const raw = localStorage.getItem(STORAGE)
    const all = raw ? JSON.parse(raw) : {}
    const row = all[String(userId)]
    if (!row || typeof row !== 'object') return empty()
    return { ...empty(), ...row }
  } catch {
    return empty()
  }
}

export function saveMecanicoPerfil(userId, perfil) {
  if (userId == null) return
  try {
    const raw = localStorage.getItem(STORAGE)
    const all = raw ? JSON.parse(raw) : {}
    if (typeof all !== 'object' || all === null || Array.isArray(all)) {
      localStorage.setItem(STORAGE, JSON.stringify({ [String(userId)]: { ...empty(), ...perfil } }))
      return
    }
    all[String(userId)] = { ...loadMecanicoPerfil(userId), ...perfil }
    localStorage.setItem(STORAGE, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}
