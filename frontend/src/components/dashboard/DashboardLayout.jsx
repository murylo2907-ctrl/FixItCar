import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { servicoLabelForRole } from '../../lib/perfilTipoConta.js'
import NotificationBell from '../marketing/NotificationBell.jsx'

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
    { to: '/dashboard/autopecas/vendidos', label: 'Histórico de peças' },
    { to: '/dashboard/autopecas/perfil', label: 'Meu perfil' },
  ],
  seguradora: [
    { to: '/dashboard/seguradora/sinistros', label: 'Sinistros' },
    { to: '/dashboard/seguradora/aprovacoes', label: 'Concluídos (seguro)' },
    { to: '/dashboard/seguradora/cadastro-veiculos', label: 'Cadastro de carros' },
    { to: '/dashboard/seguradora/historico', label: 'Histórico de sinistros' },
    { to: '/dashboard/seguradora/perfil', label: 'Meu perfil' },
  ],
}

export default function DashboardLayout() {
  const { user, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user?.role) {
    return <Navigate to="/login" replace />
  }

  const items = navByRole[user.role] || []
  const servico = servicoLabelForRole(user.role)

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col w-full">
      <header className="border-b border-slate-200 bg-white px-4 sm:px-6 py-3 flex items-center justify-between gap-3 w-full shrink-0 shadow-sm/50">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <NavLink to="/" className="inline-flex items-center gap-2 text-slate-900 font-semibold shrink-0 min-w-0">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-rose shadow-sm ring-1 ring-slate-200/60 shrink-0" />
            <span className="truncate">FixIt Car</span>
          </NavLink>
          {user.email ? (
            <div
              className="min-w-0 pl-3 sm:pl-4 border-l border-slate-200 max-w-[min(14rem,40vw)] sm:max-w-xs"
              title={servico ? `${user.email} · ${servico}` : user.email}
            >
              <p className="text-xs sm:text-sm font-medium text-slate-800 truncate leading-tight">{user.email}</p>
              {servico ? (
                <p className="text-[10px] sm:text-[11px] text-slate-500 truncate leading-snug mt-0.5">{servico}</p>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <NotificationBell />
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Sair
          </button>
        </div>
      </header>
      <div className="flex-1 flex flex-col md:flex-row w-full min-w-0">
        <aside className="md:w-56 lg:w-60 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 bg-white md:bg-slate-50/80 p-3 md:p-4 w-full md:w-auto">
          <nav className="flex md:flex-col flex-wrap gap-1 w-full">
            {items.map((it) => (
              <NavLink key={it.to} to={it.to} className={linkCls}>
                {it.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:px-8 lg:py-8 min-w-0 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
