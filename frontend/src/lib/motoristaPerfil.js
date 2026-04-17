const STORAGE = 'fixitcar_motorista_perfil_v1'

function onlyDigits(s) {
  return String(s || '').replace(/\D/g, '')
}

const empty = () => ({
  nome: '',
  cpf: '',
  telefone: '',
  dataNascimento: '',
  localizacao: '',
  cidade: '',
  estado: '',
})

export function loadMotoristaPerfil(userId) {
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

export function saveMotoristaPerfil(userId, perfil) {
  if (userId == null) return
  try {
    const raw = localStorage.getItem(STORAGE)
    const all = raw ? JSON.parse(raw) : {}
    if (typeof all !== 'object' || all === null || Array.isArray(all)) {
      localStorage.setItem(STORAGE, JSON.stringify({ [String(userId)]: { ...empty(), ...perfil } }))
      return
    }
    all[String(userId)] = { ...loadMotoristaPerfil(userId), ...perfil }
    localStorage.setItem(STORAGE, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

/**
 * Mesmas regras obrigatórias de {@link MeuPerfilMotoristaPage} — necessário para abrir chamado.
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function motoristaPerfilCompletoParaChamado(userId, user) {
  if (userId == null) {
    return { ok: false, message: 'Não foi possível validar o perfil. Faça login novamente.' }
  }
  const p = loadMotoristaPerfil(userId)
  const nomeTrim = String(p.nome || user?.nome || '').trim()
  const cpfDigits = onlyDigits(p.cpf)
  const telDigits = onlyDigits(p.telefone)
  const locTrim = String(p.localizacao || '').trim()
  const cidadeTrim = String(p.cidade || '').trim()
  const estado = String(p.estado || '').trim()
  const dataNascimento = String(p.dataNascimento || '').trim()

  if (!nomeTrim) {
    return { ok: false, message: 'Preencha o nome completo em Meu perfil antes de abrir um chamado.' }
  }
  if (cpfDigits.length !== 11) {
    return { ok: false, message: 'Informe um CPF válido (11 dígitos) em Meu perfil antes de abrir um chamado.' }
  }
  if (telDigits.length < 10 || telDigits.length > 11) {
    return {
      ok: false,
      message: 'Informe um telefone com DDD (10 ou 11 dígitos) em Meu perfil antes de abrir um chamado.',
    }
  }
  if (!dataNascimento) {
    return { ok: false, message: 'Informe a data de nascimento em Meu perfil antes de abrir um chamado.' }
  }
  if (!locTrim) {
    return {
      ok: false,
      message: 'Informe a localização em Meu perfil antes de abrir um chamado.',
    }
  }
  if (!cidadeTrim) {
    return { ok: false, message: 'Informe a cidade em Meu perfil antes de abrir um chamado.' }
  }
  if (!estado) {
    return { ok: false, message: 'Selecione o estado (UF) em Meu perfil antes de abrir um chamado.' }
  }
  return { ok: true }
}
