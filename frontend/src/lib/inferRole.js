/** Infere perfil a partir do domínio do e-mail (heurística para demo / cadastro local). */
export function inferRoleFromEmail(email) {
  const domain = String(email).split('@')[1]?.toLowerCase() || ''
  if (/oficina|mecan|garagem|taller|workshop/.test(domain)) return 'mecanico'
  if (/peca|autopecas|parts|distrib|fornec/.test(domain)) return 'autopecas'
  if (/segur|insurance|sinist|apolice/.test(domain)) return 'seguradora'
  return 'motorista'
}
