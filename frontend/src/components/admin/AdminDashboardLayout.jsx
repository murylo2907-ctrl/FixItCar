import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { Users, Warehouse, Package, Landmark, MessageSquare } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { servicoLabelForRole } from '../../lib/perfilTipoConta.js'

const adminNav = [
  { to: '/dashboard/admin/motoristas', label: 'Motoristas', icon: Users },
  { to: '/dashboard/admin/mecanicos', label: 'Oficina / Mecânica', icon: Warehouse },
  { to: '/dashboard/admin/autopecas', label: 'Autopeças', icon: Package },
  { to: '/dashboard/admin/seguradoras', label: 'Seguradoras', icon: Landmark },
  { to: '/dashboard/admin/mensagens', label: 'Mensagens', icon: MessageSquare },
]

const adminLinkCls = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-violet-600 text-white shadow-sm'
      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
  }`

/** Painel administrador: sidebar escura e área de conteúdo (demo local). */
export default function AdminDashboardLayout() {
  const { user, logout } = useAuth()
  const servico = servicoLabelForRole(user?.role)

  if (user?.role !== 'administrador') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen flex w-full bg-slate-100">
      <aside className="w-56 lg:w-60 shrink-0 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <NavLink to="/" className="inline-flex items-center gap-2 font-semibold text-white">
            <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-brand-rose shadow-md shrink-0" />
            <span className="leading-tight">
              FixIt Car
              <span className="block text-[10px] font-normal text-slate-400 uppercase tracking-wide mt-0.5">
                Administração
              </span>
            </span>
          </NavLink>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminNav.map((it) => (
            <NavLink key={it.to} to={it.to} end={false} className={adminLinkCls}>
              <it.icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500">
          Cadastros neste navegador — demonstração.
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-slate-200 bg-white px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0 shadow-sm/50">
          <div className="min-w-0 flex-1">
            {user.email ? (
              <div className="max-w-md">
                <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">{user.email}</p>
                {servico ? (
                  <p className="text-[10px] sm:text-[11px] text-slate-500 truncate mt-0.5">{servico}</p>
                ) : null}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 shrink-0"
          >
            Sair
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:px-8 lg:py-8 min-w-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
