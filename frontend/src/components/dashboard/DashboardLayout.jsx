import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { defaultDashboardPath } from '../../lib/dashboardPaths.js'

const linkCls = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-cyan/35 text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`

const navByRole = {
  motorista: [
    { to: '/dashboard/motorista/carros', label: 'Meus carros' },
    { to: '/dashboard/motorista/orcamentos', label: 'Aprovar orçamento' },
    { to: '/dashboard/motorista/historico', label: 'Histórico' },
    { to: '/dashboard/motorista/perfil', label: 'Meu perfil' },
  ],
  mecanico: [
    { to: '/dashboard/oficina/entrada', label: 'Entrada de veículos' },
    { to: '/dashboard/oficina/ordens', label: 'Ordens de serviço' },
    { to: '/dashboard/oficina/historico', label: 'Histórico' },
    { to: '/dashboard/oficina/pecas', label: 'Solicitar peças' },
    { to: '/dashboard/oficina/perfil', label: 'Meu perfil' },
  ],
  autopecas: [
    { to: '/dashboard/autopecas/cotacoes', label: 'Cotações recebidas' },
    { to: '/dashboard/autopecas/vendidos', label: 'Pedidos vendidos' },
  ],
  seguradora: [
    { to: '/dashboard/seguradora/sinistros', label: 'Sinistros' },
    { to: '/dashboard/seguradora/aprovacoes', label: 'Concluídos (seguro)' },
    { to: '/dashboard/seguradora/cadastro-veiculos', label: 'Cadastro de carros' },
    { to: '/dashboard/seguradora/historico', label: 'Histórico de sinistros' },
  ],
}

export default function DashboardLayout() {
  const { user, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user?.role) {
    return <Navigate to="/login" replace />
  }

  const items = navByRole[user.role] || []
  const home = defaultDashboardPath(user.role)

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <NavLink to={home} className="inline-flex items-center gap-2 text-slate-900 font-semibold shrink-0">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-rose shadow-sm ring-1 ring-slate-200/60" />
            <span className="hidden xs:inline">FixIt Car</span>
          </NavLink>
          <span className="text-sm text-slate-500 truncate hidden sm:inline">
            {user.nome ? <span className="text-slate-800 font-medium">{user.nome}</span> : user.email}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <NavLink to="/" className="text-sm text-slate-600 hover:text-slate-900 hidden sm:inline">
            Site
          </NavLink>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Sair
          </button>
        </div>
      </header>
      <div className="flex-1 flex flex-col md:flex-row max-w-[1400px] w-full mx-auto">
        <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 bg-white md:bg-slate-50/80 p-3 md:p-4">
          <nav className="flex md:flex-col flex-wrap gap-1">
            {items.map((it) => (
              <NavLink key={it.to} to={it.to} className={linkCls}>
                {it.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
