import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { defaultDashboardPath } from '../../lib/dashboardPaths.js'

export default function SiteHeader({ anchorPrefix = '' }) {
  const { isAuthenticated, user, logout } = useAuth()
  const painel = user?.role ? defaultDashboardPath(user.role) : '/dashboard'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-900 font-semibold shrink-0">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-rose shadow-sm ring-1 ring-slate-200/60" aria-hidden />
          FixIt Car
        </Link>
        <nav className="hidden sm:flex items-center gap-5 text-sm text-slate-700">
          <a href={`${anchorPrefix}#quem-somos`} className="hover:text-brand-cyan-deep">
            Quem somos
          </a>
          <Link to="/servicos" className="hover:text-brand-cyan-deep">
            Serviços
          </Link>
          <a href={`${anchorPrefix}#contato`} className="hover:text-brand-cyan-deep">
            Contato
          </a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3 text-sm">
          {isAuthenticated ? (
            <>
              <Link to={painel} className="font-medium text-brand-cyan-deep hover:underline whitespace-nowrap">
                Painel
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-medium text-slate-700 hover:text-slate-900 whitespace-nowrap">
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="rounded-lg bg-slate-900 text-white font-semibold px-3 py-1.5 hover:bg-slate-800 whitespace-nowrap"
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
