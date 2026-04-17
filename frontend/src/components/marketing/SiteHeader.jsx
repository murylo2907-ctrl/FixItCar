import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { defaultDashboardPath } from '../../lib/dashboardPaths.js'
import NotificationBell from './NotificationBell.jsx'

export default function SiteHeader({ anchorPrefix = '' }) {
  const { isAuthenticated, user, logout } = useAuth()
  const painel = user?.role ? defaultDashboardPath(user.role) : '/dashboard'
  const rotuloConta = user?.nome?.trim() || user?.email?.split('@')[0] || 'Painel'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 text-slate-900 font-semibold shrink-0 group"
        >
          <span
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-rose shadow-md shadow-brand-cyan/20 ring-2 ring-white group-hover:scale-[1.02] transition-transform"
            aria-hidden
          />
          <span className="text-base tracking-tight">FixIt Car</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm text-slate-600">
          <a
            href={`${anchorPrefix}#quem-somos`}
            className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            Quem somos
          </a>
          <Link to="/servicos" className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
            Serviços
          </Link>
          <a
            href={`${anchorPrefix}#contato`}
            className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            Contato
          </a>
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2 text-sm">
          {isAuthenticated ? (
            <>
              <Link
                to={painel}
                title={user?.nome ? `${user.nome} — ${user.email}` : user?.email || 'Meu painel'}
                className="font-semibold text-brand-cyan-deep hover:text-brand-cyan-deep/90 whitespace-nowrap max-w-[9rem] sm:max-w-[13rem] truncate inline-block px-2 py-1.5 rounded-lg hover:bg-brand-cyan/25 transition-colors"
              >
                {rotuloConta}
              </Link>
              <NotificationBell layout="site" />
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 hover:border-slate-300 whitespace-nowrap text-sm font-medium shadow-sm transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-medium text-slate-700 hover:text-slate-900 whitespace-nowrap px-2 py-1.5 rounded-lg hover:bg-slate-100"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 text-white font-semibold px-4 py-2 hover:from-slate-800 hover:to-slate-700 shadow-md shadow-slate-900/15 whitespace-nowrap text-sm transition-all"
              >
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
