import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import PasswordField from '../components/ui/PasswordField.jsx'
import { apiLogin } from '../api.js'
import { useAuth } from '../hooks/useAuth.js'
import { defaultDashboardPath } from '../lib/dashboardPaths.js'
import { inferRoleFromEmail } from '../lib/inferRole.js'
import { getRegisteredRoleForEmail } from '../lib/localRegistry.js'

const perfilOptions = [
  { value: 'auto', label: 'Detectar pelo e-mail' },
  { value: 'motorista', label: 'Motorista' },
  { value: 'mecanico', label: 'Oficina / Mecânica' },
  { value: 'autopecas', label: 'Autopeças' },
  { value: 'seguradora', label: 'Seguradora' },
]

function destinoPainel(fromPathname, role) {
  if (fromPathname && fromPathname.startsWith('/dashboard')) return fromPathname
  return role ? defaultDashboardPath(role) : '/dashboard'
}

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const registeredEmail = location.state?.registeredEmail
  const fromDash = location.state?.from?.pathname

  const [email, setEmail] = useState(registeredEmail || '')
  const [senha, setSenha] = useState('')
  const [perfil, setPerfil] = useState('auto')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user?.role) return
    navigate(destinoPainel(fromDash, user.role), { replace: true })
  }, [isAuthenticated, user, fromDash, navigate])

  const dicaInfer = email ? getRegisteredRoleForEmail(email) || inferRoleFromEmail(email) : null
  const dicaLabel = dicaInfer
    ? { motorista: 'Motorista', mecanico: 'Oficina / Mecânica', autopecas: 'Autopeças', seguradora: 'Seguradora' }[
        dicaInfer
      ]
    : ''

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const data = await apiLogin(email, senha, perfil)
      login(data.token, data.user)
      navigate(destinoPainel(fromDash, data.user?.role), { replace: true })
    } catch (err) {
      setErro(err.message || 'Não foi possível entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-900 font-semibold">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-rose shadow-sm ring-1 ring-slate-200/60" aria-hidden />
          FixIt Car
        </Link>
        <Link to="/cadastro" className="text-sm font-medium text-brand-cyan-deep hover:underline">
          Cadastrar
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-8 sm:p-9">
            <div className="flex items-center gap-2 mb-2">
              <LogIn className="h-6 w-6 text-brand-cyan-deep" strokeWidth={2} aria-hidden />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Entrar</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="perfil" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Perfil de acesso
                </label>
                <select
                  id="perfil"
                  value={perfil}
                  onChange={(e) => setPerfil(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-cyan-deep/40"
                >
                  {perfilOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {perfil === 'auto' && email && dicaLabel ? (
                  <p className="text-xs text-slate-500 mt-1.5">
                    {getRegisteredRoleForEmail(email) ? 'Perfil no cadastro' : 'Sugestão pelo domínio'}:{' '}
                    <span className="font-medium text-slate-700">{dicaLabel}</span>
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan-deep/40"
                />
              </div>
              <PasswordField
                id="senha"
                label="Senha"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              {erro ? <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{erro}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-slate-900 text-white font-semibold py-3 shadow-sm hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? 'Entrando…' : 'Entrar no painel'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
