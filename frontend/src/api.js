import { loadRegisteredUsers } from './lib/localRegistry.js'
import { inferRoleFromEmail } from './lib/inferRole.js'

const roleLabels = {
  motorista: 'Motorista',
  mecanico: 'Oficina / Mecânica',
  autopecas: 'Autopeças',
  seguradora: 'Seguradora',
}

/**
 * Perfil efetivo no login: respeita o cadastro local. A heurística por domínio do e-mail
 * só entra se o registro antigo não tiver `role`.
 */
function resolveRole(row, perfilSelect) {
  const registered = row.role && typeof row.role === 'string' ? row.role : inferRoleFromEmail(row.email)
  if (!perfilSelect || perfilSelect === 'auto') {
    return registered
  }
  if (perfilSelect !== registered) {
    const esperado = roleLabels[registered] || registered
    throw new Error(
      `Este e-mail está cadastrado como ${esperado}. Ajuste «Perfil de acesso» ou use «Detectar pelo e-mail».`
    )
  }
  return registered
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
  const role = resolveRole(row, perfilSelect)
  const token = btoa(JSON.stringify({ sub: row.id, email: row.email, role, t: Date.now() }))
  const user = {
    id: row.id,
    email: row.email,
    nome: row.nome,
    role,
  }
  return { token, user }
}
