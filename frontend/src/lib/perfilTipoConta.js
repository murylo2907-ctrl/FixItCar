/** Rótulo do tipo de conta (serviço / perfil de acesso) para exibição nas telas de perfil. */
const MAP = {
  motorista: 'Motorista',
  mecanico: 'Oficina / Mecânica',
  autopecas: 'Autopeças',
  seguradora: 'Seguradora',
  administrador: 'Administrador',
}

export function servicoLabelForRole(role) {
  if (!role || typeof role !== 'string') return ''
  return MAP[role] || ''
}
