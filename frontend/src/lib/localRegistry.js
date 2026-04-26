const KEY = 'fixitcar_registros_v1'

export const ROLE_ADMIN = 'administrador'

export function loadRegisteredUsers() {
  try {
    const raw = localStorage.getItem(KEY)
    const p = raw ? JSON.parse(raw) : []
    return Array.isArray(p) ? p : []
  } catch {
    return []
  }
}

function persist(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

/** Perfil salvo no cadastro local, se o e-mail existir. */
export function getRegisteredRoleForEmail(email) {
  const e = String(email || '').toLowerCase().trim()
  if (!e) return null
  const row = loadRegisteredUsers().find((u) => u.email === e)
  return row?.role && typeof row.role === 'string' ? row.role : null
}

export function getRegisteredUserById(id) {
  if (id == null) return null
  const n = Number(id)
  return loadRegisteredUsers().find((u) => Number(u.id) === n || String(u.id) === String(id)) ?? null
}

export function saveRegisteredUser({ nome, email, senha, role }) {
  const list = loadRegisteredUsers()
  const id = 10000 + Date.now() % 900000
  const row = {
    id,
    nome: String(nome || '').trim(),
    email: String(email || '').toLowerCase().trim(),
    senha: String(senha).trim(),
    role,
  }
  if (!row.nome || !row.email || !row.senha || !row.role) return { ok: false, message: 'Preencha todos os campos.' }
  if (list.some((u) => u.email === row.email)) return { ok: false, message: 'Este e-mail já está cadastrado.' }
  list.push(row)
  persist(list)
  return { ok: true }
}

/**
 * Atualiza cadastro local. Senha: omita ou string vazia para manter a atual.
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function updateRegisteredUser(id, patch) {
  const list = loadRegisteredUsers()
  const idx = list.findIndex((u) => Number(u.id) === Number(id))
  if (idx === -1) return { ok: false, message: 'Usuário não encontrado.' }

  const prev = list[idx]
  const emailNext =
    patch.email !== undefined ? String(patch.email || '').toLowerCase().trim() : prev.email
  if (!emailNext) return { ok: false, message: 'Informe um e-mail válido.' }

  const emailDupe = list.some((u, i) => i !== idx && u.email === emailNext)
  if (emailDupe) return { ok: false, message: 'Este e-mail já está cadastrado para outro usuário.' }

  const nomeNext = patch.nome !== undefined ? String(patch.nome || '').trim() : prev.nome
  if (!nomeNext) return { ok: false, message: 'Informe o nome.' }

  let senhaNext = prev.senha
  if (patch.senha !== undefined && String(patch.senha).length > 0) {
    senhaNext = String(patch.senha)
  }

  const roleNext = patch.role !== undefined ? patch.role : prev.role
  if (!roleNext || typeof roleNext !== 'string') return { ok: false, message: 'Perfil inválido.' }

  list[idx] = {
    ...prev,
    nome: nomeNext,
    email: emailNext,
    senha: senhaNext,
    role: roleNext,
  }
  persist(list)
  return { ok: true }
}

/**
 * Remove usuário do cadastro local.
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function removeRegisteredUser(id) {
  const list = loadRegisteredUsers()
  const idx = list.findIndex((u) => Number(u.id) === Number(id))
  if (idx === -1) return { ok: false, message: 'Usuário não encontrado.' }

  const row = list[idx]
  const admins = list.filter((u) => u.role === ROLE_ADMIN)
  if (row.role === ROLE_ADMIN && admins.length <= 1) {
    return { ok: false, message: 'Não é possível remover o último administrador.' }
  }

  list.splice(idx, 1)
  persist(list)
  return { ok: true }
}

export function countRegisteredAdmins() {
  return loadRegisteredUsers().filter((u) => u.role === ROLE_ADMIN).length
}

/** Demo: garante um administrador padrão se o e-mail ainda não existir no cadastro local. */
export function ensureSeedAdministrador() {
  const email = 'admim@gmail.com'
  const list = loadRegisteredUsers()
  if (list.some((u) => u.email === email)) return
  const maxId = list.reduce((m, u) => Math.max(m, Number(u.id) || 0), 0)
  list.push({
    id: maxId + 1,
    nome: 'Administrador',
    email,
    senha: '@admim',
    role: ROLE_ADMIN,
  })
  persist(list)
}

/** Demo: conta Autopeças com e-mail pessoal (Gmail não infere perfil). */
export function ensureSeedAutopcsDemo() {
  const email = 'pedro@gmail.com'
  const list = loadRegisteredUsers()
  if (list.some((u) => u.email === email)) return
  const maxId = list.reduce((m, u) => Math.max(m, Number(u.id) || 0), 0)
  list.push({
    id: maxId + 1,
    nome: 'Pedro',
    email,
    senha: '123456789',
    role: 'autopecas',
  })
  persist(list)
}
