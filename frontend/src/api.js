import { loadRegisteredUsers } from './lib/localRegistry.js'
import { inferRoleFromEmail } from './lib/inferRole.js'

function resolveRole(email, perfilSelect) {
  if (perfilSelect && perfilSelect !== 'auto') return perfilSelect
  return inferRoleFromEmail(email)
}

/** Login demo: usuários cadastrados em localStorage (localRegistry). */
export async function apiLogin(email, senha, perfilSelect) {
  const list = loadRegisteredUsers()
  const row = list.find(
    (u) => u.email === String(email || '').toLowerCase().trim() && u.senha === String(senha)
  )
  if (!row) {
    throw new Error('E-mail ou senha incorretos.')
  }
  const role = resolveRole(row.email, perfilSelect)
  const token = btoa(JSON.stringify({ sub: row.id, email: row.email, role, t: Date.now() }))
  const user = {
    id: row.id,
    email: row.email,
    nome: row.nome,
    role,
  }
  return { token, user }
}
