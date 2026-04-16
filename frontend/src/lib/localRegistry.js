const KEY = 'fixitcar_registros_v1'

export function loadRegisteredUsers() {
  try {
    const raw = localStorage.getItem(KEY)
    const p = raw ? JSON.parse(raw) : []
    return Array.isArray(p) ? p : []
  } catch {
    return []
  }
}

export function saveRegisteredUser({ nome, email, senha, role }) {
  const list = loadRegisteredUsers()
  const id = 10000 + Date.now() % 900000
  const row = {
    id,
    nome: String(nome || '').trim(),
    email: String(email || '').toLowerCase().trim(),
    senha: String(senha),
    role,
  }
  if (!row.nome || !row.email || !row.senha || !row.role) return { ok: false, message: 'Preencha todos os campos.' }
  if (list.some((u) => u.email === row.email)) return { ok: false, message: 'Este e-mail já está cadastrado.' }
  list.push(row)
  localStorage.setItem(KEY, JSON.stringify(list))
  return { ok: true }
}
