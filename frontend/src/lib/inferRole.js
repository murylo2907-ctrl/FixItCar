/**
 * E-mails pessoais (Gmail, Hotmail, etc.): não dá para inferir o perfil pelo domínio.
 * Evita sugerir "Motorista" para quem é autopeças / outro perfil cadastrado.
 */
const DOMINIOS_EMAIL_PESSOAL = new Set([
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'yahoo.com',
  'yahoo.com.br',
  'uol.com.br',
  'bol.com.br',
  'terra.com.br',
  'protonmail.com',
  'proton.me',
])

/** Infere perfil a partir do domínio do e-mail (heurística para demo / cadastro local). */
export function inferRoleFromEmail(email) {
  const domain = String(email).split('@')[1]?.toLowerCase() || ''
  const local = String(email).split('@')[0]?.toLowerCase() || ''
  if (!domain) return null
  if (DOMINIOS_EMAIL_PESSOAL.has(domain)) return null
  if (/^(admin|root|painel)/.test(local) || /^admin\.|painel\.|intranet\./.test(domain)) return 'administrador'
  if (/oficina|mecan|garagem|taller|workshop/.test(domain)) return 'mecanico'
  if (/peca|autopecas|parts|distrib|fornec/.test(domain)) return 'autopecas'
  if (/segur|insurance|sinist|apolice/.test(domain)) return 'seguradora'
  return 'motorista'
}
