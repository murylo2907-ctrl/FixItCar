const STORAGE = 'fixitcar_autopecas_perfil_v1'

const empty = () => ({
  nomeFantasia: '',
  razaoSocial: '',
  cnpj: '',
  telefone: '',
  endereco: '',
  cidade: '',
  estado: '',
  atuacao: '',
})

export function loadAutopecasPerfil(userId) {
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

export function saveAutopecasPerfil(userId, perfil) {
  if (userId == null) return
  try {
    const raw = localStorage.getItem(STORAGE)
    const all = raw ? JSON.parse(raw) : {}
    if (typeof all !== 'object' || all === null || Array.isArray(all)) {
      localStorage.setItem(STORAGE, JSON.stringify({ [String(userId)]: { ...empty(), ...perfil } }))
      return
    }
    all[String(userId)] = { ...loadAutopecasPerfil(userId), ...perfil }
    localStorage.setItem(STORAGE, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}
