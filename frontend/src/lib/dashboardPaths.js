const home = {
  motorista: '/dashboard/motorista/carros',
  mecanico: '/dashboard/oficina/ordens',
  autopecas: '/dashboard/autopecas/cotacoes',
  seguradora: '/dashboard/seguradora/sinistros',
}

export function defaultDashboardPath(role) {
  return home[role] || '/login'
}
