const home = {
  motorista: '/dashboard/motorista/carros',
  mecanico: '/dashboard/oficina/ordens',
  autopecas: '/dashboard/autopecas/cotacoes',
  seguradora: '/dashboard/seguradora/sinistros',
  administrador: '/dashboard/admin/motoristas',
}

export function defaultDashboardPath(role) {
  return home[role] || '/login'
}
